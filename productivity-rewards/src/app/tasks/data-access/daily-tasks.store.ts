import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Apollo } from 'apollo-angular';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { CreateDailyTaskInput, DailyTask } from '../models/daily-task.model';
import { WalletStore } from '../../wallet';
import {
  COMPLETE_DAILY_TASK,
  CREATE_DAILY_TASK,
  DELETE_DAILY_TASK,
  GET_DAILY_TASKS,
} from './daily-tasks.graphql';

type DailyTasksState = {
  dailyTasks: DailyTask[];
  isLoading: boolean;
  error: string | null;
};

const initialState: DailyTasksState = {
  dailyTasks: [],
  isLoading: false,
  error: null,
};

export const DailyTasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ dailyTasks }) => ({
    dailyTasksWithStatus: computed(() => {
      const today = new Date().toISOString().slice(0, 10);
      return dailyTasks().map((t) => ({
        ...t,
        completedToday: t.lastCompletedDate === today,
      }));
    }),
  })),
  withMethods(
    (store, apollo = inject(Apollo), walletStore = inject(WalletStore)) => ({
      async loadDailyTasks(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const result = await firstValueFrom(
            apollo.query({ query: GET_DAILY_TASKS, fetchPolicy: 'network-only' })
          );
          if (!result.data) return;
          patchState(store, { dailyTasks: result.data.dailyTasks, isLoading: false });
        } catch {
          patchState(store, { isLoading: false, error: 'Failed to load daily tasks' });
        }
      },

      async completeTask(id: string): Promise<void> {
        const today = new Date().toISOString().slice(0, 10);
        patchState(store, (s) => ({
          dailyTasks: s.dailyTasks.map((t) =>
            t.id === id ? { ...t, lastCompletedDate: today } : t
          ),
        }));
        try {
          const result = await firstValueFrom(
            apollo.mutate({ mutation: COMPLETE_DAILY_TASK, variables: { id } })
          );
          if (!result.data) return;
          walletStore.addCoins(result.data.completeDailyTask.coinReward);
        } catch {
          patchState(store, (s) => ({
            dailyTasks: s.dailyTasks.map((t) =>
              t.id === id ? { ...t, lastCompletedDate: null } : t
            ),
            error: 'Failed to complete task',
          }));
        }
      },

      async deleteTask(id: string): Promise<void> {
        const snapshot = store.dailyTasks();
        patchState(store, (s) => ({
          dailyTasks: s.dailyTasks.filter((t) => t.id !== id),
        }));
        try {
          await firstValueFrom(
            apollo.mutate({ mutation: DELETE_DAILY_TASK, variables: { id } })
          );
        } catch {
          patchState(store, { dailyTasks: snapshot, error: 'Failed to delete task' });
        }
      },

      async createTask(input: CreateDailyTaskInput): Promise<void> {
        try {
          const result = await firstValueFrom(
            apollo.mutate({ mutation: CREATE_DAILY_TASK, variables: { input } })
          );
          if (!result.data) return;
          patchState(store, (s) => ({
            dailyTasks: [...s.dailyTasks, result.data!.createDailyTask],
          }));
        } catch {
          patchState(store, { error: 'Failed to create daily task' });
        }
      },
    })
  )
);
