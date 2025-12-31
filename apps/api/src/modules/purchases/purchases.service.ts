import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.purchase.findMany({
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

      return purchase;
  }
}
