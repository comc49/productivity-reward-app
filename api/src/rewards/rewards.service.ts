import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Reward } from './reward.model';
import { CreateRewardInput } from './dto/create-reward.input';
import { TasksService } from '../tasks/tasks.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RewardsService {
  private rewards: Reward[] = [
    {
      id: randomUUID(),
      title: '30-minute gaming session',
      description: 'Guilt-free time to play your favourite game.',
      coinCost: 50,
      isRedeemed: false,
    },
    {
      id: randomUUID(),
      title: 'Order a treat',
      description: 'Treat yourself to a snack or meal you enjoy.',
      coinCost: 100,
      isRedeemed: false,
    },
    {
      id: randomUUID(),
      title: 'Movie night',
      description: 'Sit back and watch a film of your choice.',
      coinCost: 150,
      isRedeemed: false,
    },
  ];

  constructor(private readonly tasksService: TasksService) {}

  findAll(): Reward[] {
    return this.rewards;
  }

  findOne(id: string): Reward {
    const reward = this.rewards.find((r) => r.id === id);
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);
    return reward;
  }

  create(input: CreateRewardInput): Reward {
    const reward: Reward = {
      id: randomUUID(),
      ...input,
      isRedeemed: false,
    };
    this.rewards.push(reward);
    return reward;
  }

  redeemReward(id: string): Reward {
    const reward = this.findOne(id);
    if (reward.isRedeemed) {
      throw new BadRequestException(`Reward "${reward.title}" has already been redeemed`);
    }
    this.tasksService.spendCoins(reward.coinCost);
    reward.isRedeemed = true;
    return reward;
  }
}
