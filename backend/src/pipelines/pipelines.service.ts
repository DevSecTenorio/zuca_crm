import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { PipelineMember } from './pipeline-member.entity';
import { Deal } from '../deals/deal.entity';
import { User, UserRole } from '../users/user.entity';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline)
    private readonly pipelineRepository: Repository<Pipeline>,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    @InjectRepository(PipelineMember)
    private readonly memberRepository: Repository<PipelineMember>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /** null = unrestricted (admin/manager); array = the only pipeline ids a rep can see */
  async getAccessiblePipelineIds(
    orgId: string,
    user: AuthenticatedUser,
  ): Promise<string[] | null> {
    if (user.role !== UserRole.REP) {
      return null;
    }
    const memberships = await this.memberRepository.find({
      where: { userId: user.id },
      relations: ['pipeline'],
    });
    return memberships
      .filter((m) => m.pipeline?.orgId === orgId)
      .map((m) => m.pipelineId);
  }

  async assertAccess(
    orgId: string,
    user: AuthenticatedUser,
    pipelineId: string,
  ): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id: pipelineId, orgId },
    });
    if (!pipeline) {
      throw new NotFoundException('Funil não encontrado');
    }
    const accessible = await this.getAccessiblePipelineIds(orgId, user);
    if (accessible !== null && !accessible.includes(pipelineId)) {
      throw new ForbiddenException('Você não tem acesso a este funil');
    }
    return pipeline;
  }

  async findAllForUser(orgId: string, user: AuthenticatedUser) {
    const accessible = await this.getAccessiblePipelineIds(orgId, user);
    const pipelines = await this.pipelineRepository.find({
      where: { orgId },
      relations: ['stages'],
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    const filtered =
      accessible === null
        ? pipelines
        : pipelines.filter((p) => accessible.includes(p.id));
    return filtered.map((p) => ({
      ...p,
      stages: [...p.stages].sort((a, b) => a.order - b.order),
    }));
  }

  async findOneForUser(orgId: string, user: AuthenticatedUser, id: string) {
    const pipeline = await this.assertAccess(orgId, user, id);
    const stages = await this.stageRepository.find({
      where: { pipelineId: id },
      order: { order: 'ASC' },
    });
    return { ...pipeline, stages };
  }

  async create(orgId: string, actorId: string, dto: CreatePipelineDto) {
    const count = await this.pipelineRepository.count({ where: { orgId } });
    const pipeline = await this.pipelineRepository.save(
      this.pipelineRepository.create({
        orgId,
        name: dto.name,
        isDefault: count === 0,
        order: count,
      }),
    );

    const stages = await this.stageRepository.save(
      dto.stages.map((stage, index) =>
        this.stageRepository.create({
          pipelineId: pipeline.id,
          name: stage.name,
          order: index,
          probability: stage.probability ?? 50,
          isWon: stage.isWon ?? false,
          isLost: stage.isLost ?? false,
        }),
      ),
    );

    await this.auditLogService.record(orgId, actorId, 'pipeline.created', {
      entityType: 'pipeline',
      entityId: pipeline.id,
      metadata: { name: pipeline.name },
    });

    return { ...pipeline, stages };
  }

  async update(orgId: string, id: string, dto: UpdatePipelineDto) {
    const pipeline = await this.getOrgPipeline(orgId, id);
    if (dto.name !== undefined) pipeline.name = dto.name;
    if (dto.isDefault) {
      await this.pipelineRepository.update({ orgId }, {
        isDefault: false,
      } as Partial<Pipeline>);
      pipeline.isDefault = true;
    } else if (dto.isDefault === false) {
      pipeline.isDefault = false;
    }
    return this.pipelineRepository.save(pipeline);
  }

  async remove(orgId: string, actorId: string, id: string) {
    const pipeline = await this.getOrgPipeline(orgId, id);
    const totalPipelines = await this.pipelineRepository.count({
      where: { orgId },
    });
    if (totalPipelines <= 1) {
      throw new ConflictException(
        'A organização precisa ter ao menos um funil',
      );
    }
    const dealsCount = await this.dealRepository.count({
      where: { pipelineId: id },
    });
    if (dealsCount > 0) {
      throw new ConflictException(
        'Não é possível remover um funil com deals vinculados',
      );
    }
    await this.pipelineRepository.remove(pipeline);
    await this.auditLogService.record(orgId, actorId, 'pipeline.deleted', {
      entityType: 'pipeline',
      entityId: id,
      metadata: { name: pipeline.name },
    });
    return { success: true };
  }

  async addStage(orgId: string, pipelineId: string, dto: CreateStageDto) {
    await this.getOrgPipeline(orgId, pipelineId);
    const count = await this.stageRepository.count({ where: { pipelineId } });
    return this.stageRepository.save(
      this.stageRepository.create({
        pipelineId,
        name: dto.name,
        order: count,
        probability: dto.probability ?? 50,
        isWon: dto.isWon ?? false,
        isLost: dto.isLost ?? false,
      }),
    );
  }

  async updateStage(
    orgId: string,
    pipelineId: string,
    stageId: string,
    dto: UpdateStageDto,
  ) {
    await this.getOrgPipeline(orgId, pipelineId);
    const stage = await this.getPipelineStage(pipelineId, stageId);
    Object.assign(stage, dto);
    return this.stageRepository.save(stage);
  }

  async removeStage(orgId: string, pipelineId: string, stageId: string) {
    await this.getOrgPipeline(orgId, pipelineId);
    const stage = await this.getPipelineStage(pipelineId, stageId);
    const remainingStages = await this.stageRepository.count({
      where: { pipelineId },
    });
    if (remainingStages <= 1) {
      throw new ConflictException('O funil precisa ter ao menos uma etapa');
    }
    const dealsCount = await this.dealRepository.count({
      where: { stageId },
    });
    if (dealsCount > 0) {
      throw new ConflictException(
        'Não é possível remover uma etapa com deals vinculados',
      );
    }
    await this.stageRepository.remove(stage);
    return { success: true };
  }

  async reorderStages(orgId: string, pipelineId: string, stageIds: string[]) {
    await this.getOrgPipeline(orgId, pipelineId);
    const stages = await this.stageRepository.find({ where: { pipelineId } });
    const stageMap = new Map(stages.map((s) => [s.id, s]));
    const updated: PipelineStage[] = [];
    stageIds.forEach((stageId, index) => {
      const stage = stageMap.get(stageId);
      if (stage) {
        stage.order = index;
        updated.push(stage);
      }
    });
    await this.stageRepository.save(updated);
    return this.stageRepository.find({
      where: { pipelineId },
      order: { order: 'ASC' },
    });
  }

  async setMembers(orgId: string, pipelineId: string, memberIds: string[]) {
    await this.getOrgPipeline(orgId, pipelineId);
    const orgUsers = await this.userRepository.find({ where: { orgId } });
    const validIds = new Set(orgUsers.map((u) => u.id));
    const uniqueMemberIds = [...new Set(memberIds)].filter((id) =>
      validIds.has(id),
    );

    await this.memberRepository.delete({ pipelineId });
    if (uniqueMemberIds.length === 0) {
      return [];
    }
    return this.memberRepository.save(
      uniqueMemberIds.map((userId) =>
        this.memberRepository.create({ pipelineId, userId }),
      ),
    );
  }

  async getMembers(orgId: string, pipelineId: string) {
    await this.getOrgPipeline(orgId, pipelineId);
    return this.memberRepository.find({
      where: { pipelineId },
      relations: ['user'],
    });
  }

  private async getOrgPipeline(orgId: string, id: string): Promise<Pipeline> {
    const pipeline = await this.pipelineRepository.findOne({
      where: { id, orgId },
    });
    if (!pipeline) {
      throw new NotFoundException('Funil não encontrado');
    }
    return pipeline;
  }

  private async getPipelineStage(
    pipelineId: string,
    stageId: string,
  ): Promise<PipelineStage> {
    const stage = await this.stageRepository.findOne({
      where: { id: stageId, pipelineId },
    });
    if (!stage) {
      throw new NotFoundException('Etapa não encontrada');
    }
    return stage;
  }
}
