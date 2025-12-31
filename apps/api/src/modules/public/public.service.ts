import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async findAllPacks(params: {
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
    creatorId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'published',
    };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { creator: { displayName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) where.price.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
    }

    if (params.creatorId) {
      where.creatorId = params.creatorId;
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (params.sort === 'price_asc') orderBy = { price: 'asc' };
    else if (params.sort === 'price_desc') orderBy = { price: 'desc' };
    else if (params.sort === 'popular') {
       // Ideally we join with purchases count, but for now let's sort by publishedAt
       // or if we have a way to count, we can do that.
       // Prisma doesn't support relation aggregation in orderBy easily without aggregate group.
       // For MVP, let's keep 'recent' as fallback for popular or improve if Purchase model allows.
       // Actually we can order by purchases relation count if we want, but let's stick to simple first.
       orderBy = { purchases: { _count: 'desc' } };
    }

    const [total, packs] = await this.prisma.$transaction([
      this.prisma.pack.count({ where }),
      this.prisma.pack.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              profileImage: true,
            },
          },
          previews: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      }),
    ]);

    return {
      data: packs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPackById(id: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id, status: 'published' },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            profileImage: true,
            bio: true,
          },
        },
        previews: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { files: true },
        }
      },
    });

    if (!pack) throw new NotFoundException('Pack not found');

    return pack;
  }

  async findCreatorBySlug(slug: string) {
    const creator = await this.prisma.user.findUnique({
      where: { slug, userType: 'creator' },
      select: {
        id: true,
        displayName: true,
        slug: true,
        profileImage: true,
        coverImage: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!creator) throw new NotFoundException('Creator not found');

    return creator;
  }
}
