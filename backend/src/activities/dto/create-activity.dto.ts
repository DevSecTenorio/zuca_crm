import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { ActivityType } from '../activity.entity';

export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
