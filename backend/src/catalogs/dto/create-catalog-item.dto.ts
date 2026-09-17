import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
