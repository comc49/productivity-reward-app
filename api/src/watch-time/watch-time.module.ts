import { Module } from '@nestjs/common';
import { WatchTimeService } from './watch-time.service';
import { WatchTimeResolver } from './watch-time.resolver';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  providers: [WatchTimeService, WatchTimeResolver, AuthGuard],
})
export class WatchTimeModule {}
