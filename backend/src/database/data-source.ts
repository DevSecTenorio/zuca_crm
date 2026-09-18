import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Organization } from '../organizations/organization.entity';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
import { Company } from '../companies/company.entity';
import { Deal } from '../deals/deal.entity';
import { Activity } from '../activities/activity.entity';
import { Automation } from '../automations/automation.entity';
import { Integration } from '../integrations/integration.entity';
import { Pipeline } from '../pipelines/pipeline.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { PipelineMember } from '../pipelines/pipeline-member.entity';
import { LeadSource } from '../catalogs/lead-source.entity';
import { Campaign } from '../catalogs/campaign.entity';
import { LossReason } from '../catalogs/loss-reason.entity';
import { Segment } from '../catalogs/segment.entity';
import { Product } from '../catalogs/product.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { SalesGoal } from '../goals/sales-goal.entity';
import { Attachment } from '../attachments/attachment.entity';
import { getDatabaseSslConfig } from './ssl';

config();

export const AppDataSource = new DataSource({
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
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
