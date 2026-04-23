import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WalletStore } from '../../wallet';
import {
  GET_WATCH_BALANCE,
  PURCHASE_WATCH_TIME,
  CONSUME_WATCH_TIME,
} from './watch-time.graphql';

type WatchTimeState = {
  balanceSeconds: number;
  isLoading: boolean;
  error: string | null;
};

export const WatchTimeStore = signalStore(
  { providedIn: 'root' },
  withState<WatchTimeState>({ balanceSeconds: 0, isLoading: false, error: null }),
  withMethods(store => {
    const apollo = inject(Apollo);
    const walletStore = inject(WalletStore);

    return {
      async loadBalance(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.query({ query: GET_WATCH_BALANCE, fetchPolicy: 'network-only' }),
          );
          patchState(store, { balanceSeconds: res.data?.watchBalance ?? 0 });
        } catch {
          patchState(store, { error: 'Failed to load watch balance' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async purchaseWatchTime(minutes: number): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.mutate({ mutation: PURCHASE_WATCH_TIME, variables: { minutes } }),
          );
          const data = res.data?.purchaseWatchTime;
          if (data) {
            patchState(store, { balanceSeconds: data.watchBalance });
            walletStore.setBalance(data.coinBalance);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Purchase failed';
          patchState(store, { error: msg });
          throw err;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      decrementLocal(seconds: number): void {
        const next = Math.max(0, store.balanceSeconds() - seconds);
        patchState(store, { balanceSeconds: next });
      },

      async consumeWatchTime(seconds: number): Promise<void> {
        const snapshot = store.balanceSeconds();
        try {
          const res = await firstValueFrom(
            apollo.mutate({ mutation: CONSUME_WATCH_TIME, variables: { seconds } }),
          );
          const remaining = res.data?.consumeWatchTime ?? Math.max(0, snapshot - seconds);
          patchState(store, { balanceSeconds: remaining as number });
        } catch {
          // keep whatever the local state already shows
        }
      },
    };
  }),
);
