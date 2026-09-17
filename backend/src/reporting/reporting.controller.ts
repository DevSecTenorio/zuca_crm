import {
  Controller,
  Get,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from '../deals/deals.service';
import { ActivitiesService } from '../activities/activities.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class ReportingController {
  constructor(
    private readonly dealsService: DealsService,
    private readonly activitiesService: ActivitiesService,
    private readonly pipelinesService: PipelinesService,
    private readonly insightsService: InsightsService,
  ) {}

  @Get()
  async getDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('pipelineId') pipelineId?: string,
  ) {
    const resolvedPipelineId =
      pipelineId ?? (await this.resolveDefaultPipelineId(user));

    const [pipeline, recentActivities] = await Promise.all([
      this.dealsService.pipelineSummary(user.orgId, user, resolvedPipelineId),
      this.activitiesService.findRecent(user.orgId, 10),
    ]);

    return {
      pipeline,
      recentActivities,
      seuZucaSyncStatus: 'not_connected',
    };
  }

  @Get('report')
  getDealsReport(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.dealsService.findForReport(user.orgId, user, {
      from,
      to,
      pipelineId,
    });
  }

  @Get('goals-progress')
  getGoalsProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.insightsService.goalsProgress(
      user.orgId,
      user,
      Number(year),
      Number(month),
      pipelineId,
    );
  }

  @Get('reps-kpis')
  getRepsKpis(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.insightsService.repsKpis(
      user.orgId,
      user,
      from,
      to,
      pipelineId,
    );
  }

  @Get('prospecting')
  getProspecting(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.insightsService.prospecting(
      user.orgId,
      user,
      from,
      to,
      pipelineId,
    );
  }

  private async resolveDefaultPipelineId(
    user: AuthenticatedUser,
  ): Promise<string> {
    const pipelines = await this.pipelinesService.findAllForUser(
      user.orgId,
      user,
    );
    const chosen = pipelines.find((p) => p.isDefault) ?? pipelines[0];
    if (!chosen) {
      throw new NotFoundException('Nenhum funil disponível');
    }
    return chosen.id;
  }
}
