import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../deals/deal.entity';
import { Contact } from '../contacts/contact.entity';
import { Company } from '../companies/company.entity';
import { Activity } from '../activities/activity.entity';
import { PipelineStage } from '../pipelines/pipeline-stage.entity';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../users/user.entity';
import { GoalsService } from '../goals/goals.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Deal) private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    private readonly usersService: UsersService,
    private readonly goalsService: GoalsService,
    private readonly pipelinesService: PipelinesService,
  ) {}

  private async resolvePipelineFilter(
    orgId: string,
    user: AuthenticatedUser,
    pipelineId?: string,
  ): Promise<{
    sql: string;
    param: string | string[] | null;
    blocked: boolean;
  }> {
    if (pipelineId) {
      await this.pipelinesService.assertAccess(orgId, user, pipelineId);
      return {
        sql: 'AND d.pipeline_id = $PARAM',
        param: pipelineId,
        blocked: false,
      };
    }
    const accessible = await this.pipelinesService.getAccessiblePipelineIds(
      orgId,
      user,
    );
    if (accessible === null) {
      return { sql: '', param: null, blocked: false };
    }
    if (accessible.length === 0) {
      return { sql: '', param: null, blocked: true };
    }
    return {
      sql: 'AND d.pipeline_id = ANY($PARAM)',
      param: accessible,
      blocked: false,
    };
  }

  async goalsProgress(
    orgId: string,
    user: AuthenticatedUser,
    from: string,
    to: string,
    pipelineId?: string,
  ) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const reps = await this.goalsService.findForRange(
      orgId,
      user,
      fromDate,
      toDate,
    );

    const zeroTotals = {
      targetValue: 0,
      targetCount: 0,
      wonValue: 0,
      wonCount: 0,
      progressValuePct: null as number | null,
      progressCountPct: null as number | null,
    };

    if (reps.length === 0) {
      return { from, to, reps: [], orgTotals: zeroTotals };
    }

    const filter = await this.resolvePipelineFilter(orgId, user, pipelineId);
    const rows = filter.blocked
      ? []
      : await this.dealRepository.query(
          `SELECT d.owner_id as "ownerId", SUM(d.value) as "wonValue", COUNT(*) as "wonCount"
           FROM deals d
           JOIN pipeline_stages s ON s.id = d.stage_id
           WHERE d.org_id = $1 AND s.is_won = true AND d.closed_at BETWEEN $2 AND $3
           ${filter.param ? filter.sql.replace('$PARAM', '$4') : ''}
           GROUP BY d.owner_id`,
          filter.param
            ? [orgId, fromDate, toDate, filter.param]
            : [orgId, fromDate, toDate],
        );

    const repsWithProgress = reps.map((r) => {
      const row = rows.find((x: { ownerId: string }) => x.ownerId === r.userId);
      const wonValue = Number(row?.wonValue ?? 0);
      const wonCount = Number(row?.wonCount ?? 0);
      return {
        ...r,
        wonValue,
        wonCount,
        progressValuePct:
          r.targetValue > 0 ? round1((wonValue / r.targetValue) * 100) : null,
        progressCountPct:
          r.targetCount > 0 ? round1((wonCount / r.targetCount) * 100) : null,
      };
    });

    const totals = repsWithProgress.reduce(
      (acc, r) => ({
        targetValue: acc.targetValue + r.targetValue,
        targetCount: acc.targetCount + r.targetCount,
        wonValue: acc.wonValue + r.wonValue,
        wonCount: acc.wonCount + r.wonCount,
      }),
      { targetValue: 0, targetCount: 0, wonValue: 0, wonCount: 0 },
    );

    return {
      from,
      to,
      reps: repsWithProgress,
      orgTotals: {
        ...totals,
        progressValuePct:
          totals.targetValue > 0
            ? round1((totals.wonValue / totals.targetValue) * 100)
            : null,
        progressCountPct:
          totals.targetCount > 0
            ? round1((totals.wonCount / totals.targetCount) * 100)
            : null,
      },
    };
  }

  async repsKpis(
    orgId: string,
    user: AuthenticatedUser,
    from: string,
    to: string,
    pipelineId?: string,
  ) {
    const allUsers = await this.usersService.findAllForOrg(orgId);
    const targetUsers =
      user.role === UserRole.REP
        ? allUsers.filter((u) => u.id === user.id)
        : allUsers.filter((u) => u.status === UserStatus.ACTIVE);

    if (targetUsers.length === 0) {
      return { from, to, reps: [] };
    }

    const filter = await this.resolvePipelineFilter(orgId, user, pipelineId);
    if (filter.blocked) {
      return {
        from,
        to,
        reps: targetUsers.map((u) => ({
          userId: u.id,
          userName: u.name,
          dealsCreated: 0,
          dealsWon: 0,
          dealsLost: 0,
          wonValue: 0,
          winRate: null,
          avgDealValue: null,
          avgCycleDays: null,
          openDeals: 0,
          openValue: 0,
          activitiesLogged: 0,
        })),
      };
    }

    const pipelineParams = filter.param ? [filter.param] : [];
    const pipelineSqlCreated = filter.param
      ? filter.sql.replace('$PARAM', '$4')
      : '';
    const pipelineSqlOpen = filter.param
      ? filter.sql.replace('$PARAM', '$2')
      : '';

    const [createdRows, closedRows, openRows, activityRows] = await Promise.all(
      [
        this.dealRepository.query(
          `SELECT d.owner_id as "ownerId", COUNT(*) as "dealsCreated"
         FROM deals d
         WHERE d.org_id = $1 AND d.created_at BETWEEN $2 AND $3 ${pipelineSqlCreated}
         GROUP BY d.owner_id`,
          [orgId, from, to, ...pipelineParams],
        ),
        this.dealRepository.query(
          `SELECT d.owner_id as "ownerId",
                COUNT(*) FILTER (WHERE s.is_won) as "dealsWon",
                COUNT(*) FILTER (WHERE s.is_lost) as "dealsLost",
                COALESCE(SUM(d.value) FILTER (WHERE s.is_won), 0) as "wonValue",
                AVG(EXTRACT(EPOCH FROM (d.closed_at - d.created_at)) / 86400) FILTER (WHERE s.is_won) as "avgCycleDays"
         FROM deals d
         JOIN pipeline_stages s ON s.id = d.stage_id
         WHERE d.org_id = $1 AND d.closed_at BETWEEN $2 AND $3 ${pipelineSqlCreated}
         GROUP BY d.owner_id`,
          [orgId, from, to, ...pipelineParams],
        ),
        this.dealRepository.query(
          `SELECT d.owner_id as "ownerId", COUNT(*) as "openDeals", COALESCE(SUM(d.value), 0) as "openValue"
         FROM deals d
         WHERE d.org_id = $1 AND d.status = 'active' ${pipelineSqlOpen}
         GROUP BY d.owner_id`,
          [orgId, ...pipelineParams],
        ),
        this.activityRepository.query(
          `SELECT created_by as "userId", COUNT(*) as "activitiesLogged"
         FROM activities
         WHERE org_id = $1 AND created_at BETWEEN $2 AND $3 AND created_by IS NOT NULL
         GROUP BY created_by`,
          [orgId, from, to],
        ),
      ],
    );

    const reps = targetUsers
      .map((u) => {
        const created = createdRows.find(
          (r: { ownerId: string }) => r.ownerId === u.id,
        );
        const closed = closedRows.find(
          (r: { ownerId: string }) => r.ownerId === u.id,
        );
        const open = openRows.find(
          (r: { ownerId: string }) => r.ownerId === u.id,
        );
        const act = activityRows.find(
          (r: { userId: string }) => r.userId === u.id,
        );

        const dealsWon = Number(closed?.dealsWon ?? 0);
        const dealsLost = Number(closed?.dealsLost ?? 0);
        const wonValue = Number(closed?.wonValue ?? 0);
        const totalClosed = dealsWon + dealsLost;
        const avgCycleDaysRaw = closed?.avgCycleDays;

        return {
          userId: u.id,
          userName: u.name,
          dealsCreated: Number(created?.dealsCreated ?? 0),
          dealsWon,
          dealsLost,
          wonValue,
          winRate:
            totalClosed > 0 ? round1((dealsWon / totalClosed) * 100) : null,
          avgDealValue:
            dealsWon > 0 ? Math.round((wonValue / dealsWon) * 100) / 100 : null,
          avgCycleDays:
            avgCycleDaysRaw != null ? round1(Number(avgCycleDaysRaw)) : null,
          openDeals: Number(open?.openDeals ?? 0),
          openValue: Number(open?.openValue ?? 0),
          activitiesLogged: Number(act?.activitiesLogged ?? 0),
        };
      })
      .sort((a, b) => b.wonValue - a.wonValue);

    return { from, to, reps };
  }

  async prospecting(
    orgId: string,
    user: AuthenticatedUser,
    from: string,
    to: string,
    pipelineId?: string,
  ) {
    const filter = await this.resolvePipelineFilter(orgId, user, pipelineId);

    const [newContactsRow] = await this.contactRepository.query(
      `SELECT COUNT(*) as count FROM contacts WHERE org_id = $1 AND created_at BETWEEN $2 AND $3`,
      [orgId, from, to],
    );
    const [newCompaniesRow] = await this.companyRepository.query(
      `SELECT COUNT(*) as count FROM companies WHERE org_id = $1 AND created_at BETWEEN $2 AND $3`,
      [orgId, from, to],
    );

    const pipelineParams = filter.param ? [filter.param] : [];
    const pipelineSql = filter.param ? filter.sql.replace('$PARAM', '$4') : '';

    const [newDealsRow] = filter.blocked
      ? [{ count: 0, value: 0 }]
      : await this.dealRepository.query(
          `SELECT COUNT(*) as count, COALESCE(SUM(d.value), 0) as value
           FROM deals d
           WHERE d.org_id = $1 AND d.created_at BETWEEN $2 AND $3 ${pipelineSql}`,
          [orgId, from, to, ...pipelineParams],
        );

    const bySource = await this.contactRepository.query(
      `SELECT c.source_id as "sourceId", COALESCE(ls.name, 'Sem origem') as "sourceName", COUNT(*) as count
       FROM contacts c
       LEFT JOIN lead_sources ls ON ls.id = c.source_id
       WHERE c.org_id = $1 AND c.created_at BETWEEN $2 AND $3
       GROUP BY c.source_id, ls.name
       ORDER BY count DESC`,
      [orgId, from, to],
    );

    const [contactsByDay, dealsByDay] = await Promise.all([
      this.contactRepository.query(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, COUNT(*) as count
         FROM contacts WHERE org_id = $1 AND created_at BETWEEN $2 AND $3
         GROUP BY 1 ORDER BY 1`,
        [orgId, from, to],
      ),
      filter.blocked
        ? []
        : this.dealRepository.query(
            `SELECT to_char(date_trunc('day', d.created_at), 'YYYY-MM-DD') as date, COUNT(*) as count
             FROM deals d
             WHERE d.org_id = $1 AND d.created_at BETWEEN $2 AND $3 ${pipelineSql}
             GROUP BY 1 ORDER BY 1`,
            [orgId, from, to, ...pipelineParams],
          ),
    ]);

    const timeline = this.buildDailyTimeline(
      from,
      to,
      contactsByDay,
      dealsByDay,
    );

    let funnel: {
      stageId: string;
      stageName: string;
      count: number;
      totalValue: number;
    }[] = [];

    const funnelPipelineId =
      pipelineId ?? (await this.resolveAnyAccessiblePipelineId(orgId, user));
    if (funnelPipelineId) {
      const stages = await this.stageRepository.find({
        where: { pipelineId: funnelPipelineId },
        order: { order: 'ASC' },
      });
      const stageRows = await this.dealRepository.query(
        `SELECT stage_id as "stageId", COUNT(*) as count, COALESCE(SUM(value), 0) as "totalValue"
         FROM deals WHERE org_id = $1 AND pipeline_id = $2 AND status = 'active'
         GROUP BY stage_id`,
        [orgId, funnelPipelineId],
      );
      funnel = stages.map((stage) => {
        const row = stageRows.find(
          (r: { stageId: string }) => r.stageId === stage.id,
        );
        return {
          stageId: stage.id,
          stageName: stage.name,
          count: Number(row?.count ?? 0),
          totalValue: Number(row?.totalValue ?? 0),
        };
      });
    }

    return {
      from,
      to,
      newContacts: Number(newContactsRow?.count ?? 0),
      newCompanies: Number(newCompaniesRow?.count ?? 0),
      newDeals: {
        count: Number(newDealsRow?.count ?? 0),
        value: Number(newDealsRow?.value ?? 0),
      },
      bySource: bySource.map(
        (r: { sourceId: string; sourceName: string; count: string }) => ({
          sourceId: r.sourceId,
          sourceName: r.sourceName,
          count: Number(r.count),
        }),
      ),
      timeline,
      funnel,
    };
  }

  private async resolveAnyAccessiblePipelineId(
    orgId: string,
    user: AuthenticatedUser,
  ): Promise<string | null> {
    const pipelines = await this.pipelinesService.findAllForUser(orgId, user);
    const chosen = pipelines.find((p) => p.isDefault) ?? pipelines[0];
    return chosen?.id ?? null;
  }

  private buildDailyTimeline(
    from: string,
    to: string,
    contactsByDay: { date: string; count: string }[],
    dealsByDay: { date: string; count: string }[],
  ) {
    const contactsMap = new Map(
      contactsByDay.map((r) => [r.date, Number(r.count)]),
    );
    const dealsMap = new Map(dealsByDay.map((r) => [r.date, Number(r.count)]));

    const start = new Date(from);
    const end = new Date(to);
    const days: { date: string; contacts: number; deals: number }[] = [];
    const cursor = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cursor <= last) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
        cursor.getDate(),
      ).padStart(2, '0')}`;
      days.push({
        date: key,
        contacts: contactsMap.get(key) ?? 0,
        deals: dealsMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }
}
