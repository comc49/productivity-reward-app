import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Task } from './task.model';
import { TasksService } from './tasks.service';
import { CreateTaskInput } from './dto/create-task.input';

@Resolver(() => Task)
export class TasksResolver {
  constructor(private readonly tasksService: TasksService) {}

  @Query(() => [Task], { description: 'List all tasks' })
  tasks(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Query(() => Task, { description: 'Get a single task by ID' })
  task(@Args('id', { type: () => ID }) id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Query(() => Int, { description: "Get the current coin balance" })
  coinBalance(): Promise<number> {
    return this.tasksService.getBalance();
  }

  @Mutation(() => Task, { description: 'Create a new task' })
  createTask(@Args('input') input: CreateTaskInput): Promise<Task> {
    return this.tasksService.create(input);
  }

  @Mutation(() => Task, { description: 'Mark a task as completed and earn its coin reward' })
  completeTask(@Args('id', { type: () => ID }) id: string): Promise<Task> {
    return this.tasksService.completeTask(id);
  }
}
