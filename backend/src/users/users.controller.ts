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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeOwnPasswordDto } from './dto/change-own-password.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAllForOrg(user.orgId);
  }

  @Get('me')
  getOwnProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findOne(user.orgId, user.id);
  }

  @Patch('me')
  updateOwnProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.orgId, user.id, dto);
  }

  @Patch('me/password')
  changeOwnPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangeOwnPasswordDto,
  ) {
    return this.usersService.changeOwnPassword(user.orgId, user.id, dto);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user.orgId, user.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.orgId, user.id, id, dto);
  }

  @Patch(':id/password')
  @Roles(UserRole.ADMIN)
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.orgId, user.id, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.usersService.remove(user.orgId, user.id, id);
  }
}
