import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const USER_ID = 'user-1';

const mockTask = {
  id: 'task-1',
  title: 'Write tests',
  description: null,
  coinReward: 10,
  isCompleted: false,
  createdAt: new Date(),
  userId: USER_ID,
};

const makePrisma = () => ({
  task: {
    findMany: vi.fn().mockResolvedValue([mockTask]),
    findFirst: vi.fn().mockResolvedValue(mockTask),
    create: vi.fn().mockResolvedValue(mockTask),
    update: vi.fn().mockResolvedValue({ ...mockTask, isCompleted: true }),
  },
  wallet: {
    upsert: vi.fn().mockResolvedValue({ id: 'w1', userId: USER_ID, balance: 50 }),
    update: vi.fn().mockResolvedValue({ balance: 40 }),
  },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
});

describe('TasksService', () => {
  let service: TasksService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(TasksService);
  });

  describe('findAll', () => {
    it('returns tasks scoped to the user', async () => {
      const tasks = await service.findAll(USER_ID);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        orderBy: { createdAt: 'asc' },
      });
      expect(tasks).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the task when found', async () => {
      const task = await service.findOne('task-1', USER_ID);
      expect(task.id).toBe('task-1');
    });

    it('throws NotFoundException when task does not belong to user', async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a task with the userId attached', async () => {
      await service.create({ title: 'Test', coinReward: 5 }, USER_ID);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { title: 'Test', coinReward: 5, userId: USER_ID },
      });
    });
  });

  describe('completeTask', () => {
    it('marks task complete and credits coins in a transaction', async () => {
      await service.completeTask('task-1', USER_ID);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws BadRequestException when task is already completed', async () => {
      prisma.task.findFirst.mockResolvedValue({ ...mockTask, isCompleted: true });
      await expect(service.completeTask('task-1', USER_ID)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBalance', () => {
    it('returns wallet balance for the user', async () => {
      const balance = await service.getBalance(USER_ID);
      expect(balance).toBe(50);
    });
  });

  describe('spendCoins', () => {
    it('decrements wallet balance', async () => {
      await service.spendCoins(10, USER_ID);
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        data: { balance: { decrement: 10 } },
      });
    });

    it('throws BadRequestException when balance is insufficient', async () => {
      prisma.wallet.upsert.mockResolvedValue({ balance: 5 });
      await expect(service.spendCoins(10, USER_ID)).rejects.toThrow(BadRequestException);
    });
  });
});
