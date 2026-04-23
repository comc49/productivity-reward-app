import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Subscription } from './subscription.model';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { UpdateSubscriptionInput } from './dto/update-subscription.input';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Subscription)
@UseGuards(AuthGuard)
export class SubscriptionsResolver {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Query(() => [Subscription])
  subscriptions(@CurrentUser() user: User): Promise<Subscription[]> {
    return this.subscriptionsService.findAll(user.id);
  }

  @Mutation(() => Subscription)
  createSubscription(
    @Args('input') input: CreateSubscriptionInput,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.create(input, user.id);
  }

  @Mutation(() => Subscription)
  updateSubscription(
    @Args('input') input: UpdateSubscriptionInput,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.update(input, user.id);
  }

  @Mutation(() => Subscription)
  deleteSubscription(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Subscription> {
    return this.subscriptionsService.delete(id, user.id);
  }
}
