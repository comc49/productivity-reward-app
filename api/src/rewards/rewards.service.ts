import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRewardInput } from './dto/create-reward.input';
import { TasksService } from '../tasks/tasks.service';
import { Reward } from '@prisma/client';

@Injectable()
export class RewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(): Promise<Reward[]> {
    return this.prisma.reward.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);
    return reward;
  }

  create(input: CreateRewardInput): Promise<Reward> {
    return this.prisma.reward.create({ data: input });
  }

  async redeemReward(id: string, userId: string): Promise<Reward> {
    const reward = await this.findOne(id);
    if (reward.isRedeemed) {
      throw new BadRequestException(`Reward "${reward.title}" has already been redeemed`);
    }
    await this.tasksService.spendCoins(reward.coinCost, userId);
    return this.prisma.reward.update({ where: { id }, data: { isRedeemed: true } });
  }
}
