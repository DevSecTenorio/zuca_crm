import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './attachment.entity';
import { Deal } from '../deals/deal.entity';
import { Company } from '../companies/company.entity';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, Deal, Company])],
  providers: [AttachmentsService, SupabaseStorageService],
  controllers: [AttachmentsController],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
