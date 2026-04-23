import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  SubscriptionItem,
  UsageRating,
  GET_SUBSCRIPTIONS,
  CREATE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
} from './subscriptions.graphql';

type SubscriptionsState = {
  subscriptions: SubscriptionItem[];
  isLoading: boolean;
  error: string | null;
};

export const SubscriptionsStore = signalStore(
  { providedIn: 'root' },
  withState<SubscriptionsState>({ subscriptions: [], isLoading: false, error: null }),
  withMethods(store => {
    const apollo = inject(Apollo);

    return {
      async loadSubscriptions(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.query({ query: GET_SUBSCRIPTIONS, fetchPolicy: 'network-only' }),
          );
          patchState(store, { subscriptions: res.data?.subscriptions ?? [] });
        } catch {
          patchState(store, { error: 'Failed to load subscriptions' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async createSubscription(input: {
        name: string;
        company: string;
        category: SubscriptionItem['category'];
        costPerMonth?: number;
        costPerYear?: number;
        renewsAt: string;
      }): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.mutate({ mutation: CREATE_SUBSCRIPTION, variables: { input } }),
          );
          const created = res.data?.createSubscription;
          if (created) {
            patchState(store, { subscriptions: [...store.subscriptions(), created] });
          }
        } catch {
          patchState(store, { error: 'Failed to create subscription' });
          throw new Error('Failed to create subscription');
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async updateUsageRating(id: string, usageRating: UsageRating): Promise<void> {
        try {
          const res = await firstValueFrom(
            apollo.mutate({
              mutation: UPDATE_SUBSCRIPTION,
              variables: { input: { id, usageRating } },
            }),
          );
          const updated = res.data?.updateSubscription;
          if (updated) {
            patchState(store, {
              subscriptions: store.subscriptions().map(s => (s.id === id ? updated : s)),
            });
          }
        } catch {
          patchState(store, { error: 'Failed to update subscription' });
        }
      },

      async deleteSubscription(id: string): Promise<void> {
        try {
          await firstValueFrom(
            apollo.mutate({ mutation: DELETE_SUBSCRIPTION, variables: { id } }),
          );
          patchState(store, {
            subscriptions: store.subscriptions().filter(s => s.id !== id),
          });
        } catch {
          patchState(store, { error: 'Failed to delete subscription' });
        }
      },
    };
  }),
);
