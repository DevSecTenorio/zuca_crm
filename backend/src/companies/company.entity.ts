import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contact } from '../contacts/contact.entity';
import { Segment } from '../catalogs/segment.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ length: 20, nullable: true })
  cnpj: string;

  @Column({ name: 'razao_social', length: 255 })
  razaoSocial: string;

  @Column({ name: 'nome_fantasia', length: 255, nullable: true })
  nomeFantasia: string;

  @Column({ name: 'segment_id', nullable: true })
  segmentId: string;

  @ManyToOne(() => Segment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'segment_id' })
  segment: Segment;

  @Column({ length: 500, nullable: true })
  website: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, unknown>;

  @Column({ name: 'seu_zuca_id', length: 100, nullable: true })
  seuZucaId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Contact, (contact) => contact.linkedCompany)
  contacts: Contact[];
}
