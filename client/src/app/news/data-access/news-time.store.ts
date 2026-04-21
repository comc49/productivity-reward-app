import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WalletStore } from '../../wallet/data-access/wallet.store';
import {
  GET_NEWS_BALANCE,
  PURCHASE_NEWS_TIME,
  CONSUME_NEWS_TIME,
} from './news-time.graphql';

type NewsTimeState = {
  balanceSeconds: number;
  isLoading: boolean;
  error: string | null;
};

export const NewsTimeStore = signalStore(
  { providedIn: 'root' },
  withState<NewsTimeState>({ balanceSeconds: 0, isLoading: false, error: null }),
  withMethods(store => {
    const apollo = inject(Apollo);
    const walletStore = inject(WalletStore);

    return {
      async loadBalance(): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.query({ query: GET_NEWS_BALANCE, fetchPolicy: 'network-only' }),
          );
          patchState(store, { balanceSeconds: res.data?.newsBalance ?? 0 });
        } catch {
          patchState(store, { error: 'Failed to load news balance' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async purchaseNewsTime(minutes: number): Promise<void> {
        patchState(store, { isLoading: true, error: null });
        try {
          const res = await firstValueFrom(
            apollo.mutate({ mutation: PURCHASE_NEWS_TIME, variables: { minutes } }),
          );
          const data = res.data?.purchaseNewsTime;
          if (data) {
            patchState(store, { balanceSeconds: data.newsBalance });
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

      async consumeNewsTime(seconds: number): Promise<void> {
        const snapshot = store.balanceSeconds();
        try {
          const res = await firstValueFrom(
            apollo.mutate({ mutation: CONSUME_NEWS_TIME, variables: { seconds } }),
          );
          const remaining = res.data?.consumeNewsTime ?? Math.max(0, snapshot - seconds);
          patchState(store, { balanceSeconds: remaining as number });
        } catch {
          // keep whatever the local state already shows
        }
      },
    };
  }),
);
