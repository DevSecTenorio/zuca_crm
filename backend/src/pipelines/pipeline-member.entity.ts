import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { User } from '../users/user.entity';

@Entity('pipeline_members')
@Unique('UQ_pipeline_members_pipeline_user', ['pipelineId', 'userId'])
export class PipelineMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pipeline_id' })
  pipelineId: string;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
