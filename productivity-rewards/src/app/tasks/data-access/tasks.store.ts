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
import { CreateTaskInput, Task } from '../models/task.model';
import { WalletStore } from '../../wallet';
import {
  COMPLETE_TASK,
  CREATE_TASK,
  GET_TASKS,
} from './tasks.graphql';

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

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tasks }) => ({
    pendingTasks: computed(() => tasks().filter((t) => !t.isCompleted)),
    completedTasks: computed(() => tasks().filter((t) => t.isCompleted)),
  })),
  withMethods(
    (store, apollo = inject(Apollo), walletStore = inject(WalletStore)) => ({
      async loadTasks(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const result = await firstValueFrom(
            apollo.query({
              query: GET_TASKS,
              fetchPolicy: 'network-only',
            })
          );
          const data = result.data;
          if (!data) return;
          patchState(store, { tasks: data.tasks, isLoading: false });
          walletStore.setBalance(data.coinBalance);
        } catch {
          patchState(store, { isLoading: false, error: 'Failed to load tasks' });
        }
      },

      async completeTask(id: string): Promise<void> {
        // Optimistically mark the task as completed in the UI immediately
        patchState(store, (s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, isCompleted: true } : t
          ),
        }));

        try {
          const result = await firstValueFrom(
            apollo.mutate({
              mutation: COMPLETE_TASK,
              variables: { id },
            })
          );

          if (!result.data) return;

          // Sync the confirmed coin reward from the server response
          walletStore.addCoins(result.data.completeTask.coinReward);
        } catch {
          // Roll back the optimistic update on failure
          patchState(store, (s) => ({
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, isCompleted: false } : t
            ),
            error: 'Failed to complete task',
          }));
        }
      },

      async createTask(input: CreateTaskInput): Promise<void> {
        try {
          const result = await firstValueFrom(
            apollo.mutate({
              mutation: CREATE_TASK,
              variables: { input },
            })
          );
          if (!result.data) return;
          patchState(store, (s) => ({
            tasks: [...s.tasks, result.data!.createTask],
          }));
        } catch {
          patchState(store, { error: 'Failed to create task' });
        }
      },
    })
  )
);
