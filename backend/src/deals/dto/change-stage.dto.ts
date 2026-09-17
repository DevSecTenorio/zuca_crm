import { IsUUID, IsOptional } from 'class-validator';

export class ChangeStageDto {
  @IsUUID()
  stageId: string;

  @IsOptional()
  @IsUUID()
  lossReasonId?: string;
}
