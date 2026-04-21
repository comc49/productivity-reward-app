import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { NewsTimeStore } from './news-time.store';
import { WalletStore } from '../../wallet/data-access/wallet.store';

const makeMockApollo = () => ({
  query: vi.fn().mockReturnValue(of({ data: { newsBalance: 600 } })),
  mutate: vi.fn().mockReturnValue(
    of({ data: { purchaseNewsTime: { newsBalance: 2400, coinBalance: 80 } } }),
  ),
});

describe('NewsTimeStore', () => {
  let store: InstanceType<typeof NewsTimeStore>;
  let mockApollo: { query: ReturnType<typeof vi.fn>; mutate: ReturnType<typeof vi.fn> };
  let walletStore: { setBalance: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockApollo = makeMockApollo();
    walletStore = { setBalance: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        NewsTimeStore,
        { provide: Apollo, useValue: mockApollo },
        { provide: WalletStore, useValue: walletStore },
      ],
    });
    store = TestBed.inject(NewsTimeStore);
  });

  it('starts with zero balance and no error', () => {
    expect(store.balanceSeconds()).toBe(0);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('loadBalance updates balanceSeconds from server', async () => {
    await store.loadBalance();
    expect(store.balanceSeconds()).toBe(600);
  });

  it('purchaseNewsTime updates balanceSeconds and syncs wallet', async () => {
    await store.purchaseNewsTime(60);
    expect(store.balanceSeconds()).toBe(2400);
    expect(walletStore.setBalance).toHaveBeenCalledWith(80);
  });

  it('purchaseNewsTime does not update balance on null response data', async () => {
    mockApollo.mutate.mockReturnValue(of({ data: null }));
    await store.purchaseNewsTime(30);
    expect(store.balanceSeconds()).toBe(0); // unchanged
  });

  it('decrementLocal reduces balance without going below zero', () => {
    store.decrementLocal(100);
    expect(store.balanceSeconds()).toBe(0);
  });

  it('decrementLocal subtracts correctly from a positive balance', async () => {
    await store.loadBalance(); // sets to 600
    store.decrementLocal(100);
    expect(store.balanceSeconds()).toBe(500);
  });

  it('consumeNewsTime reconciles balance with server response', async () => {
    await store.loadBalance(); // sets to 600
    mockApollo.mutate.mockReturnValue(of({ data: { consumeNewsTime: 550 } }));
    await store.consumeNewsTime(10);
    expect(store.balanceSeconds()).toBe(550);
  });
});
