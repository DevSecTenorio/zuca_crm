import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ReorderStagesDto } from './dto/reorder-stages.dto';
import { SetMembersDto } from './dto/set-members.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('pipelines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.pipelinesService.findAllForUser(user.orgId, user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pipelinesService.findOneForUser(user.orgId, user, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePipelineDto,
  ) {
    return this.pipelinesService.create(user.orgId, user.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(user.orgId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pipelinesService.remove(user.orgId, user.id, id);
  }

  @Post(':id/stages')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.pipelinesService.addStage(user.orgId, id, dto);
  }

  @Patch(':id/stages/reorder')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  reorderStages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReorderStagesDto,
  ) {
    return this.pipelinesService.reorderStages(user.orgId, id, dto.stageIds);
  }

  @Patch(':id/stages/:stageId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.pipelinesService.updateStage(user.orgId, id, stageId, dto);
  }

  @Delete(':id/stages/:stageId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  removeStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('stageId') stageId: string,
  ) {
    return this.pipelinesService.removeStage(user.orgId, id, stageId);
  }

  @Get(':id/members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getMembers(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pipelinesService.getMembers(user.orgId, id);
  }

  @Put(':id/members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  setMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SetMembersDto,
  ) {
    return this.pipelinesService.setMembers(user.orgId, id, dto.memberIds);
  }
}
