import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ContactType } from '../contact.entity';

export class CreateContactDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cnpjCpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  linkedCompanyId?: string;

  @IsOptional()
  @IsUUID()
  sourceId?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;
}
