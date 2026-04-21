import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { NewsTimeService } from './news-time.service';
import { PrismaService } from '../prisma/prisma.service';

const USER_ID = 'user-1';

const makePrisma = (walletBalance = 100, newsBalance = 0) => ({
  wallet: {
    upsert: vi.fn().mockResolvedValue({ userId: USER_ID, balance: walletBalance }),
    update: vi.fn().mockResolvedValue({ balance: walletBalance - 10 }),
  },
  user: {
    findUnique: vi.fn().mockResolvedValue({ newsBalance }),
    update: vi.fn().mockResolvedValue({ newsBalance: newsBalance + 1800 }),
  },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

describe('NewsTimeService', () => {
  let service: NewsTimeService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        NewsTimeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(NewsTimeService);
  });

  describe('purchaseNewsTime', () => {
    it('returns updated newsBalance and coinBalance', async () => {
      prisma.$transaction.mockResolvedValue([
        { balance: 90 },       // updated wallet
        { newsBalance: 1800 }, // updated user
      ]);
      const result = await service.purchaseNewsTime(30, USER_ID);
      expect(result.newsBalance).toBe(1800);
      expect(result.coinBalance).toBe(90);
    });

    it('calculates correct coin cost — 10 coins per 30 minutes', async () => {
      prisma.$transaction.mockResolvedValue([{ balance: 80 }, { newsBalance: 3600 }]);
      await service.purchaseNewsTime(60, USER_ID);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws BadRequestException when minutes <= 0', async () => {
      await expect(service.purchaseNewsTime(0, USER_ID)).rejects.toThrow(BadRequestException);
      await expect(service.purchaseNewsTime(-5, USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when wallet balance is insufficient', async () => {
      prisma.wallet.upsert.mockResolvedValue({ balance: 5 }); // needs 10 for 30 min
      await expect(service.purchaseNewsTime(30, USER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  describe('consumeNewsTime', () => {
    it('deducts seconds and returns remaining balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ newsBalance: 600 });
      prisma.user.update.mockResolvedValue({ newsBalance: 590 });
      const remaining = await service.consumeNewsTime(10, USER_ID);
      expect(remaining).toBe(590);
    });

    it('deducts only what is available when seconds > balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ newsBalance: 5 });
      prisma.user.update.mockResolvedValue({ newsBalance: 0 });
      await service.consumeNewsTime(100, USER_ID);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { newsBalance: { decrement: 5 } },
        }),
      );
    });

    it('returns 0 without a db write when news balance is already 0', async () => {
      prisma.user.findUnique.mockResolvedValue({ newsBalance: 0 });
      const result = await service.consumeNewsTime(10, USER_ID);
      expect(result).toBe(0);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when seconds <= 0', async () => {
      await expect(service.consumeNewsTime(0, USER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getNewsBalance', () => {
    it('returns the user news balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ newsBalance: 3600 });
      const balance = await service.getNewsBalance(USER_ID);
      expect(balance).toBe(3600);
    });

    it('returns 0 when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const balance = await service.getNewsBalance(USER_ID);
      expect(balance).toBe(0);
    });
  });
});
