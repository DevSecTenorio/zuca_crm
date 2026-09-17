import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(orgId: string, userId: string, dto: CreateActivityDto) {
    const activity = this.activityRepository.create({
      ...dto,
      orgId,
      createdBy: userId,
      updatedBy: userId,
      // A scheduled agenda item (has a dueAt) starts pending; a retroactive
      // log (call/note with no dueAt) is recorded as already completed.
      completedAt: dto.dueAt ? undefined : new Date(),
    });
    return this.activityRepository.save(activity);
  }

  async logSystemEvent(
    orgId: string,
    params: {
      dealId?: string;
      contactId?: string;
      companyId?: string;
      title: string;
      description?: string;
    },
  ) {
    const activity = this.activityRepository.create({
      orgId,
      type: ActivityType.NOTE,
      title: params.title,
      description: params.description,
      dealId: params.dealId,
      contactId: params.contactId,
      companyId: params.companyId,
      completedAt: new Date(),
    });
    return this.activityRepository.save(activity);
  }

  async findForContact(orgId: string, contactId: string) {
    return this.activityRepository.find({
      where: { orgId, contactId },
      order: { createdAt: 'DESC' },
    });
  }

  async findForDeal(orgId: string, dealId: string) {
    return this.activityRepository.find({
      where: { orgId, dealId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAgenda(
    orgId: string,
    filters: {
      from?: string;
      to?: string;
      assignedTo?: string;
      includeCompleted?: boolean;
    },
  ) {
    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .leftJoinAndSelect('activity.deal', 'deal')
      .leftJoinAndSelect('activity.company', 'company')
      .where('activity.orgId = :orgId', { orgId })
      .andWhere('activity.type IN (:...types)', {
        types: [ActivityType.TASK, ActivityType.MEETING],
      })
      .andWhere('activity.dueAt IS NOT NULL');

    if (filters.from) {
      qb.andWhere('activity.dueAt >= :from', { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere('activity.dueAt <= :to', { to: filters.to });
    }
    if (filters.assignedTo) {
      qb.andWhere('activity.assignedTo = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }
    if (!filters.includeCompleted) {
      qb.andWhere('activity.completedAt IS NULL');
    }

    qb.orderBy('activity.dueAt', 'ASC');
    return qb.getMany();
  }

  async findRecent(orgId: string, limit = 20) {
    return this.activityRepository.find({
      where: { orgId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async update(orgId: string, id: string, dto: UpdateActivityDto) {
    const activity = await this.activityRepository.findOne({
      where: { id, orgId },
    });
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }
    Object.assign(activity, dto);
    return this.activityRepository.save(activity);
  }

  async remove(orgId: string, id: string) {
    const activity = await this.activityRepository.findOne({
      where: { id, orgId },
    });
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }
    await this.activityRepository.remove(activity);
    return { success: true };
  }
}
