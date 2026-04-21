import { Module } from '@nestjs/common';
import { NewsTimeService } from './news-time.service';
import { NewsTimeResolver } from './news-time.resolver';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  providers: [NewsTimeService, NewsTimeResolver, AuthGuard],
})
export class NewsTimeModule {}
