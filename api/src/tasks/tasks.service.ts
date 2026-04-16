import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput } from './dto/create-task.input';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(input: CreateTaskInput): Promise<Task> {
    return this.prisma.task.create({ data: input });
  }

  async completeTask(id: string): Promise<Task> {
    const task = await this.findOne(id);
    if (task.isCompleted) {
      throw new BadRequestException(`Task "${task.title}" is already completed`);
    }
    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({ where: { id }, data: { isCompleted: true } }),
      this.prisma.wallet.upsert({
        where: { id: 'singleton' },
        update: { balance: { increment: task.coinReward } },
        create: { id: 'singleton', balance: task.coinReward },
      }),
    ]);
    return updatedTask;
  }

  async getBalance(): Promise<number> {
    const wallet = await this.prisma.wallet.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', balance: 0 },
    });
    return wallet.balance;
  }

  async spendCoins(amount: number): Promise<void> {
    const wallet = await this.prisma.wallet.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton', balance: 0 },
    });
    if (amount > wallet.balance) {
      throw new BadRequestException(
        `Not enough coins. Have ${wallet.balance}, need ${amount}`,
      );
    }
    await this.prisma.wallet.update({
      where: { id: 'singleton' },
      data: { balance: { decrement: amount } },
    });
  }
}
