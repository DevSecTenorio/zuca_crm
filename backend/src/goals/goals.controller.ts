import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findForPeriod(
    @CurrentUser() user: AuthenticatedUser,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.goalsService.findForPeriod(user.orgId, user, year, month);
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertGoalDto) {
    return this.goalsService.upsert(user.orgId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.goalsService.remove(user.orgId, id);
  }
}
