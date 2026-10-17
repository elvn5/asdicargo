import { NotificationsService } from '@/notifications/notifications.service';
import { DocumentRequest, DocumentRequestStatus, NotificationType } from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import {
  ALLOWED_DOCUMENT_TYPES,
  type AdminDocumentsQuery,
  type CreateDocumentRequestDto,
  type RejectDocumentDto,
  type UploadedDocumentFile,
} from './document.dto';

const MAX_PENDING_DOCUMENTS = 10;

export interface DocumentFile {
  data: Buffer;
  name: string;
  mime: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentRequest)
    private readonly documents: Repository<DocumentRequest>,
    private readonly notifications: NotificationsService,
  ) {}

  // ---------------- Клиент ----------------

  findMine(userId: string): Promise<DocumentRequest[]> {
    return this.documents.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async create(userId: string, dto: CreateDocumentRequestDto): Promise<DocumentRequest> {
    const pending = await this.documents.count({
      where: { userId, status: DocumentRequestStatus.PENDING },
    });
    if (pending >= MAX_PENDING_DOCUMENTS) {
      throw new BadRequestException('Слишком много необработанных заказов документов');
    }
    const saved = await this.documents.save(
      this.documents.create({
        userId,
        type: dto.type,
        periodFrom: dto.periodFrom ?? null,
        periodTo: dto.periodTo ?? null,
        comment: dto.comment ?? null,
      }),
    );
    // Перечитываем, чтобы в ответе не было служебного fileData.
    return this.documents.findOneOrFail({ where: { id: saved.id } });
  }

  getMineFile(userId: string, id: string): Promise<DocumentFile> {
    return this.loadFile({ id, userId });
  }

  // ---------------- Админ ----------------

  findAll(query: AdminDocumentsQuery): Promise<DocumentRequest[]> {
    return this.documents.find({
      where: query.status ? { status: query.status } : {},
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async attachFile(id: string, file: UploadedDocumentFile | undefined): Promise<DocumentRequest> {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Допустимы PDF, JPG или PNG');
    }
    const doc = await this.findOne(id);
    await this.documents.update(doc.id, {
      status: DocumentRequestStatus.READY,
      fileName: sanitizeFileName(file.originalname),
      fileMime: file.mimetype,
      fileSize: file.size,
      fileData: file.buffer,
      managerComment: null,
    });
    await this.notifications.notify(
      doc.userId,
      NotificationType.DOCUMENT_READY,
      { number: doc.number, docType: doc.type },
      '/account/documents',
    );
    return this.findOne(id);
  }

  async reject(id: string, dto: RejectDocumentDto): Promise<DocumentRequest> {
    const doc = await this.findOne(id);
    await this.documents.update(doc.id, {
      status: DocumentRequestStatus.REJECTED,
      managerComment: dto.managerComment,
    });
    await this.notifications.notify(
      doc.userId,
      NotificationType.DOCUMENT_REJECTED,
      { number: doc.number, docType: doc.type },
      '/account/documents',
    );
    return this.findOne(id);
  }

  getFile(id: string): Promise<DocumentFile> {
    return this.loadFile({ id });
  }

  private async findOne(id: string): Promise<DocumentRequest> {
    const doc = await this.documents.findOne({ where: { id }, relations: ['user'] });
    if (!doc) {
      throw new NotFoundException('Документ не найден');
    }
    return doc;
  }

  private async loadFile(where: { id: string; userId?: string }): Promise<DocumentFile> {
    const doc = await this.documents
      .createQueryBuilder('doc')
      .addSelect('doc.fileData')
      .where('doc.id = :id', { id: where.id })
      .andWhere(where.userId ? 'doc.userId = :userId' : '1=1', { userId: where.userId })
      .getOne();
    if (!doc || doc.status !== DocumentRequestStatus.READY || !doc.fileData) {
      throw new NotFoundException('Файл не найден');
    }
    return {
      data: doc.fileData,
      name: doc.fileName ?? `document-${doc.number}`,
      mime: doc.fileMime ?? 'application/octet-stream',
    };
  }
}

/** Убираем из имени пути и управляющие символы; кириллицу сохраняем. */
function sanitizeFileName(name: string): string {
  // multer отдаёт имя в latin1 — перекодируем, чтобы не ломалась кириллица.
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  const base = decoded.split(/[\\/]/).pop() ?? 'document';
  const cleaned = [...base]
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch !== '"')
    .join('')
    .trim();
  return cleaned.slice(0, 150) || 'document';
}
