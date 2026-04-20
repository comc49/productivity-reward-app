import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WatchTimePurchase } from './watch-time-purchase.model';

const COINS_PER_30_MIN = 10;

@Injectable()
export class WatchTimeService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseWatchTime(minutes: number, userId: string): Promise<WatchTimePurchase> {
    if (minutes <= 0) {
      throw new BadRequestException('Minutes must be greater than 0');
    }

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
        data: { watchBalance: { increment: secondsToAdd } },
      }),
    ]);

    return {
      watchBalance: updatedUser.watchBalance,
      coinBalance: updatedWallet.balance,
    };
  }

  async getWatchBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { watchBalance: true },
    });
    return user?.watchBalance ?? 0;
  }
}
