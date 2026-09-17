import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SegmentsService } from './segments.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';
import { ReorderCatalogDto } from './dto/reorder-catalog.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('segments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('segments')
export class SegmentsController {
  constructor(private readonly service: SegmentsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.orgId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCatalogItemDto,
  ) {
    return this.service.create(user.orgId, dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderCatalogDto,
  ) {
    return this.service.reorder(user.orgId, dto.ids);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    return this.service.update(user.orgId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(user.orgId, id);
  }
}
