import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Organization } from '../organizations/organization.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  REP = 'rep',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization, (org) => org.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 50, default: UserRole.REP })
  role: UserRole;

  @Column({ type: 'varchar', length: 50, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, unknown>;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
