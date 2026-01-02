import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const mockJwtService = {
    sign: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn((key: string, defaultValue?: any) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        birthDate: '1990-01-01',
        userType: 'consumer' as const,
        acceptTerms: true as const,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: signUpDto.email,
        userType: signUpDto.userType,
      });

      const result = await service.signUp(signUpDto);

      expect(result.message).toContain('Cadastro realizado');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const signUpDto = {
        email: 'existing@example.com',
        password: 'Test1234',
        confirmPassword: 'Test1234',
        birthDate: '1990-01-01',
        userType: 'consumer' as const,
        acceptTerms: true as const,
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: signUpDto.email,
      });

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test1234',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        passwordHash: await bcrypt.hash(loginDto.password, 12),
        emailVerified: true,
        displayName: 'Test User',
        userType: 'consumer',
        stripeConnected: false,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('mock-access-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Test1234',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        passwordHash: await bcrypt.hash('CorrectPassword1', 12),
        emailVerified: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('refresh', () => {
    it('should rotate refresh tokens successfully', async () => {
      const oldRefreshToken = 'old-refresh-token';

      const storedToken = {
        id: 'token-id',
        tokenHash: expect.any(String),
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(storedToken);
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('new-access-token');
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh(oldRefreshToken);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled(); // Old token revoked
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const oldRefreshToken = 'expired-token';

      const expiredToken = {
        id: 'token-id',
        tokenHash: expect.any(String),
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 1000), // Expired
        revokedAt: null,
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(expiredToken);
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});

      await expect(service.refresh(oldRefreshToken)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
