import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CreateTaskInput, Task } from '../models/task.model';
import { WalletStore } from '../../wallet';

type TasksState = {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
};

const GQL = {
  tasks: `{ tasks { id title description coinReward isCompleted } coinBalance }`,
  completeTask: (id: string) =>
    `mutation { completeTask(id: "${id}") { id isCompleted coinReward } }`,
  createTask: `mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) { id title description coinReward isCompleted }
  }`,
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks }) => ({
    pendingTasks: computed(() => tasks().filter((t) => !t.isCompleted)),
    completedTasks: computed(() => tasks().filter((t) => t.isCompleted)),
  })),
  withMethods(
    (store, http = inject(HttpClient), walletStore = inject(WalletStore)) => ({
      async loadTasks(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            http.post<{ data: { tasks: Task[]; coinBalance: number } }>(
              '/graphql',
              { query: GQL.tasks }
            )
          );
          patchState(store, { tasks: res.data.tasks, isLoading: false });
          walletStore.setBalance(res.data.coinBalance);
        } catch {
          patchState(store, { isLoading: false, error: 'Failed to load tasks' });
        }
      },

      async completeTask(id: string): Promise<void> {
        try {
          const res = await firstValueFrom(
            http.post<{ data: { completeTask: Task } }>('/graphql', {
              query: GQL.completeTask(id),
            })
          );
          const done = res.data.completeTask;
          patchState(store, (s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, isCompleted: true } : t
            ),
          }));
          walletStore.addCoins(done.coinReward);
        } catch {
          patchState(store, { error: 'Failed to complete task' });
        }
      },

      async createTask(input: CreateTaskInput): Promise<void> {
        try {
          const res = await firstValueFrom(
            http.post<{ data: { createTask: Task } }>('/graphql', {
              query: GQL.createTask,
              variables: { input },
            })
          );
          patchState(store, (s) => ({
            tasks: [...s.tasks, res.data.createTask],
          }));
        } catch {
          patchState(store, { error: 'Failed to create task' });
        }
      },
    })
  )
);
