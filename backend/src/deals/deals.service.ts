import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Deal, DealStatus } from './deal.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { Product } from '../catalogs/product.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ActivitiesService } from '../activities/activities.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AuditLogService } from '../audit/audit-log.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

const DEAL_RELATIONS = [
  'contact',
  'company',
  'owner',
  'stage',
  'lossReason',
  'products',
];

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal) private readonly dealRepository: Repository<Deal>,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly activitiesService: ActivitiesService,
    private readonly pipelinesService: PipelinesService,
    private readonly auditLogService: AuditLogService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(orgId: string, user: AuthenticatedUser, dto: CreateDealDto) {
    await this.pipelinesService.assertAccess(orgId, user, dto.pipelineId);
    const stage = await this.resolveStage(dto.pipelineId, dto.stageId);
    const products = await this.resolveProducts(orgId, dto.productIds);

    const deal = this.dealRepository.create({
      title: dto.title,
      description: dto.description,
      value: dto.value,
      pipelineId: dto.pipelineId,
      stageId: stage.id,
      contactId: dto.contactId,
      companyId: dto.companyId,
      expectedCloseDate: dto.expectedCloseDate,
      orgId,
      probability: stage.probability,
      ownerId: dto.ownerId ?? user.id,
      products,
    });
    const saved = await this.dealRepository.save(deal);
    await this.activitiesService.logSystemEvent(orgId, {
      dealId: saved.id,
      contactId: saved.contactId,
      companyId: saved.companyId,
      title: 'Deal criado',
      description: `Deal "${saved.title}" criado no estágio ${stage.name}`,
    });
    await this.auditLogService.record(orgId, user.id, 'deal.created', {
      entityType: 'deal',
      entityId: saved.id,
      metadata: { title: saved.title, pipelineId: saved.pipelineId },
    });
    return saved;
  }

  async findAll(
    orgId: string,
    user: AuthenticatedUser,
    filters: { ownerId?: string; pipelineId?: string },
  ) {
    const where: FindOptionsWhere<Deal> = { orgId };
    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.pipelineId) {
      await this.pipelinesService.assertAccess(orgId, user, filters.pipelineId);
      where.pipelineId = filters.pipelineId;
    } else {
      const accessible = await this.pipelinesService.getAccessiblePipelineIds(
        orgId,
        user,
      );
      if (accessible !== null) {
        if (accessible.length === 0) return [];
        where.pipelineId = In(accessible);
      }
    }

    return this.dealRepository.find({
      where,
      relations: DEAL_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(orgId: string, user: AuthenticatedUser, id: string) {
    const deal = await this.dealRepository.findOne({
      where: { id, orgId },
      relations: [...DEAL_RELATIONS, 'pipeline', 'pipeline.stages'],
    });
    if (!deal) {
      throw new NotFoundException('Deal não encontrado');
    }
    await this.pipelinesService.assertAccess(orgId, user, deal.pipelineId);
    return deal;
  }

  async update(
    orgId: string,
    user: AuthenticatedUser,
    id: string,
    dto: UpdateDealDto,
  ) {
    const deal = await this.findOne(orgId, user, id);
    const { productIds, ...rest } = dto;
    Object.assign(deal, rest);
    if (productIds !== undefined) {
      deal.products = await this.resolveProducts(orgId, productIds);
    }
    return this.dealRepository.save(deal);
  }

  async changeStage(
    orgId: string,
    user: AuthenticatedUser,
    id: string,
    stageId: string,
    lossReasonId?: string,
  ) {
    const deal = await this.findOne(orgId, user, id);
    const stage = await this.stageRepository.findOne({
      where: { id: stageId, pipelineId: deal.pipelineId },
    });
    if (!stage) {
      throw new BadRequestException('Etapa não pertence ao funil deste deal');
    }

    const previousStage = deal.stage;
    deal.stageId = stage.id;
    deal.stage = stage;
    deal.probability = stage.probability;
    if (stage.isLost) {
      deal.lossReasonId = lossReasonId ?? null;
    } else {
      deal.lossReasonId = null;
    }
    if (stage.isWon || stage.isLost) {
      deal.closedAt = new Date();
      deal.status = DealStatus.ARCHIVED;
    } else {
      deal.closedAt = null;
      deal.status = DealStatus.ACTIVE;
    }
    const saved = await this.dealRepository.save(deal);

    if (previousStage?.id !== stage.id) {
      await this.activitiesService.logSystemEvent(orgId, {
        dealId: saved.id,
        contactId: saved.contactId,
        companyId: saved.companyId,
        title: 'Mudança de estágio',
        description: `${previousStage?.name ?? '—'} → ${stage.name}`,
      });
      await this.auditLogService.record(orgId, user.id, 'deal.stage_changed', {
        entityType: 'deal',
        entityId: saved.id,
        metadata: { from: previousStage?.name, to: stage.name },
      });
    }
    return saved;
  }

  async remove(orgId: string, user: AuthenticatedUser, id: string) {
    const deal = await this.findOne(orgId, user, id);
    await this.attachmentsService.removeAllForEntity(orgId, 'deal', id);
    await this.dealRepository.remove(deal);
    await this.auditLogService.record(orgId, user.id, 'deal.deleted', {
      entityType: 'deal',
      entityId: id,
      metadata: { title: deal.title },
    });
    return { success: true };
  }

  async pipelineSummary(
    orgId: string,
    user: AuthenticatedUser,
    pipelineId: string,
  ) {
    await this.pipelinesService.assertAccess(orgId, user, pipelineId);
    const stages = await this.stageRepository.find({
      where: { pipelineId },
      order: { order: 'ASC' },
    });
    const deals = await this.dealRepository.find({
      where: { orgId, pipelineId, status: DealStatus.ACTIVE },
      relations: ['stage'],
    });

    const byStage = stages.reduce(
      (acc, stage) => {
        const stageDeals = deals.filter((d) => d.stageId === stage.id);
        acc[stage.id] = {
          count: stageDeals.length,
          totalValue: stageDeals.reduce(
            (sum, d) => sum + Number(d.value ?? 0),
            0,
          ),
        };
        return acc;
      },
      {} as Record<string, { count: number; totalValue: number }>,
    );

    const totalOpenValue = deals.reduce(
      (sum, d) => sum + Number(d.value ?? 0),
      0,
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const stalledDeals = deals.filter((d) => d.updatedAt < sevenDaysAgo);

    return {
      pipelineId,
      byStage,
      totalOpenValue,
      totalDeals: deals.length,
      stalledDeals,
    };
  }

  async findForReport(
    orgId: string,
    user: AuthenticatedUser,
    filters: { from: string; to: string; pipelineId?: string },
  ) {
    const accessible = await this.pipelinesService.getAccessiblePipelineIds(
      orgId,
      user,
    );

    const qb = this.dealRepository
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.contact', 'contact')
      .leftJoinAndSelect('deal.company', 'company')
      .leftJoinAndSelect('deal.stage', 'stage')
      .leftJoinAndSelect('deal.pipeline', 'pipeline')
      .leftJoinAndSelect('deal.owner', 'owner')
      .leftJoinAndSelect('deal.lossReason', 'lossReason')
      .where('deal.orgId = :orgId', { orgId })
      .andWhere('deal.createdAt >= :from', { from: filters.from })
      .andWhere('deal.createdAt <= :to', { to: filters.to });

    if (filters.pipelineId) {
      await this.pipelinesService.assertAccess(orgId, user, filters.pipelineId);
      qb.andWhere('deal.pipelineId = :pipelineId', {
        pipelineId: filters.pipelineId,
      });
    } else if (accessible !== null) {
      if (accessible.length === 0) return [];
      qb.andWhere('deal.pipelineId IN (:...pipelineIds)', {
        pipelineIds: accessible,
      });
    }

    qb.orderBy('deal.createdAt', 'DESC');
    return qb.getMany();
  }

  private async resolveProducts(
    orgId: string,
    productIds?: string[],
  ): Promise<Product[]> {
    if (!productIds || productIds.length === 0) {
      return [];
    }
    return this.productRepository.find({
      where: { id: In(productIds), orgId },
    });
  }

  private async resolveStage(
    pipelineId: string,
    stageId?: string,
  ): Promise<PipelineStage> {
    if (stageId) {
      const stage = await this.stageRepository.findOne({
        where: { id: stageId, pipelineId },
      });
      if (!stage) {
        throw new BadRequestException('Etapa não pertence ao funil informado');
      }
      return stage;
    }
    const first = await this.stageRepository.findOne({
      where: { pipelineId },
      order: { order: 'ASC' },
    });
    if (!first) {
      throw new BadRequestException('O funil não possui etapas');
    }
    return first;
  }
}
