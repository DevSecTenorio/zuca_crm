import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

export const ATTACHMENT_ENTITY_TYPES = ['deal', 'company'] as const;
export type AttachmentEntityType = (typeof ATTACHMENT_ENTITY_TYPES)[number];

@Entity('attachments')
@Index(['orgId', 'entityType', 'entityId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ name: 'entity_type', length: 20 })
  entityType: AttachmentEntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'storage_path', length: 500 })
  storagePath: string;

  @Column({ name: 'mime_type', length: 150, nullable: true })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
