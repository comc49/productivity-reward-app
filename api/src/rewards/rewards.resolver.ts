import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { Reward } from './reward.model';
import { RewardsService } from './rewards.service';
import { CreateRewardInput } from './dto/create-reward.input';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Reward)
@UseGuards(AuthGuard)
export class RewardsResolver {
  constructor(private readonly rewardsService: RewardsService) {}

  @Query(() => [Reward], { description: 'List all rewards' })
  rewards() {
    return this.rewardsService.findAll();
  }

  @Query(() => Reward, { description: 'Get a single reward by ID' })
  reward(@Args('id', { type: () => ID }) id: string) {
    return this.rewardsService.findOne(id);
  }

  @Mutation(() => Reward, { description: 'Create a new reward' })
  createReward(@Args('input') input: CreateRewardInput) {
    return this.rewardsService.create(input);
  }

  @Mutation(() => Reward, { description: 'Spend coins to redeem a reward' })
  redeemReward(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.rewardsService.redeemReward(id, user.id);
  }
}
