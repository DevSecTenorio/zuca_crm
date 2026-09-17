import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ length: 100 })
  type: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown>;

  @Column({ name: 'last_sync', type: 'timestamp', nullable: true })
  lastSync: Date;

  @Column({ name: 'sync_status', length: 50, default: 'idle' })
  syncStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
