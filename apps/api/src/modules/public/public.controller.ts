import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { publicPacksQuerySchema, PublicPacksQueryInput } from '@pack-do-pezin/shared';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('packs')
  findAll(
    @Query(new ZodValidationPipe(publicPacksQuerySchema)) query: PublicPacksQueryInput,
  ) {
    return this.publicService.findAllPacks(query);
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
