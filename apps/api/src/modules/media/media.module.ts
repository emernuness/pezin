import { Module, Global } from '@nestjs/common';
import { MediaService } from './media.service';
import { FileValidationService } from './file-validation.service';

@Global()
@Module({
  providers: [MediaService, FileValidationService],
  exports: [MediaService, FileValidationService],
})
export class MediaModule {}
