import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Organization } from './organizations/organization.entity';
import { User } from './users/user.entity';
import { Contact } from './contacts/contact.entity';
import { Company } from './companies/company.entity';
import { Deal } from './deals/deal.entity';
import { Activity } from './activities/activity.entity';
import { Automation } from './automations/automation.entity';
import { Integration } from './integrations/integration.entity';
import { Pipeline } from './pipelines/pipeline.entity';
import { PipelineStage } from './pipelines/pipeline-stage.entity';
import { PipelineMember } from './pipelines/pipeline-member.entity';
import { LeadSource } from './catalogs/lead-source.entity';
import { Campaign } from './catalogs/campaign.entity';
import { LossReason } from './catalogs/loss-reason.entity';
import { Segment } from './catalogs/segment.entity';
import { Product } from './catalogs/product.entity';
import { AuditLog } from './audit/audit-log.entity';
import { SalesGoal } from './goals/sales-goal.entity';
import { Attachment } from './attachments/attachment.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { ReportingModule } from './reporting/reporting.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { AuditModule } from './audit/audit.module';
import { GoalsModule } from './goals/goals.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { getDatabaseSslConfig } from './database/ssl';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: getDatabaseSslConfig(process.env.DATABASE_URL),
      entities: [
        Organization,
        User,
        Contact,
        Company,
        Deal,
        Activity,
        Automation,
        Integration,
        Pipeline,
        PipelineStage,
        PipelineMember,
        LeadSource,
        Campaign,
        LossReason,
        Segment,
        Product,
        AuditLog,
        SalesGoal,
        Attachment,
      ],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    ContactsModule,
    CompaniesModule,
    PipelinesModule,
    CatalogsModule,
    DealsModule,
    ActivitiesModule,
    ReportingModule,
    AuditModule,
    GoalsModule,
    AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
