import { z } from 'zod';

export const updateSitePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().max(100000).optional(),
  published: z.boolean().optional(),
});

export type UpdateSitePageDto = z.infer<typeof updateSitePageSchema>;
