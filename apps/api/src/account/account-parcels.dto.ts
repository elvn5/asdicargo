import { ParcelStatus } from '@app/database';
import { z } from 'zod';

export const myParcelsQuerySchema = z.object({
  status: z.nativeEnum(ParcelStatus).optional(),
  // Поиск по трек-номеру или описанию.
  q: z.string().trim().max(100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type MyParcelsQuery = z.infer<typeof myParcelsQuerySchema>;
