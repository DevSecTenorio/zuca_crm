import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { Deal } from '../deals/deal.entity';
import { Company } from '../companies/company.entity';

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  NOTE = 'note',
  MEETING = 'meeting',
  TASK = 'task',
}

@Entity('activities')
@Index(['orgId', 'contactId', 'createdAt'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @ManyToOne(() => Contact, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ name: 'deal_id', nullable: true })
  dealId: string;

  @ManyToOne(() => Deal, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 50 })
  type: ActivityType;

  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  transcription: string;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({ name: 'due_at', type: 'timestamp', nullable: true })
  dueAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
