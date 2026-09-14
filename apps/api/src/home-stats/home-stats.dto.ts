import { z } from 'zod';

export const homeStatItemSchema = z.object({
  position: z.number().int().min(1).max(4),
  value: z.string().min(1).max(50),
  label: z.string().min(1).max(255),
});

export const updateHomeStatsSchema = z.object({
  items: z.array(homeStatItemSchema).length(4),
});

export type UpdateHomeStatsDto = z.infer<typeof updateHomeStatsSchema>;
