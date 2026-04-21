import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsTimeStore } from '../data-access/news-time.store';

const PACKAGES = [
  { minutes: 30,  coins: 10,  label: 'Starter',  description: '30 min of reading time' },
  { minutes: 60,  coins: 20,  label: 'Standard',  description: '1 hour of reading time' },
  { minutes: 120, coins: 40,  label: 'Extended',  description: '2 hours of reading time' },
  { minutes: 300, coins: 100, label: 'Marathon',  description: '5 hours of reading time' },
];

@Component({
  selector: 'app-news-shop-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="sticky top-0 z-10 border-b border-emerald-800 bg-emerald-700 shadow-md">
        <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div class="flex items-center gap-4">
            <a routerLink="/tasks" class="text-emerald-200 transition hover:text-white text-sm">
              ← Tasks
            </a>
            <h1 class="text-lg font-bold text-white">News Shop</h1>
          </div>
          <a
            routerLink="/news/sites"
            class="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-medium
                   text-emerald-200 transition hover:bg-emerald-900 hover:text-white"
          >
            📰 Browse News
          </a>
        </div>
      </header>

      <main class="mx-auto max-w-3xl px-4 py-8 space-y-10">

        <!-- Balance card -->
        <section>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Your Reading Balance
          </h2>
          <div class="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div class="flex h-16 w-16 shrink-0 items-center justify-center
                        rounded-full bg-emerald-100 text-3xl">
              📰
            </div>
            <div class="flex-1">
              @if (store.isLoading() && store.balanceSeconds() === 0) {
                <div class="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
                <div class="mt-1 h-4 w-24 animate-pulse rounded bg-gray-100"></div>
              } @else {
                <p class="text-3xl font-extrabold text-gray-900">{{ formattedBalance() }}</p>
                <p class="text-sm text-gray-500">available to read</p>
              }
            </div>
            @if (store.balanceSeconds() > 0) {
              <a
                routerLink="/news/sites"
                class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold
                       text-white transition hover:bg-emerald-700"
              >
                Read now
              </a>
            }
          </div>
        </section>

        <!-- Shop -->
        <section>
          <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Buy Reading Time
          </h2>
          <p class="mb-5 text-sm text-gray-500">
            Spend coins earned from completing tasks to unlock news reading time.
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
                       transition hover:ring-emerald-200"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-gray-900">{{ pkg.label }}</p>
                    <p class="mt-0.5 text-sm text-gray-500">{{ pkg.description }}</p>
                  </div>
                  <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
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
                    class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold
                           text-white transition hover:bg-emerald-700
                           disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    @if (purchasing() === pkg.minutes) { Purchasing… } @else { Buy }
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
export class NewsShopPageComponent implements OnInit {
  protected readonly store = inject(NewsTimeStore);
  protected readonly packages = PACKAGES;
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
    { icon: '🛒', title: 'Buy Reading Time', body: 'Spend your coins here to unlock news reading time.' },
    { icon: '📰', title: 'Read News', body: 'Pick a site, start a timer, and read. Balance counts down while unpaused.' },
  ];

  ngOnInit(): void {
    this.store.loadBalance();
  }

  protected formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  protected async purchase(minutes: number, coins: number): Promise<void> {
    this.purchasing.set(minutes);
    this.successMessage.set(null);
    try {
      await this.store.purchaseNewsTime(minutes);
      this.successMessage.set(`✓ Added ${this.formatMinutes(minutes)} for ${coins} coins!`);
      setTimeout(() => this.successMessage.set(null), 4000);
    } catch {
      // error already set in store
    } finally {
      this.purchasing.set(null);
    }
  }
}
