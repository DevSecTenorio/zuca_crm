import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingController } from './reporting.controller';
import { InsightsService } from './insights.service';
import { Deal } from '../deals/deal.entity';
import { Contact } from '../contacts/contact.entity';
import { Company } from '../companies/company.entity';
import { Activity } from '../activities/activity.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { DealsModule } from '../deals/deals.module';
import { ActivitiesModule } from '../activities/activities.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { UsersModule } from '../users/users.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, Contact, Company, Activity, PipelineStage]),
    DealsModule,
    ActivitiesModule,
    PipelinesModule,
    UsersModule,
    GoalsModule,
  ],
  controllers: [ReportingController],
  providers: [InsightsService],
})
export class ReportingModule {}
