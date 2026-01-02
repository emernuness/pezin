import { IsString, IsNotEmpty } from 'class-validator';

export class ResolvePathDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ResolvePathResponseDto {
  path!: string;
  contentType!: string;
  filename?: string;
}
