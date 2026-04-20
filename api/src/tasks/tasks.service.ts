import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskInput } from './dto/create-task.input';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  create(input: CreateTaskInput, userId: string): Promise<Task> {
    return this.prisma.task.create({ data: { ...input, userId } });
  }

  async completeTask(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    if (task.isCompleted) {
      throw new BadRequestException(`Task "${task.title}" is already completed`);
    }
    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({ where: { id }, data: { isCompleted: true } }),
      this.prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: task.coinReward } },
        create: { userId, balance: task.coinReward },
      }),
    ]);
    return updatedTask;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });
    return wallet.balance;
  }

  async spendCoins(amount: number, userId: string): Promise<void> {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });
    if (amount > wallet.balance) {
      throw new BadRequestException(
        `Not enough coins. Have ${wallet.balance}, need ${amount}`,
      );
    }
    await this.prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });
  }
}
