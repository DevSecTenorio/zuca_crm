import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesGoal } from './sales-goal.entity';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesGoal]), UsersModule],
  providers: [GoalsService],
  controllers: [GoalsController],
  exports: [GoalsService],
})
export class GoalsModule {}
