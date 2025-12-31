import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('packs')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: 'recent' | 'price_asc' | 'price_desc' | 'popular',
    @Query('creatorId') creatorId?: string,
  ) {
    return this.publicService.findAllPacks({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sort,
      creatorId,
    });
  }

  @Get('packs/:id')
  findOne(@Param('id') id: string) {
    return this.publicService.findPackById(id);
  }

  @Get('creators/:slug')
  async findCreator(@Param('slug') slug: string) {
    const creator = await this.publicService.findCreatorBySlug(slug);
    const packs = await this.publicService.findAllPacks({
       creatorId: creator.id,
       limit: 100
    });
    return { ...creator, packs: packs.data };
  }
}
