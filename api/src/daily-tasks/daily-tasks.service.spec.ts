import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DailyTasksService } from './daily-tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const USER_ID = 'user-1';
const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const mockTask = {
  id: 'dt-1',
  title: 'Morning workout',
  coinReward: 10,
  lastCompletedDate: null,
  createdAt: new Date(),
  userId: USER_ID,
};

const makePrisma = () => ({
  dailyTask: {
    findMany: vi.fn().mockResolvedValue([mockTask]),
    findFirst: vi.fn().mockResolvedValue(mockTask),
    create: vi.fn().mockResolvedValue(mockTask),
    update: vi.fn().mockResolvedValue({ ...mockTask, lastCompletedDate: TODAY }),
    delete: vi.fn().mockResolvedValue(mockTask),
  },
  wallet: {
    upsert: vi.fn().mockResolvedValue({ id: 'w1', userId: USER_ID, balance: 50 }),
  },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

describe('DailyTasksService', () => {
  let service: DailyTasksService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        DailyTasksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DailyTasksService);
  });

  describe('findAll', () => {
    it('returns daily tasks scoped to the user ordered by createdAt', async () => {
      const tasks = await service.findAll(USER_ID);
      expect(prisma.dailyTask.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'asc' },
      });
      expect(tasks).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('creates a daily task with the userId attached', async () => {
      await service.create({ title: 'Morning workout', coinReward: 10 }, USER_ID);
      expect(prisma.dailyTask.create).toHaveBeenCalledWith({
        data: { title: 'Morning workout', coinReward: 10, userId: USER_ID },
      });
    });
  });

  describe('completeToday', () => {
    it('sets lastCompletedDate to today and credits coins in a transaction', async () => {
      await service.completeToday('dt-1', USER_ID);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.dailyTask.update).toHaveBeenCalledWith({
        where: { id: 'dt-1' },
        data: { lastCompletedDate: TODAY },
      });
      expect(prisma.wallet.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID },
          update: { balance: { increment: mockTask.coinReward } },
        }),
      );
    });

    it('allows completing a task that was last completed yesterday', async () => {
      prisma.dailyTask.findFirst.mockResolvedValue({ ...mockTask, lastCompletedDate: YESTERDAY });
      await expect(service.completeToday('dt-1', USER_ID)).resolves.not.toThrow();
    });

    it('throws BadRequestException when already completed today', async () => {
      prisma.dailyTask.findFirst.mockResolvedValue({ ...mockTask, lastCompletedDate: TODAY });
      await expect(service.completeToday('dt-1', USER_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when task does not belong to user', async () => {
      prisma.dailyTask.findFirst.mockResolvedValue(null);
      await expect(service.completeToday('dt-1', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the task', async () => {
      await service.delete('dt-1', USER_ID);
      expect(prisma.dailyTask.delete).toHaveBeenCalledWith({ where: { id: 'dt-1' } });
    });

    it('throws NotFoundException when task does not belong to user', async () => {
      prisma.dailyTask.findFirst.mockResolvedValue(null);
      await expect(service.delete('dt-1', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
