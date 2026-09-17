import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async record(
    orgId: string,
    userId: string | null,
    action: string,
    options?: {
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await this.repository.save(
      this.repository.create({
        orgId,
        userId: userId ?? undefined,
        action,
        entityType: options?.entityType,
        entityId: options?.entityId,
        metadata: options?.metadata,
      }),
    );
  }

  async findAll(
    orgId: string,
    filters: { from?: string; to?: string; action?: string; limit?: number },
  ) {
    const qb = this.repository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.orgId = :orgId', { orgId });

    if (filters.from) {
      qb.andWhere('log.createdAt >= :from', { from: filters.from });
    }
    if (filters.to) {
      qb.andWhere('log.createdAt <= :to', { to: filters.to });
    }
    if (filters.action) {
      qb.andWhere('log.action = :action', { action: filters.action });
    }

    qb.orderBy('log.createdAt', 'DESC').take(filters.limit ?? 200);
    return qb.getMany();
  }
}
