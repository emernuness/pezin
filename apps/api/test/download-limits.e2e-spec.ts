import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Download Limits (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let packId: string;
  let fileId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.downloadLog.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.packFile.deleteMany();
    await prisma.packPreview.deleteMany();
    await prisma.pack.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'consumer@test.com',
        password: 'Test1234',
        birthDate: '1990-01-01',
        userType: 'consumer',
        acceptTerms: true,
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'consumer@test.com',
        password: 'Test1234',
      });

    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;

    // Create creator and pack
    const creator = await prisma.user.create({
      data: {
        email: 'creator@test.com',
        passwordHash: 'hash',
        birthDate: new Date('1990-01-01'),
        userType: 'creator',
        emailVerified: true,
        stripeAccountId: 'acct_test',
        stripeConnected: true,
      },
    });

    const pack = await prisma.pack.create({
      data: {
        creatorId: creator.id,
        title: 'Test Pack',
        price: 2990,
        status: 'published',
      },
    });

    packId = pack.id;

    // Create pack file
    const file = await prisma.packFile.create({
      data: {
        id: 'file_test_123',
        packId: pack.id,
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        storageKey: 'packs/test/files/test.jpg',
        order: 0,
      },
    });

    fileId = file.id;

    // Create purchase
    await prisma.purchase.create({
      data: {
        userId,
        packId,
        creatorId: creator.id,
        amount: 2990,
        platformFee: 598,
        creatorEarnings: 2392,
        stripePaymentIntentId: 'pi_test_download',
        status: 'paid',
        availableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  });

  describe('RN-23: Download Limit (10 per file per day)', () => {
    it('should allow 10 downloads per file per day', async () => {
      // Make 10 successful download requests
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post(`/packs/${packId}/files/${fileId}/download-url`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(201);
        expect(response.body.url).toBeDefined();
      }

      // Verify download log
      const downloadLog = await prisma.downloadLog.findUnique({
        where: {
          userId_fileId_dateKey: {
            userId,
            fileId,
            dateKey: new Date().toISOString().split('T')[0],
          },
        },
      });

      expect(downloadLog?.count).toBe(10);
    });

    it('should block 11th download on same day', async () => {
      // Make 10 downloads
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post(`/packs/${packId}/files/${fileId}/download-url`)
          .set('Authorization', `Bearer ${accessToken}`);
      }

      // 11th attempt should fail
      const response = await request(app.getHttpServer())
        .post(`/packs/${packId}/files/${fileId}/download-url`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Limite diário');
      expect(response.body.message).toContain('10/dia');
    });

    it('should reset count for new day', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // Create download log for yesterday with 10 downloads
      await prisma.downloadLog.create({
        data: {
          userId,
          fileId,
          packId,
          dateKey: yesterday,
          count: 10,
        },
      });

      // Today's download should succeed (new day)
      const response = await request(app.getHttpServer())
        .post(`/packs/${packId}/files/${fileId}/download-url`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(201);

      // Verify today's log
      const todayLog = await prisma.downloadLog.findUnique({
        where: {
          userId_fileId_dateKey: {
            userId,
            fileId,
            dateKey: today,
          },
        },
      });

      expect(todayLog?.count).toBe(1);
    });

    it('should track downloads per file (different files have separate limits)', async () => {
      // Create second file
      const file2 = await prisma.packFile.create({
        data: {
          id: 'file_test_456',
          packId,
          filename: 'test2.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          storageKey: 'packs/test/files/test2.jpg',
          order: 1,
        },
      });

      // Download file1 10 times
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post(`/packs/${packId}/files/${fileId}/download-url`)
          .set('Authorization', `Bearer ${accessToken}`);
      }

      // Download file2 should still work (separate limit)
      const response = await request(app.getHttpServer())
        .post(`/packs/${packId}/files/${file2.id}/download-url`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(201);

      // Verify separate logs
      const dateKey = new Date().toISOString().split('T')[0];

      const log1 = await prisma.downloadLog.findUnique({
        where: {
          userId_fileId_dateKey: {
            userId,
            fileId,
            dateKey,
          },
        },
      });

      const log2 = await prisma.downloadLog.findUnique({
        where: {
          userId_fileId_dateKey: {
            userId,
            fileId: file2.id,
            dateKey,
          },
        },
      });

      expect(log1?.count).toBe(10);
      expect(log2?.count).toBe(1);
    });

    it('should block access if user has not purchased pack', async () => {
      // Create another user without purchase
      const otherUser = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'other@test.com',
          password: 'Test1234',
          birthDate: '1990-01-01',
          userType: 'consumer',
          acceptTerms: true,
        });

      const otherLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'other@test.com',
          password: 'Test1234',
        });

      const otherToken = otherLogin.body.accessToken;

      // Try to download
      const response = await request(app.getHttpServer())
        .post(`/packs/${packId}/files/${fileId}/download-url`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('não comprou');
    });
  });

  describe('Download Audit Log', () => {
    it('should log IP address and user agent', async () => {
      await request(app.getHttpServer())
        .post(`/packs/${packId}/files/${fileId}/download-url`)
        .set('Authorization', `Bearer ${accessToken}`)
        .set('User-Agent', 'Test Browser');

      const log = await prisma.downloadLog.findUnique({
        where: {
          userId_fileId_dateKey: {
            userId,
            fileId,
            dateKey: new Date().toISOString().split('T')[0],
          },
        },
      });

      expect(log?.ipAddress).toBeDefined();
      expect(log?.userAgent).toBe('Test Browser');
    });
  });
});
