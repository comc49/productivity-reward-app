import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewsTimePurchase } from './news-time-purchase.model';

const COINS_PER_30_MIN = 10;

@Injectable()
export class NewsTimeService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseNewsTime(minutes: number, userId: string): Promise<NewsTimePurchase> {
    if (minutes <= 0) throw new BadRequestException('Minutes must be greater than 0');

    const coinsRequired = Math.ceil((minutes / 30) * COINS_PER_30_MIN);
    const secondsToAdd = minutes * 60;

    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId, balance: 0 },
    });

    if (wallet.balance < coinsRequired) {
      throw new BadRequestException(
        `Not enough coins. Need ${coinsRequired}, have ${wallet.balance}.`,
      );
    }

    const [updatedWallet, updatedUser] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: coinsRequired } },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { newsBalance: { increment: secondsToAdd } },
      }),
    ]);

    return {
      newsBalance: updatedUser.newsBalance,
      coinBalance: updatedWallet.balance,
    };
  }

  async consumeNewsTime(seconds: number, userId: string): Promise<number> {
    if (seconds <= 0) throw new BadRequestException('Seconds must be greater than 0');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { newsBalance: true },
    });

    const current = user?.newsBalance ?? 0;
    const deduct = Math.min(seconds, current);

    if (deduct === 0) return 0;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { newsBalance: { decrement: deduct } },
      select: { newsBalance: true },
    });

    return updated.newsBalance;
  }

  async getNewsBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { newsBalance: true },
    });
    return user?.newsBalance ?? 0;
  }
}
