import { IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class UpsertGoalDto {
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(0)
  targetValue: number;

  @IsInt()
  @Min(0)
  targetCount: number;
}
