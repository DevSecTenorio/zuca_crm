import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

export class CreatePipelineStageInput {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  probability?: number;

  @IsOptional()
  @IsBoolean()
  isWon?: boolean;

  @IsOptional()
  @IsBoolean()
  isLost?: boolean;
}

export class CreatePipelineDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePipelineStageInput)
  stages: CreatePipelineStageInput[];
}
