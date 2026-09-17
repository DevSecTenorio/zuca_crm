import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDealDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsUUID()
  pipelineId: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds?: string[];
}
