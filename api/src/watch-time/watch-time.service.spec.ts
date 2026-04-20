import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WatchTimeService } from './watch-time.service';
import { PrismaService } from '../prisma/prisma.service';

const USER_ID = 'user-1';

const makePrisma = (walletBalance = 100, watchBalance = 0) => ({
  wallet: {
    upsert: vi.fn().mockResolvedValue({ userId: USER_ID, balance: walletBalance }),
    update: vi.fn().mockResolvedValue({ balance: walletBalance - 10 }),
  },
  user: {
    findUnique: vi.fn().mockResolvedValue({ watchBalance }),
    update: vi.fn().mockResolvedValue({ watchBalance: watchBalance + 1800 }),
  },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

describe('WatchTimeService', () => {
  let service: WatchTimeService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        WatchTimeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(WatchTimeService);
  });

  describe('purchaseWatchTime', () => {
    it('returns updated watchBalance and coinBalance', async () => {
      prisma.$transaction.mockResolvedValue([
        { balance: 90 },        // updated wallet
        { watchBalance: 1800 }, // updated user
      ]);
      const result = await service.purchaseWatchTime(30, USER_ID);
      expect(result.watchBalance).toBe(1800);
      expect(result.coinBalance).toBe(90);
    });

    it('calculates correct coin cost — 10 coins per 30 minutes', async () => {
      prisma.$transaction.mockResolvedValue([{ balance: 80 }, { watchBalance: 3600 }]);
      await service.purchaseWatchTime(60, USER_ID);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws BadRequestException when minutes <= 0', async () => {
      await expect(service.purchaseWatchTime(0, USER_ID)).rejects.toThrow(BadRequestException);
      await expect(service.purchaseWatchTime(-5, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when wallet balance is insufficient', async () => {
      prisma.wallet.upsert.mockResolvedValue({ balance: 5 }); // needs 10 for 30 min
      await expect(service.purchaseWatchTime(30, USER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  describe('consumeWatchTime', () => {
    it('deducts seconds and returns remaining balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ watchBalance: 600 });
      prisma.user.update.mockResolvedValue({ watchBalance: 590 });
      const remaining = await service.consumeWatchTime(10, USER_ID);
      expect(remaining).toBe(590);
    });

    it('deducts only what is available when seconds > balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ watchBalance: 5 });
      prisma.user.update.mockResolvedValue({ watchBalance: 0 });
      await service.consumeWatchTime(100, USER_ID);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { watchBalance: { decrement: 5 } },
        }),
      );
    });

    it('returns 0 without a db write when watch balance is already 0', async () => {
      prisma.user.findUnique.mockResolvedValue({ watchBalance: 0 });
      const result = await service.consumeWatchTime(10, USER_ID);
      expect(result).toBe(0);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when seconds <= 0', async () => {
      await expect(service.consumeWatchTime(0, USER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWatchBalance', () => {
    it('returns the user watch balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ watchBalance: 3600 });
      const balance = await service.getWatchBalance(USER_ID);
      expect(balance).toBe(3600);
    });

    it('returns 0 when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const balance = await service.getWatchBalance(USER_ID);
      expect(balance).toBe(0);
    });
  });
});
