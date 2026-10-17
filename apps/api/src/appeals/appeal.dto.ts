import { AppealCategory, AppealStatus } from '@app/database';
import { z } from 'zod';

const messageBody = z.string().trim().min(1).max(5000);

export const createAppealSchema = z.object({
  category: z.nativeEnum(AppealCategory),
  subject: z.string().trim().min(1).max(200),
  parcelId: z.string().uuid().nullable().optional(),
  message: messageBody,
});
export type CreateAppealDto = z.infer<typeof createAppealSchema>;

export const appealMessageSchema = z.object({ body: messageBody });
export type AppealMessageDto = z.infer<typeof appealMessageSchema>;

export const adminAppealsQuerySchema = z.object({
  status: z.nativeEnum(AppealStatus).optional(),
});
export type AdminAppealsQuery = z.infer<typeof adminAppealsQuerySchema>;

export const updateAppealSchema = z.object({ status: z.nativeEnum(AppealStatus) });
export type UpdateAppealDto = z.infer<typeof updateAppealSchema>;
