import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { PipelineMember } from './pipeline-member.entity';
import { Deal } from '../deals/deal.entity';
import { User } from '../users/user.entity';
import { PipelinesService } from './pipelines.service';
import { PipelinesController } from './pipelines.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pipeline,
      PipelineStage,
      PipelineMember,
      Deal,
      User,
    ]),
    AuditModule,
  ],
  providers: [PipelinesService],
  controllers: [PipelinesController],
  exports: [PipelinesService],
})
export class PipelinesModule {}
