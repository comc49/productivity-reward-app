import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reward } from './reward.model';
import { RewardsService } from './rewards.service';
import { CreateRewardInput } from './dto/create-reward.input';

@Resolver(() => Reward)
export class RewardsResolver {
  constructor(private readonly rewardsService: RewardsService) {}

  @Query(() => [Reward], { description: 'List all rewards' })
  rewards(): Reward[] {
    return this.rewardsService.findAll();
  }

  @Query(() => Reward, { description: 'Get a single reward by ID' })
  reward(@Args('id', { type: () => ID }) id: string): Reward {
    return this.rewardsService.findOne(id);
  }

  @Mutation(() => Reward, { description: 'Create a new reward' })
  createReward(@Args('input') input: CreateRewardInput): Reward {
    return this.rewardsService.create(input);
  }

  @Mutation(() => Reward, { description: 'Spend coins to redeem a reward' })
  redeemReward(@Args('id', { type: () => ID }) id: string): Reward {
    return this.rewardsService.redeemReward(id);
  }
}
