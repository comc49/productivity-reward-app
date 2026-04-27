import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WatchTimeStore } from '../data-access/watch-time.store';
import { buildPackages, formatMinutes } from '../../shared/time-packages';
import { TranslocoModule } from '@jsverse/transloco';
import { WalletStore } from '../../wallet';

const PACKAGES = buildPackages('watch time');

@Component({
  selector: 'app-rewards-page',
  standalone: true,
  imports: [TranslocoModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50" *transloco="let t">
      <!-- Header -->
      <header class="sticky top-0 z-10 border-b border-indigo-800 bg-indigo-700 shadow-md">
        <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div class="flex items-center gap-4">
            <a routerLink="/tasks" class="text-indigo-200 transition hover:text-white text-sm">
              ← Tasks
            </a>
            <h1 class="text-lg font-bold text-white">Rewards Shop</h1>
          </div>

          <div class="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 ring-1 ring-indigo-400 ml-auto me-3"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              [attr.aria-label]="t('wallet.balance') + ': ' + walletStore.balance() + ' coins'"
          >
              <span aria-hidden="true" class="text-lg leading-none">🪙</span>
              <span class="text-sm font-bold text-white">
                {{ walletStore.balance() }}
              </span>
              <span class="sr-only">{{ t('wallet.coins', { count: walletStore.balance() }) }}</span>
          </div>
          <a
            routerLink="/rewards/videos"
            class="rounded-lg bg-indigo-800 px-3 py-1.5 text-xs font-medium
                   text-indigo-200 transition hover:bg-indigo-900 hover:text-white"
          >
            🎬 Browse Videos
          </a>
        </div>
      </header>

      <main class="mx-auto max-w-3xl px-4 py-8 space-y-10">

        <!-- Watch balance card -->
        <section>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your Watch Balance
          </h2>
          <div class="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center
                        rounded-full bg-indigo-100 text-3xl">
              ⏱️
            </div>
            <div class="flex-1">
              @if (store.isLoading() && store.balanceSeconds() === 0) {
                <div class="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
                <div class="mt-1 h-4 w-24 animate-pulse rounded bg-gray-100"></div>
              } @else {
                <p class="text-3xl font-extrabold text-gray-900">{{ formattedBalance() }}</p>
                <p class="text-sm text-gray-500">available to watch</p>
              }
            </div>
            @if (store.balanceSeconds() > 0) {
              <a
                routerLink="/rewards/videos"
                class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold
                       text-white transition hover:bg-indigo-700"
              >
                Watch now
              </a>
            }
          </div>
        </section>

        <!-- Shop -->
        <section>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Buy Watch Time
          </h2>
          <p class="mb-5 text-sm text-gray-500">
            Spend coins earned from completing tasks to unlock video watch time.
            Rate: <span class="font-medium text-gray-700">10 coins = 30 minutes</span>.
          </p>

          @if (store.error()) {
            <div class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {{ store.error() }}
            </div>
          }

          @if (successMessage()) {
            <div class="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {{ successMessage() }}
            </div>
          }

          <div class="grid gap-4 sm:grid-cols-2">
            @for (pkg of packages; track pkg.minutes) {
              <div
                class="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100
                       transition hover:ring-indigo-200"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-900">{{ pkg.label }}</p>
                    <p class="mt-0.5 text-sm text-gray-500">{{ pkg.description }}</p>
                  </div>
                  <span class="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                    {{ pkg.coins }} coins
                  </span>
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <span class="text-2xl font-extrabold text-gray-800">
                    {{ formatMinutes(pkg.minutes) }}
                  </span>
                  <button
                    (click)="purchase(pkg.minutes, pkg.coins)"
                    [disabled]="store.isLoading() || purchasing() === pkg.minutes"
                    class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold
                           text-white transition hover:bg-indigo-700
                           disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    @if (purchasing() === pkg.minutes) {
                      Purchasing…
                    } @else {
                      Buy
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- How it works -->
        <section>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            How It Works
          </h2>
          <div class="grid gap-4 sm:grid-cols-3">
            @for (step of howItWorks; track step.title) {
              <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <span class="text-2xl">{{ step.icon }}</span>
                <p class="mt-3 font-semibold text-gray-900">{{ step.title }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ step.body }}</p>
              </div>
            }
          </div>
        </section>

      </main>
    </div>
  `,
})
export class RewardsPageComponent implements OnInit {
  protected readonly store = inject(WatchTimeStore);
  protected readonly walletStore = inject(WalletStore);

  protected readonly packages = PACKAGES;
  protected readonly formatMinutes = formatMinutes;
  protected readonly purchasing = signal<number | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly formattedBalance = computed(() => {
    const s = this.store.balanceSeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
  });

  protected readonly howItWorks = [
    { icon: '✅', title: 'Complete Tasks', body: 'Finish tasks to earn coins based on their reward value.' },
    { icon: '🛒', title: 'Buy Watch Time', body: 'Spend your coins here to unlock video watch time.' },
    { icon: '🎬', title: 'Watch Videos', body: 'Search and watch YouTube videos. Balance ticks down while playing.' },
  ];

  ngOnInit(): void {
    this.store.loadBalance();
  }

  protected async purchase(minutes: number, coins: number): Promise<void> {
    this.purchasing.set(minutes);
    this.successMessage.set(null);
    try {
      await this.store.purchaseWatchTime(minutes);
      this.successMessage.set(
        `✓ Added ${this.formatMinutes(minutes)} for ${coins} coins!`,
      );
      setTimeout(() => this.successMessage.set(null), 4000);
    } catch {
      // error already set in store
    } finally {
      this.purchasing.set(null);
    }
  }
}
