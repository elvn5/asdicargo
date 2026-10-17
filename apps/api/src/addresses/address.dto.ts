import { AddressKind } from '@app/database';
import { z } from 'zod';

export const createAddressSchema = z.object({
  title: z.string().min(1).max(255),
  kind: z.nativeEnum(AddressKind).optional().default(AddressKind.PICKUP),
  city: z.string().max(100).nullable().optional(),
  fullAddress: z.string().min(1).max(2000),
  phone: z.string().max(50).nullable().optional(),
  workingHours: z.string().max(255).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  comment: z.string().max(2000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressDto = z.infer<typeof createAddressSchema>;
export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
