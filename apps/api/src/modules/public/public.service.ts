import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PublicService {
  private readonly apiBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storage: StorageService,
  ) {
    // In development, use localhost API URL for serving seed assets
    // In production, would use R2 signed URLs
    const port = this.config.get('PORT') || 3001;
    this.apiBaseUrl = this.config.get('API_BASE_URL') || `http://localhost:${port}`;
  }

  private transformAssetUrl(url: string | null): string | null {
    if (!url) return null;

    // If already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // For seed data paths like "previews/preview_01.jpg", transform to API asset URL
    return `${this.apiBaseUrl}/assets/${url}`;
  }

  /**
   * Transform preview URL to secure token-based URL
   * Uses creator's userId for the token since previews are owned by creators
   */
  private transformPreviewUrl(
    preview: { id: string; url: string },
    packId: string,
    creatorId: string
  ): string {
    // If already a full URL or data URL, return as-is
    if (preview.url.startsWith('http') || preview.url.startsWith('data:')) {
      return preview.url;
    }

    // For seed data paths, use the old transform
    if (!preview.url.includes('/')) {
      return this.transformAssetUrl(preview.url) || preview.url;
    }

    // Generate secure token-based URL for R2 storage keys
    return this.storage.generateMediaUrl(
      creatorId,
      preview.id,
      'preview',
      packId,
      undefined,
      'image/webp'
    );
  }

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

    // Transform URLs to full asset URLs (secure token-based for previews)
    const transformedPacks = packs.map((pack) => ({
      ...pack,
      creator: {
        ...pack.creator,
        profileImage: this.transformAssetUrl(pack.creator.profileImage),
      },
      previews: pack.previews.map((preview) => ({
        ...preview,
        url: this.transformPreviewUrl(preview, pack.id, pack.creatorId),
      })),
    }));

    return {
      data: transformedPacks,
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

    // Transform URLs to full asset URLs (secure token-based for previews)
    return {
      ...pack,
      creator: {
        ...pack.creator,
        profileImage: this.transformAssetUrl(pack.creator.profileImage),
      },
      previews: pack.previews.map((preview) => ({
        ...preview,
        url: this.transformPreviewUrl(preview, pack.id, pack.creatorId),
      })),
    };
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

    // Transform URLs to full asset URLs
    return {
      ...creator,
      profileImage: this.transformAssetUrl(creator.profileImage),
      coverImage: this.transformAssetUrl(creator.coverImage),
    };
  }
}
