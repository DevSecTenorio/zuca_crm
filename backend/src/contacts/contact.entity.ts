import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { LeadSource } from '../catalogs/lead-source.entity';
import { Campaign } from '../catalogs/campaign.entity';

export enum ContactType {
  INDIVIDUAL = 'individual',
  COMPANY_CONTACT = 'company_contact',
}

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ type: 'varchar', length: 50, default: ContactType.INDIVIDUAL })
  type: ContactType;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'cnpj_cpf', length: 20, nullable: true })
  cnpjCpf: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: Record<string, unknown>;

  @Column({ name: 'linked_company_id', nullable: true })
  linkedCompanyId: string;

  @ManyToOne(() => Company, (company) => company.contacts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'linked_company_id' })
  linkedCompany: Company;

  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @ManyToOne(() => LeadSource, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_id' })
  source: LeadSource;

  @Column({ name: 'campaign_id', nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
