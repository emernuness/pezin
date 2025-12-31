import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  private readonly apiBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const port = this.config.get('PORT') || 3001;
    this.apiBaseUrl = this.config.get('API_BASE_URL') || `http://localhost:${port}`;
  }

  private transformAssetUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.apiBaseUrl}/assets/${url}`;
  }

  async findAllByUser(userId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: {
        userId,
        status: 'paid',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        pack: {
          select: {
            id: true,
            title: true,
            price: true,
            previews: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            creator: {
              select: {
                displayName: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Transform preview URLs
    return purchases.map((purchase) => ({
      ...purchase,
      pack: {
        ...purchase.pack,
        previews: purchase.pack.previews.map((preview) => ({
          ...preview,
          url: this.transformAssetUrl(preview.url),
        })),
      },
    }));
  }

  async findByUserAndPack(userId: string, packId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        packId,
        status: 'paid'
      },
      include: {
        pack: {
          include: {
            creator: {
              select: {
                displayName: true,
                slug: true,
                profileImage: true
              }
            },
            files: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                filename: true,
                mimeType: true,
                size: true,
                order: true
              }
            },
            previews: true
          }
        }
      }
    });

    if (!purchase) {
      throw new NotFoundException('Compra não encontrada ou pagamento pendente.');
    }

    // Transform URLs
    return {
      ...purchase,
      pack: {
        ...purchase.pack,
        creator: {
          ...purchase.pack.creator,
          profileImage: this.transformAssetUrl(purchase.pack.creator.profileImage),
        },
        previews: purchase.pack.previews.map((preview) => ({
          ...preview,
          url: this.transformAssetUrl(preview.url),
        })),
      },
    };
  }
}
