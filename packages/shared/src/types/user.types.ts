import type { PixKeyType } from '../schemas/auth.schema';

export type UserType = 'creator' | 'consumer';

export interface UserAddress {
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  slug: string | null;
  bio: string | null;
  profileImage: string | null;
  coverImage: string | null;
  birthDate: Date | string;
  userType: UserType;
  emailVerified: boolean;
  createdAt: Date | string;

  // Personal data (for creators)
  fullName: string | null;
  cpf: string | null;
  phone: string | null;
  address: UserAddress | null;

  // PIX key for payouts (creators)
  pixKey: string | null;
  pixKeyType: PixKeyType | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
