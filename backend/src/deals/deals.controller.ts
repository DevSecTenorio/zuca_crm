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
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDealDto) {
    return this.dealsService.create(user.orgId, user, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('ownerId') ownerId?: string,
    @Query('pipelineId') pipelineId?: string,
  ) {
    return this.dealsService.findAll(user.orgId, user, { ownerId, pipelineId });
  }

  @Get('summary')
  pipelineSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('pipelineId') pipelineId: string,
  ) {
    return this.dealsService.pipelineSummary(user.orgId, user, pipelineId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.dealsService.findOne(user.orgId, user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.update(user.orgId, user, id, dto);
  }

  @Patch(':id/stage')
  changeStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ChangeStageDto,
  ) {
    return this.dealsService.changeStage(
      user.orgId,
      user,
      id,
      dto.stageId,
      dto.lossReasonId,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.dealsService.remove(user.orgId, user, id);
  }
}
