import { z } from 'zod';

export const PHONE_REGEX = /^\+?[\d\s()-]{7,20}$/;

export const userAddressSchema = z.object({
  label: z.string().trim().min(1).max(100),
  contactName: z.string().trim().min(1).max(150),
  phone: z.string().trim().regex(PHONE_REGEX, 'Некорректный номер телефона'),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1).max(500),
  comment: z
    .string()
    .trim()
    .max(1000)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .optional(),
  isDefault: z.boolean().optional().default(false),
});
export type UserAddressDto = z.infer<typeof userAddressSchema>;
