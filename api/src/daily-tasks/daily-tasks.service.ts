import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyTaskInput } from './dto/create-daily-task.input';

@Injectable()
export class DailyTasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.dailyTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(input: CreateDailyTaskInput, userId: string) {
    return this.prisma.dailyTask.create({ data: { ...input, userId } });
  }

  async completeToday(id: string, userId: string) {
    const task = await this.prisma.dailyTask.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException(`Daily task ${id} not found`);

    const today = new Date().toISOString().slice(0, 10);
    if (task.lastCompletedDate === today) {
      throw new BadRequestException('Task already completed today');
    }

    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.dailyTask.update({
        where: { id },
        data: { lastCompletedDate: today },
      }),
      this.prisma.wallet.upsert({
        where: { userId },
        update: { balance: { increment: task.coinReward } },
        create: { userId, balance: task.coinReward },
      }),
    ]);
    return updatedTask;
  }

  async delete(id: string, userId: string) {
    const task = await this.prisma.dailyTask.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException(`Daily task ${id} not found`);
    return this.prisma.dailyTask.delete({ where: { id } });
  }
}
