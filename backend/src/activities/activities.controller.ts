import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activitiesService.create(user.orgId, user.id, dto);
  }

  @Get()
  findRecent(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    return this.activitiesService.findRecent(
      user.orgId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('agenda')
  findAgenda(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('includeCompleted') includeCompleted?: string,
  ) {
    return this.activitiesService.findAgenda(user.orgId, {
      from,
      to,
      assignedTo,
      includeCompleted: includeCompleted === 'true',
    });
  }

  @Get('contact/:contactId')
  findForContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('contactId') contactId: string,
  ) {
    return this.activitiesService.findForContact(user.orgId, contactId);
  }

  @Get('deal/:dealId')
  findForDeal(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dealId') dealId: string,
  ) {
    return this.activitiesService.findForDeal(user.orgId, dealId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(user.orgId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.activitiesService.remove(user.orgId, id);
  }
}
