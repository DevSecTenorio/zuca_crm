import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { Product } from '../catalogs/product.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { ActivitiesModule } from '../activities/activities.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { AuditModule } from '../audit/audit.module';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, PipelineStage, Product]),
    ActivitiesModule,
    PipelinesModule,
    AuditModule,
    AttachmentsModule,
  ],
  providers: [DealsService],
  controllers: [DealsController],
  exports: [DealsService],
})
export class DealsModule {}
