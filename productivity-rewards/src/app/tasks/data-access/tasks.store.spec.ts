import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { TasksStore } from './tasks.store';
import { WalletStore } from '../../wallet/data-access/wallet.store';

const mockTask = {
  id: 't1',
  title: 'Write tests',
  description: null,
  coinReward: 15,
  isCompleted: false,
  order: 1,
};

const taskAt = (id: string, order: number) => ({
  ...mockTask,
  id,
  title: `Task ${id}`,
  order,
});

const makeMockApollo = (overrides?: object) => ({
  query: vi.fn().mockReturnValue(
    of({ data: { tasks: [mockTask], coinBalance: 50 } }),
  ),
  mutate: vi.fn().mockReturnValue(
    of({ data: { completeTask: { id: 't1', isCompleted: true, coinReward: 15 } } }),
  ),
  ...overrides,
});

describe('TasksStore', () => {
  let store: InstanceType<typeof TasksStore>;
  let mockApollo: ReturnType<typeof makeMockApollo>;
  let walletStore: { setBalance: ReturnType<typeof vi.fn>; addCoins: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockApollo = makeMockApollo();
    walletStore = { setBalance: vi.fn(), addCoins: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        TasksStore,
        { provide: Apollo, useValue: mockApollo },
        { provide: WalletStore, useValue: walletStore },
      ],
    });
    store = TestBed.inject(TasksStore);
  });

  describe('initial state', () => {
    it('starts with empty tasks and no error', () => {
      expect(store.tasks()).toEqual([]);
      expect(store.error()).toBeNull();
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('computed signals', () => {
    it('pendingTasks filters incomplete tasks', async () => {
      await store.loadTasks();
      expect(store.pendingTasks()).toHaveLength(1);
      expect(store.completedTasks()).toHaveLength(0);
    });
  });

  describe('loadTasks', () => {
    it('populates tasks and syncs wallet balance', async () => {
      await store.loadTasks();
      expect(store.tasks()).toHaveLength(1);
      expect(walletStore.setBalance).toHaveBeenCalledWith(50);
    });

    it('sets error when query fails', async () => {
      mockApollo.query.mockReturnValue(throwError(() => new Error('network error')));
      await store.loadTasks();
      expect(store.error()).toBe('Failed to load tasks');
    });
  });

  describe('completeTask', () => {
    beforeEach(() => store.loadTasks());

    it('optimistically marks task completed', async () => {
      const promise = store.completeTask('t1');
      expect(store.tasks()[0].isCompleted).toBe(true);
      await promise;
    });

    it('adds coins to wallet on success', async () => {
      await store.completeTask('t1');
      expect(walletStore.addCoins).toHaveBeenCalledWith(15);
    });

    it('rolls back optimistic update on failure', async () => {
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('server error')));
      await store.completeTask('t1');
      expect(store.tasks()[0].isCompleted).toBe(false);
      expect(store.error()).toBe('Failed to complete task');
    });
  });

  describe('createTask', () => {
    it('appends the new task to the list', async () => {
      await store.loadTasks();
      const newTask = { ...mockTask, id: 't2', title: 'New task', order: 2 };
      mockApollo.mutate.mockReturnValue(of({ data: { createTask: newTask } }));
      await store.createTask({ title: 'New task', coinReward: 10 });
      expect(store.tasks()).toHaveLength(2);
      expect(store.tasks()[1].title).toBe('New task');
    });

    it('sets error on failure', async () => {
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('fail')));
      await store.createTask({ title: 'x', coinReward: 5 });
      expect(store.error()).toBe('Failed to create task');
    });
  });

  describe('reorderTasks', () => {
    const seedThree = () => {
      mockApollo.query.mockReturnValueOnce(
        of({
          data: {
            tasks: [taskAt('a', 1), taskAt('b', 2), taskAt('c', 3)],
            coinBalance: 0,
          },
        }),
      );
      return store.loadTasks();
    };

    it('moves a task from one index to another and reassigns order values', async () => {
      await seedThree();
      mockApollo.mutate.mockReturnValue(of({ data: { reorderTasks: [] } }));

      await store.reorderTasks(0, 2);

      const ids = store.tasks().map((t) => t.id);
      const orders = store.tasks().map((t) => t.order);
      expect(ids).toEqual(['b', 'c', 'a']);
      expect(orders).toEqual([1, 2, 3]);
    });

    it('sends the new id order to the reorderTasks mutation', async () => {
      await seedThree();
      mockApollo.mutate.mockReturnValue(of({ data: { reorderTasks: [] } }));

      await store.reorderTasks(2, 0);

      const call = mockApollo.mutate.mock.calls.at(-1)?.[0];
      expect(call?.variables).toEqual({ orderedIds: ['c', 'a', 'b'] });
    });

    it('is a no-op when fromIndex equals toIndex', async () => {
      await seedThree();
      mockApollo.mutate.mockClear();

      await store.reorderTasks(1, 1);

      expect(mockApollo.mutate).not.toHaveBeenCalled();
      expect(store.tasks().map((t) => t.id)).toEqual(['a', 'b', 'c']);
    });

    it('rolls back to the original order when the mutation fails', async () => {
      await seedThree();
      mockApollo.mutate.mockReturnValue(throwError(() => new Error('boom')));

      await store.reorderTasks(0, 2);

      expect(store.tasks().map((t) => t.id)).toEqual(['a', 'b', 'c']);
      expect(store.error()).toBe('Failed to reorder tasks');
    });

    it('ignores out-of-range indices', async () => {
      await seedThree();
      mockApollo.mutate.mockClear();

      await store.reorderTasks(0, 99);

      expect(mockApollo.mutate).not.toHaveBeenCalled();
      expect(store.tasks().map((t) => t.id)).toEqual(['a', 'b', 'c']);
    });
  });
});
