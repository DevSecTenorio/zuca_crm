import {
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  MaxLength,
  IsObject,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(255)
  razaoSocial: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpj?: string;

  @IsOptional()
  @IsUUID()
  segmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  seuZucaId?: string;
}
