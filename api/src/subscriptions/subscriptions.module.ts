import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsResolver } from './subscriptions.resolver';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  providers: [SubscriptionsService, SubscriptionsResolver, AuthGuard],
})
export class SubscriptionsModule {}
