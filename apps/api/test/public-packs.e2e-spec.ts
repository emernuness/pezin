import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Public Packs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let creatorId: string;

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
    await prisma.purchase.deleteMany();
    await prisma.packFile.deleteMany();
    await prisma.packPreview.deleteMany();
    await prisma.pack.deleteMany();
    await prisma.user.deleteMany();

    // Create test creator
    const creator = await prisma.user.create({
      data: {
        email: 'creator@test.com',
        passwordHash: 'hash',
        displayName: 'Test Creator',
        slug: 'test-creator',
        birthDate: new Date('1990-01-01'),
        userType: 'creator',
        emailVerified: true,
        stripeAccountId: 'acct_test',
        stripeConnected: true,
      },
    });

    creatorId = creator.id;

    // Create test packs with different prices
    await prisma.pack.createMany({
      data: [
        {
          creatorId,
          title: 'Cheap Pack',
          price: 990, // R$ 9.90
          status: 'published',
          publishedAt: new Date(),
        },
        {
          creatorId,
          title: 'Medium Pack',
          price: 2990, // R$ 29.90
          status: 'published',
          publishedAt: new Date(),
        },
        {
          creatorId,
          title: 'Expensive Pack',
          price: 9990, // R$ 99.90
          status: 'published',
          publishedAt: new Date(),
        },
        {
          creatorId,
          title: 'Draft Pack',
          price: 1990,
          status: 'draft', // Not published
        },
      ],
    });
  });

  describe('GET /public/packs', () => {
    it('should return only published packs', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.total).toBe(3);

      // Verify no draft pack
      const titles = response.body.data.map((p: any) => p.title);
      expect(titles).not.toContain('Draft Pack');
    });

    it('should filter by minPrice', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ minPrice: 2000 }) // R$ 20.00 in cents
        .expect(200);

      expect(response.body.data).toHaveLength(2);

      const prices = response.body.data.map((p: any) => p.price);
      expect(prices.every((p: number) => p >= 2000)).toBe(true);
    });

    it('should filter by maxPrice', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ maxPrice: 3000 }) // R$ 30.00 in cents
        .expect(200);

      expect(response.body.data).toHaveLength(2);

      const prices = response.body.data.map((p: any) => p.price);
      expect(prices.every((p: number) => p <= 3000)).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ minPrice: 1500, maxPrice: 5000 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Medium Pack');
    });

    it('should search by title', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ search: 'cheap' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Cheap Pack');
    });

    it('should search by creator name', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ search: 'test creator' })
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });

    it('should sort by price ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ sort: 'price_asc' })
        .expect(200);

      const prices = response.body.data.map((p: any) => p.price);
      expect(prices).toEqual([990, 2990, 9990]);
    });

    it('should sort by price descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ sort: 'price_desc' })
        .expect(200);

      const prices = response.body.data.map((p: any) => p.price);
      expect(prices).toEqual([9990, 2990, 990]);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.totalPages).toBe(2);
      expect(response.body.meta.total).toBe(3);
    });

    it('should return second page', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ page: 2, limit: 2 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.page).toBe(2);
    });

    it('should validate query parameters', async () => {
      // Invalid sort value should fail or use default
      const response = await request(app.getHttpServer())
        .get('/public/packs')
        .query({ sort: 'invalid_sort' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /public/packs/:id', () => {
    it('should return pack details', async () => {
      const pack = await prisma.pack.findFirst({
        where: { title: 'Medium Pack' },
      });

      const response = await request(app.getHttpServer())
        .get(`/public/packs/${pack?.id}`)
        .expect(200);

      expect(response.body.title).toBe('Medium Pack');
      expect(response.body.price).toBe(2990);
      expect(response.body.creator).toBeDefined();
      expect(response.body.creator.displayName).toBe('Test Creator');
    });

    it('should return 404 for draft pack', async () => {
      const pack = await prisma.pack.findFirst({
        where: { title: 'Draft Pack' },
      });

      await request(app.getHttpServer())
        .get(`/public/packs/${pack?.id}`)
        .expect(404);
    });

    it('should return 404 for non-existent pack', async () => {
      await request(app.getHttpServer())
        .get('/public/packs/clxxxxxxxxxxxxxxxxxxxxxxxxx')
        .expect(404);
    });
  });
});
