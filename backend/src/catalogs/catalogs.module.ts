import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadSource } from './lead-source.entity';
import { Campaign } from './campaign.entity';
import { LossReason } from './loss-reason.entity';
import { Segment } from './segment.entity';
import { Product } from './product.entity';
import { LeadSourcesService } from './lead-sources.service';
import { LeadSourcesController } from './lead-sources.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { LossReasonsService } from './loss-reasons.service';
import { LossReasonsController } from './loss-reasons.controller';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeadSource,
      Campaign,
      LossReason,
      Segment,
      Product,
    ]),
  ],
  providers: [
    LeadSourcesService,
    CampaignsService,
    LossReasonsService,
    SegmentsService,
    ProductsService,
  ],
  controllers: [
    LeadSourcesController,
    CampaignsController,
    LossReasonsController,
    SegmentsController,
    ProductsController,
  ],
  exports: [
    LeadSourcesService,
    CampaignsService,
    LossReasonsService,
    SegmentsService,
    ProductsService,
  ],
})
export class CatalogsModule {}
