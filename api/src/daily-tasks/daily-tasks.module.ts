import { Module } from '@nestjs/common';
import { DailyTasksService } from './daily-tasks.service';
import { DailyTasksResolver } from './daily-tasks.resolver';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  providers: [DailyTasksService, DailyTasksResolver, AuthGuard],
})
export class DailyTasksModule {}
