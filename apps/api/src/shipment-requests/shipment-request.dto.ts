import { PHONE_REGEX } from '@/account/account-addresses.dto';
import { ShipmentDirection, ShipmentRequestStatus } from '@app/database';
import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional();

export const createShipmentRequestSchema = z
  .object({
    direction: z.nativeEnum(ShipmentDirection),
    fromCity: z.string().trim().min(1).max(100),
    toCity: z.string().trim().min(1).max(100),
    cargoDescription: z.string().trim().min(1).max(1000),
    weightKg: z.number().positive().max(20_000),
    volumeM3: z.number().min(0).max(100).nullable().optional(),
    pickupRequired: z.boolean().default(false),
    pickupAddress: optionalText(500),
    recipientName: z.string().trim().min(1).max(150),
    recipientPhone: z.string().trim().regex(PHONE_REGEX, 'Некорректный номер телефона'),
    recipientAddress: z.string().trim().min(1).max(500),
    comment: optionalText(1000),
  })
  .refine((v) => !v.pickupRequired || Boolean(v.pickupAddress), {
    message: 'Укажите адрес забора груза',
    path: ['pickupAddress'],
  });
export type CreateShipmentRequestDto = z.infer<typeof createShipmentRequestSchema>;

export const adminRequestsQuerySchema = z.object({
  status: z.nativeEnum(ShipmentRequestStatus).optional(),
});
export type AdminRequestsQuery = z.infer<typeof adminRequestsQuerySchema>;

export const updateShipmentRequestSchema = z.object({
  status: z.nativeEnum(ShipmentRequestStatus).optional(),
  managerComment: optionalText(2000),
});
export type UpdateShipmentRequestDto = z.infer<typeof updateShipmentRequestSchema>;

export const convertShipmentRequestSchema = z.object({
  trackNumber: z.string().trim().min(1).max(255),
});
export type ConvertShipmentRequestDto = z.infer<typeof convertShipmentRequestSchema>;
