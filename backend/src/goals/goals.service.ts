import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesGoal } from './sales-goal.entity';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/user.entity';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UserRole } from '../users/user.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(SalesGoal)
    private readonly goalRepository: Repository<SalesGoal>,
    private readonly usersService: UsersService,
  ) {}

  async findForPeriod(
    orgId: string,
    user: AuthenticatedUser,
    year: number,
    month: number,
  ) {
    const goals = await this.goalRepository.find({
      where: { orgId, year, month },
    });

    if (user.role === UserRole.REP) {
      const own = goals.find((g) => g.userId === user.id);
      const activeUser = await this.usersService.findOne(orgId, user.id);
      return [
        {
          userId: user.id,
          userName: activeUser.name,
          targetValue: Number(own?.targetValue ?? 0),
          targetCount: Number(own?.targetCount ?? 0),
        },
      ];
    }

    const allUsers = await this.usersService.findAllForOrg(orgId);
    const activeUsers = allUsers.filter((u) => u.status === UserStatus.ACTIVE);
    return activeUsers.map((u) => {
      const goal = goals.find((g) => g.userId === u.id);
      return {
        userId: u.id,
        userName: u.name,
        targetValue: Number(goal?.targetValue ?? 0),
        targetCount: Number(goal?.targetCount ?? 0),
      };
    });
  }

  async upsert(orgId: string, dto: UpsertGoalDto) {
    let goal = await this.goalRepository.findOne({
      where: { orgId, userId: dto.userId, year: dto.year, month: dto.month },
    });
    if (!goal) {
      goal = this.goalRepository.create({ orgId, ...dto });
    } else {
      goal.targetValue = dto.targetValue;
      goal.targetCount = dto.targetCount;
    }
    return this.goalRepository.save(goal);
  }

  async remove(orgId: string, id: string) {
    const goal = await this.goalRepository.findOne({ where: { id, orgId } });
    if (!goal) {
      throw new NotFoundException('Meta não encontrada');
    }
    await this.goalRepository.remove(goal);
    return { success: true };
  }
}
