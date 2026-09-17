import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDealDto } from './create-deal.dto';

export class UpdateDealDto extends PartialType(
  OmitType(CreateDealDto, ['pipelineId', 'stageId'] as const),
) {}
