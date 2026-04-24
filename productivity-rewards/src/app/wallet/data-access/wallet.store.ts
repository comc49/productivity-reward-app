import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type WalletState = {
  balance: number;
};

export const WalletStore = signalStore(
  { providedIn: 'root' },
  withState<WalletState>({ balance: 0 }),
  withMethods((store) => ({
    addCoins(amount: number): void {
      patchState(store, (s) => ({ balance: s.balance + amount }));
    },
    spendCoins(amount: number): void {
      patchState(store, (s) => ({ balance: Math.max(0, s.balance - amount) }));
    },
    setBalance(balance: number): void {
      patchState(store, { balance });
    },
  }))
);
