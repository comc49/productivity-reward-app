import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Task } from './task.model';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './dto/create-task.input';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Task)
@UseGuards(AuthGuard)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { description: 'List all tasks for the authenticated user' })
  tasks(@CurrentUser() user: User): Promise<Task[]> {
    return this.tasksService.findAll(user.id);
  }

  @Query(() => Task, { description: 'Get a single task by ID' })
  task(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.findOne(id, user.id);
  }

  @Query(() => Int, { description: 'Get the coin balance for the authenticated user' })
  coinBalance(@CurrentUser() user: User): Promise<number> {
    return this.tasksService.getBalance(user.id);
  }

  @Mutation(() => Task, { description: 'Create a new task' })
  createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(input, user.id);
  }

  @Mutation(() => Task, { description: 'Mark a task as completed and earn its coin reward' })
  completeTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.completeTask(id, user.id);
  }

  @Mutation(() => Task, { description: 'Delete a completed task' })
  deleteTask(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.deleteTask(id, user.id);
  }
}
