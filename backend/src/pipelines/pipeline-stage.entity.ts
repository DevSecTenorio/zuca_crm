import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pipeline } from './pipeline.entity';

@Entity('pipeline_stages')
export class PipelineStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pipeline_id' })
  pipelineId: string;

  @ManyToOne(() => Pipeline, (pipeline) => pipeline.stages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', default: 50 })
  probability: number;

  @Column({ name: 'is_won', default: false })
  isWon: boolean;

  @Column({ name: 'is_lost', default: false })
  isLost: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
