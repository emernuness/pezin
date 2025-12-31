import { z } from 'zod';

export const createPackSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  price: z
    .number()
    .min(990, 'Preço mínimo é R$ 9,90')
    .max(50000, 'Preço máximo é R$ 500,00'),
});

export const updatePackSchema = createPackSchema.partial();

export const publishPackSchema = z.object({
  packId: z.string().cuid(),
});

export type CreatePackInput = z.infer<typeof createPackSchema>;
export type UpdatePackInput = z.infer<typeof updatePackSchema>;
export type PublishPackInput = z.infer<typeof publishPackSchema>;
