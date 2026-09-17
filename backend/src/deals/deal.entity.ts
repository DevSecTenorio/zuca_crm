import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { Pipeline } from '../pipelines/pipeline.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { LossReason } from '../catalogs/loss-reason.entity';
import { Product } from '../catalogs/product.entity';

export enum DealStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity('deals')
@Index(['orgId', 'pipelineId', 'stageId', 'ownerId'])
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  value: number;

  @Column({ length: 3, default: 'BRL' })
  currency: string;

  @Column({ name: 'pipeline_id' })
  pipelineId: string;

  @ManyToOne(() => Pipeline, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ name: 'stage_id' })
  stageId: string;

  @ManyToOne(() => PipelineStage, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'stage_id' })
  stage: PipelineStage;

  @Column({ type: 'int', default: 50 })
  probability: number;

  @Column({ name: 'expected_close_date', type: 'date', nullable: true })
  expectedCloseDate: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'varchar', length: 50, default: DealStatus.ACTIVE })
  status: DealStatus;

  @Column({ name: 'linked_seu_zuca_pedido_id', length: 100, nullable: true })
  linkedSeuZucaPedidoId: string;

  @Column({ name: 'loss_reason_id', nullable: true })
  lossReasonId: string;

  @ManyToOne(() => LossReason, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'loss_reason_id' })
  lossReason: LossReason;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'deal_products',
    joinColumn: { name: 'deal_id' },
    inverseJoinColumn: { name: 'product_id' },
  })
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
