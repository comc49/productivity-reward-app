import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksResolver } from './tasks.resolver';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  providers: [TasksService, TasksResolver, AuthGuard],
  exports: [TasksService],
})
export class TasksModule {}
