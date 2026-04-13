import { Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsResolver } from './rewards.resolver';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TasksModule],
  providers: [RewardsService, RewardsResolver],
})
export class RewardsModule {}
