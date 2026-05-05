import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { DailyTasksStore } from './daily-tasks.store';
import { WalletStore } from '../../wallet/data-access/wallet.store';

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const mockTask = {
  id: 'dt-1',
  title: 'Morning workout',
  coinReward: 10,
  lastCompletedDate: null,
};

const makeMockApollo = (overrides?: object) => ({
  query: vi.fn().mockReturnValue(
    of({ data: { dailyTasks: [mockTask] } }),
  ),
  mutate: vi.fn().mockReturnValue(
    of({ data: { completeDailyTask: { id: 'dt-1', lastCompletedDate: TODAY, coinReward: 10 } } }),
  ),
  ...overrides,
});

describe('DailyTasksStore', () => {
  let store: InstanceType<typeof DailyTasksStore>;
  let mockApollo: ReturnType<typeof makeMockApollo>;
  let walletStore: { addCoins: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockApollo = makeMockApollo();
    walletStore = { addCoins: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        DailyTasksStore,
        { provide: Apollo, useValue: mockApollo },
        { provide: WalletStore, useValue: walletStore },
      ],
    });
    store = TestBed.inject(DailyTasksStore);
  });

  describe('initial state', () => {
    it('starts with empty tasks and no error', () => {
      expect(store.dailyTasks()).toEqual([]);
      expect(store.error()).toBeNull();
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('dailyTasksWithStatus', () => {
    it('marks task as completedToday when lastCompletedDate is today', async () => {
      mockApollo.query.mockReturnValue(
        of({ data: { dailyTasks: [{ ...mockTask, lastCompletedDate: TODAY }] } }),
      );
      await store.loadDailyTasks();
      expect(store.dailyTasksWithStatus()[0].completedToday).toBe(true);
    });

    it('marks task as not completedToday when lastCompletedDate is yesterday', async () => {
      mockApollo.query.mockReturnValue(
        of({ data: { dailyTasks: [{ ...mockTask, lastCompletedDate: YESTERDAY }] } }),
      );
      await store.loadDailyTasks();
      expect(store.dailyTasksWithStatus()[0].completedToday).toBe(false);
    });

    it('marks task as not completedToday when lastCompletedDate is null', async () => {
      await store.loadDailyTasks();
      expect(store.dailyTasksWithStatus()[0].completedToday).toBe(false);
    });
  });

  describe('loadDailyTasks', () => {
    it('populates dailyTasks on success', async () => {
      await store.loadDailyTasks();
      expect(store.dailyTasks()).toHaveLength(1);
      expect(store.dailyTasks()[0].title).toBe('Morning workout');
    });

    it('sets error when query fails', async () => {
      mockApollo.query.mockReturnValue(throwError(() => new Error('network error')));
      await store.loadDailyTasks();
      expect(store.error()).toBe('Failed to load daily tasks');
    });
  });

  describe('completeTask', () => {
    beforeEach(() => store.loadDailyTasks());

    it('optimistically sets lastCompletedDate to today', async () => {
      const promise = store.completeTask('dt-1');
      expect(store.dailyTasks()[0].lastCompletedDate).toBe(TODAY);
      await promise;
    });

    it('adds coins to wallet on success', async () => {
      await store.completeTask('dt-1');
      expect(walletStore.addCoins).toHaveBeenCalledWith(10);
    });

    it('rolls back optimistic update on failure', async () => {
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('server error')));
      await store.completeTask('dt-1');
      expect(store.dailyTasks()[0].lastCompletedDate).toBeNull();
      expect(store.error()).toBe('Failed to complete task');
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => store.loadDailyTasks());

    it('optimistically removes the task', async () => {
      const promise = store.deleteTask('dt-1');
      expect(store.dailyTasks()).toHaveLength(0);
      await promise;
    });

    it('restores tasks on failure', async () => {
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('server error')));
      await store.deleteTask('dt-1');
      expect(store.dailyTasks()).toHaveLength(1);
      expect(store.error()).toBe('Failed to delete task');
    });
  });

  describe('createTask', () => {
    it('appends the new task to the list', async () => {
      await store.loadDailyTasks();
      const newTask = { ...mockTask, id: 'dt-2', title: 'Evening run' };
      mockApollo.mutate.mockReturnValue(of({ data: { createDailyTask: newTask } }));
      await store.createTask({ title: 'Evening run', coinReward: 10 });
      expect(store.dailyTasks()).toHaveLength(2);
      expect(store.dailyTasks()[1].title).toBe('Evening run');
    });

    it('sets error on failure', async () => {
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('fail')));
      await store.createTask({ title: 'x', coinReward: 5 });
      expect(store.error()).toBe('Failed to create daily task');
    });
  });
});
