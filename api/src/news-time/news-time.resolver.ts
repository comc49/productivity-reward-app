import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { User } from '@prisma/client';
import { NewsTimeService } from './news-time.service';
import { NewsTimePurchase } from './news-time-purchase.model';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
@UseGuards(AuthGuard)
export class NewsTimeResolver {
  constructor(private readonly newsTimeService: NewsTimeService) {}

  @Query(() => Int, { description: 'Get the news reading balance in seconds for the authenticated user' })
  newsBalance(@CurrentUser() user: User): Promise<number> {
    return this.newsTimeService.getNewsBalance(user.id);
  }

  @Mutation(() => NewsTimePurchase, {
    description: 'Purchase news reading time with coins. Rate: 10 coins = 30 minutes.',
  })
  purchaseNewsTime(
    @Args('minutes', { type: () => Int }) minutes: number,
    @CurrentUser() user: User,
  ): Promise<NewsTimePurchase> {
    return this.newsTimeService.purchaseNewsTime(minutes, user.id);
  }

  @Mutation(() => Int, {
    description: 'Consume seconds of news reading time. Returns remaining balance.',
  })
  consumeNewsTime(
    @Args('seconds', { type: () => Int }) seconds: number,
    @CurrentUser() user: User,
  ): Promise<number> {
    return this.newsTimeService.consumeNewsTime(seconds, user.id);
  }
}
