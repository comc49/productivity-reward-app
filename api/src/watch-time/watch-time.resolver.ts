import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { WatchTimeService } from './watch-time.service';
import { WatchTimePurchase } from './watch-time-purchase.model';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard)
export class WatchTimeResolver {
  constructor(private readonly watchTimeService: WatchTimeService) {}

  @Query(() => Int, { description: 'Get the watch time balance in seconds for the authenticated user' })
  watchBalance(@CurrentUser() user: User): Promise<number> {
    return this.watchTimeService.getWatchBalance(user.id);
  }

  @Mutation(() => WatchTimePurchase, {
    description: 'Purchase watch time with coins. Rate: 10 coins = 30 minutes.',
  })
  purchaseWatchTime(
    @Args('minutes', { type: () => Int }) minutes: number,
    @CurrentUser() user: User,
  ): Promise<WatchTimePurchase> {
    return this.watchTimeService.purchaseWatchTime(minutes, user.id);
  }
}
