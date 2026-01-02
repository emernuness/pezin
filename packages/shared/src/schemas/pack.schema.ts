import { z } from 'zod';

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'] as const;
const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const;

export const createPackSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  price: z.coerce
    .number()
    .int()
    .min(1990, 'Preço mínimo é R$ 19,90'),
});

export const updatePackSchema = createPackSchema.partial();

export const publishPackSchema = z.object({
  packId: z.string().cuid(),
});

// Upload URL request schema
export const uploadUrlSchema = z.object({
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  contentType: z.string().refine(
    (val) => ALLOWED_FILE_TYPES.includes(val as typeof ALLOWED_FILE_TYPES[number]),
    { message: 'Tipo de arquivo não permitido' }
  ),
  type: z.enum(['preview', 'file'], {
    errorMap: () => ({ message: 'Tipo deve ser "preview" ou "file"' }),
  }),
});

// Confirm upload schema
export const confirmUploadSchema = z.object({
  fileId: z.string().min(1, 'ID do arquivo é obrigatório'),
  key: z.string().min(1, 'Chave de armazenamento é obrigatória'),
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  mimeType: z.string().refine(
    (val) => ALLOWED_FILE_TYPES.includes(val as typeof ALLOWED_FILE_TYPES[number]),
    { message: 'Tipo de arquivo não permitido' }
  ),
  size: z
    .number()
    .min(1, 'Tamanho deve ser maior que 0')
    .max(100 * 1024 * 1024, 'Arquivo muito grande (máx. 100MB)'),
  type: z.enum(['preview', 'file']),
});

// Public packs query schema
export const publicPacksQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['recent', 'price_asc', 'price_desc', 'popular']).default('recent'),
  creatorId: z.string().cuid().optional(),
});

// Checkout schema
export const checkoutSchema = z.object({
  packId: z.string().cuid('ID do pack inválido'),
});

export type CreatePackInput = z.infer<typeof createPackSchema>;
export type UpdatePackInput = z.infer<typeof updatePackSchema>;
export type PublishPackInput = z.infer<typeof publishPackSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type PublicPacksQueryInput = z.infer<typeof publicPacksQuerySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
