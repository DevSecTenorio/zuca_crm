import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PipelineStage } from './pipeline-stage.entity';
import { PipelineMember } from './pipeline-member.entity';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PipelineStage, (stage) => stage.pipeline)
  stages: PipelineStage[];

  @OneToMany(() => PipelineMember, (member) => member.pipeline)
  members: PipelineMember[];
}
