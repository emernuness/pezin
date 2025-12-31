import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[a-z]/, 'Deve conter letra minúscula')
    .regex(/[0-9]/, 'Deve conter número'),
  birthDate: z.string().refine((date) => {
    const age = Math.floor(
      (Date.now() - new Date(date).getTime()) / 31557600000
    );
    return age >= 18;
  }, 'Você deve ter 18 anos ou mais'),
  userType: z.enum(['creator', 'consumer']),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
