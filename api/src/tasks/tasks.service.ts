import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Task } from './task.model';
import { CreateTaskInput } from './dto/create-task.input';
import { randomUUID } from 'crypto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: randomUUID(),
      title: 'Read for 30 minutes',
      description: 'Read a book or article to expand your knowledge.',
      coinReward: 20,
      isCompleted: false,
    },
    {
      id: randomUUID(),
      title: 'Exercise',
      description: 'Do at least 30 minutes of physical activity.',
      coinReward: 50,
      isCompleted: false,
    },
    {
      id: randomUUID(),
      title: 'Deep work session',
      description: 'Complete a 90-minute focused work block with no distractions.',
      coinReward: 100,
      isCompleted: false,
    },
  ];

  private coinBalance = 0;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: randomUUID(),
      ...input,
      isCompleted: false,
    };
    this.tasks.push(task);
    return task;
  }

  completeTask(id: string): Task {
    const task = this.findOne(id);
    if (task.isCompleted) {
      throw new BadRequestException(`Task "${task.title}" is already completed`);
    }
    task.isCompleted = true;
    this.coinBalance += task.coinReward;
    return task;
  }

  getBalance(): number {
    return this.coinBalance;
  }

  spendCoins(amount: number): void {
    if (amount > this.coinBalance) {
      throw new BadRequestException(
        `Not enough coins. Have ${this.coinBalance}, need ${amount}`,
      );
    }
    this.coinBalance -= amount;
  }
}
