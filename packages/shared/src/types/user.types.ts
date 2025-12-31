export type UserType = 'creator' | 'consumer';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  userType: UserType;
  emailVerified: boolean;
  stripeConnected: boolean;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
