import { CurrentUserId } from '@/account/current-user.decorator';
import { UserJwtAuthGuard } from '@/account/user-jwt-auth.guard';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import type { DocumentRequest } from '@app/database';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  type AdminDocumentsQuery,
  type CreateDocumentRequestDto,
  MAX_DOCUMENT_SIZE,
  type RejectDocumentDto,
  type UploadedDocumentFile,
  adminDocumentsQuerySchema,
  createDocumentRequestSchema,
  rejectDocumentSchema,
} from './document.dto';
import { type DocumentFile, DocumentsService } from './documents.service';

function toStream(file: DocumentFile): StreamableFile {
  return new StreamableFile(file.data, {
    type: file.mime,
    length: file.data.length,
    // filename* — для кириллицы, filename — запасной ASCII-вариант.
    disposition: `attachment; filename="document${extension(file.name)}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  });
}

function extension(name: string): string {
  const match = name.match(/\.[a-z0-9]{1,5}$/i);
  return match ? match[0] : '';
}

/** Документы текущего пользователя сайта. */
@Controller('account/documents')
@UseGuards(UserJwtAuthGuard)
export class AccountDocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  findMine(@CurrentUserId() userId: string): Promise<DocumentRequest[]> {
    return this.service.findMine(userId);
  }

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createDocumentRequestSchema)) dto: CreateDocumentRequestDto,
  ): Promise<DocumentRequest> {
    return this.service.create(userId, dto);
  }

  @Get(':id/file')
  async download(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    return toStream(await this.service.getMineFile(userId, id));
  }
}

/** Обработка заказов документов в админке. */
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class AdminDocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(adminDocumentsQuerySchema)) query: AdminDocumentsQuery,
  ): Promise<DocumentRequest[]> {
    return this.service.findAll(query);
  }

  @Post(':id/file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_DOCUMENT_SIZE, files: 1 } }))
  upload(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: UploadedDocumentFile | undefined,
  ): Promise<DocumentRequest> {
    return this.service.attachFile(id, file);
  }

  @Put(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(rejectDocumentSchema)) dto: RejectDocumentDto,
  ): Promise<DocumentRequest> {
    return this.service.reject(id, dto);
  }

  @Get(':id/file')
  async download(@Param('id', ParseUUIDPipe) id: string): Promise<StreamableFile> {
    return toStream(await this.service.getFile(id));
  }
}
