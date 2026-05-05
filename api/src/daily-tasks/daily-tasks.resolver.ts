import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { DailyTask } from './daily-task.model';
import { DailyTasksService } from './daily-tasks.service';
import { CreateDailyTaskInput } from './dto/create-daily-task.input';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => DailyTask)
@UseGuards(AuthGuard)
export class DailyTasksResolver {
  constructor(private readonly dailyTasksService: DailyTasksService) {}

  @Query(() => [DailyTask])
  dailyTasks(@CurrentUser() user: User) {
    return this.dailyTasksService.findAll(user.id);
  }

  @Mutation(() => DailyTask)
  createDailyTask(
    @Args('input') input: CreateDailyTaskInput,
    @CurrentUser() user: User,
  ) {
    return this.dailyTasksService.create(input, user.id);
  }

  @Mutation(() => DailyTask)
  completeDailyTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.dailyTasksService.completeToday(id, user.id);
  }

  @Mutation(() => DailyTask)
  deleteDailyTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.dailyTasksService.delete(id, user.id);
  }
}
