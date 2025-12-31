import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      })
    );

    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'Test1234',
          birthDate: '1990-01-01',
          userType: 'consumer',
          acceptTerms: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Cadastro realizado');

      const user = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe('newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Test1234',
        birthDate: '1990-01-01',
        userType: 'consumer',
        acceptTerms: true,
      };

      // First signup
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData);

      // Second signup with same email
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('já cadastrado');
    });

    it('should reject invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak', // No uppercase, no number
          birthDate: '1990-01-01',
          userType: 'consumer',
          acceptTerms: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should reject underage user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'underage@example.com',
          password: 'Test1234',
          birthDate: new Date(
            Date.now() - 17 * 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 17 years old
          userType: 'consumer',
          acceptTerms: true,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toContain('18 anos');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'testuser@example.com',
          password: 'Test1234',
          birthDate: '1990-01-01',
          userType: 'consumer',
          acceptTerms: true,
        });
    });

    it('should login successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('testuser@example.com');

      // Check refresh token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshTokenCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toContain('HttpOnly');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword1',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('inválidas');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create user and login
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'refresh@example.com',
          password: 'Test1234',
          birthDate: '1990-01-01',
          userType: 'consumer',
          acceptTerms: true,
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Test1234',
        });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      refreshToken = refreshCookie.split(';')[0].split('=')[1];
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();

      // Check new refresh token
      const cookies = response.headers['set-cookie'];
      const newRefreshCookie = cookies.find((c: string) =>
        c.startsWith('refreshToken=')
      );
      expect(newRefreshCookie).toBeDefined();

      const newRefreshToken = newRefreshCookie.split(';')[0].split('=')[1];
      expect(newRefreshToken).not.toBe(refreshToken); // Token rotated
    });

    it('should reject reused refresh token', async () => {
      // First refresh
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      // Try to reuse old token (should fail due to rotation)
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me (protected route)', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'protected@example.com',
          password: 'Test1234',
          birthDate: '1990-01-01',
          userType: 'creator',
          acceptTerms: true,
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'Test1234',
        });

      accessToken = loginResponse.body.accessToken;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('protected@example.com');
    });

    it('should reject access without token', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
