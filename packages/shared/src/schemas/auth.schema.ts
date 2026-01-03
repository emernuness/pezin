import { z } from 'zod';

export const signUpSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[a-z]/, 'Deve conter letra minúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    birthDate: z.string().refine((date) => {
      const age = Math.floor(
        (Date.now() - new Date(date).getTime()) / 31557600000
      );
      return age >= 18;
    }, 'Você deve ter 18 anos ou mais'),
    userType: z.enum(['creator', 'consumer']),
    displayName: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(50, 'Máximo 50 caracteres')
      .optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.userType === 'creator') {
        return !!data.displayName && data.displayName.length >= 3;
      }
      return true;
    },
    {
      message: 'Nome artístico é obrigatório para criadores',
      path: ['displayName'],
    }
  );

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

// Validação de CPF brasileiro
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;

function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

// Validação de telefone brasileiro
const phoneRegex = /^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

// Schema de endereço
export const addressSchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
    .transform((val) => val.replace(/\D/g, '')),
  street: z.string().min(3, 'Rua obrigatória').max(200, 'Máximo 200 caracteres'),
  number: z.string().min(1, 'Número obrigatório').max(20, 'Máximo 20 caracteres'),
  complement: z.string().max(100, 'Máximo 100 caracteres').optional().nullable(),
  neighborhood: z.string().min(2, 'Bairro obrigatório').max(100, 'Máximo 100 caracteres'),
  city: z.string().min(2, 'Cidade obrigatória').max(100, 'Máximo 100 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
});

// Schema básico de perfil (nome e bio)
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .optional()
    .nullable(),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
});

// Schema completo para dados pessoais do criador (necessário para Stripe Connect)
export const updateCreatorPersonalDataSchema = z.object({
  fullName: z
    .string()
    .min(5, 'Nome completo deve ter no mínimo 5 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .refine((name) => name.trim().split(/\s+/).length >= 2, {
      message: 'Informe nome e sobrenome',
    }),
  cpf: z
    .string()
    .regex(cpfRegex, 'CPF inválido')
    .refine(validateCPF, 'CPF inválido'),
  phone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido (ex: (11) 99999-9999)'),
  address: addressSchema,
});

// Schema combinado para atualização completa do perfil do criador
export const updateCreatorProfileSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .optional()
    .nullable(),
  bio: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_-]+$/, 'Apenas letras minúsculas, números, - e _')
    .optional()
    .nullable(),
  fullName: z
    .string()
    .min(5, 'Nome completo deve ter no mínimo 5 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .refine((name) => name.trim().split(/\s+/).length >= 2, {
      message: 'Informe nome e sobrenome',
    })
    .optional()
    .nullable(),
  cpf: z
    .string()
    .regex(cpfRegex, 'CPF inválido')
    .refine(validateCPF, 'CPF inválido')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido (ex: (11) 99999-9999)')
    .optional()
    .nullable(),
  address: addressSchema.optional().nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter letra maiúscula')
      .regex(/[a-z]/, 'Deve conter letra minúscula')
      .regex(/[0-9]/, 'Deve conter número'),
    confirmNewPassword: z.string().min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não conferem',
    path: ['confirmNewPassword'],
  });

// Schema para configuração de chave PIX
export const pixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'evp'], {
  errorMap: () => ({ message: 'Tipo de chave PIX inválido' }),
});

export const updatePixKeySchema = z.object({
  pixKeyType: pixKeyTypeSchema,
  pixKey: z
    .string()
    .min(1, 'Chave PIX obrigatória')
    .max(100, 'Máximo 100 caracteres'),
}).refine(
  (data) => {
    const { pixKeyType, pixKey } = data;

    switch (pixKeyType) {
      case 'cpf':
        return /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(pixKey);
      case 'cnpj':
        return /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(pixKey);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
      case 'phone':
        return /^\+?55?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(pixKey);
      case 'evp':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pixKey);
      default:
        return false;
    }
  },
  {
    message: 'Chave PIX inválida para o tipo selecionado',
    path: ['pixKey'],
  }
);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateCreatorPersonalDataInput = z.infer<typeof updateCreatorPersonalDataSchema>;
export type UpdateCreatorProfileInput = z.infer<typeof updateCreatorProfileSchema>;
export type PixKeyType = z.infer<typeof pixKeyTypeSchema>;
export type UpdatePixKeyInput = z.infer<typeof updatePixKeySchema>;
