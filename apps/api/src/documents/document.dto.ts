import { DocumentRequestStatus, DocumentType } from '@app/database';
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата в формате ГГГГ-ММ-ДД');

export const createDocumentRequestSchema = z
  .object({
    type: z.nativeEnum(DocumentType),
    periodFrom: isoDate.nullable().optional(),
    periodTo: isoDate.nullable().optional(),
    comment: z
      .string()
      .trim()
      .max(1000)
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .optional(),
  })
  .refine((v) => !v.periodFrom || !v.periodTo || v.periodFrom <= v.periodTo, {
    message: 'Начало периода позже конца',
    path: ['periodTo'],
  })
  // Для акта сверки период обязателен.
  .refine((v) => v.type !== DocumentType.RECONCILIATION || (v.periodFrom && v.periodTo), {
    message: 'Укажите период',
    path: ['periodFrom'],
  });
export type CreateDocumentRequestDto = z.infer<typeof createDocumentRequestSchema>;

export const adminDocumentsQuerySchema = z.object({
  status: z.nativeEnum(DocumentRequestStatus).optional(),
});
export type AdminDocumentsQuery = z.infer<typeof adminDocumentsQuerySchema>;

export const rejectDocumentSchema = z.object({
  managerComment: z.string().trim().min(1).max(2000),
});
export type RejectDocumentDto = z.infer<typeof rejectDocumentSchema>;

/** Минимум полей файла от multer (memoryStorage), которые мы используем. */
export interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
