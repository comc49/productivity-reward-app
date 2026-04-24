import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewsTimeStore } from '../data-access/news-time.store';
import { NEWS_SITES, NewsSite } from './news-sites-page.component';

const CONSUME_INTERVAL_S = 10;
const COINS_PER_30_MIN = 10;

type TimerState = 'ready' | 'running' | 'paused' | 'done' | 'blocked';

@Component({
  selector: 'app-news-timer-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="sticky top-0 z-10 border-b border-emerald-800 bg-emerald-700 shadow-md">
        <div class="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <div class="flex items-center gap-4">
            <a routerLink="/news/sites" class="text-emerald-200 transition hover:text-white text-sm">
              ← Sites
            </a>
            <h1 class="text-lg font-bold text-white">{{ site()?.name ?? 'Reading' }}</h1>
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-emerald-800 px-3 py-1.5">
            <span class="text-xs text-emerald-300">Balance:</span>
            <span
              class="font-mono text-sm font-semibold"
              [class.text-white]="store.balanceSeconds() > 0"
              [class.text-red-300]="store.balanceSeconds() === 0"
            >
              {{ formattedBalance() }}
            </span>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-xl px-4 py-12 flex flex-col items-center gap-8">

        <!-- Site card -->
        @if (site(); as s) {
          <div class="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 text-center">
            <span class="text-5xl">{{ s.icon }}</span>
            <p class="mt-3 text-xl font-bold text-gray-900">{{ s.name }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ s.description }}</p>
            <a
              [href]="s.url"
              target="_blank"
              rel="noopener"
              class="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold
                     text-white transition hover:bg-emerald-700"
            >
              Open {{ s.name }} ↗
            </a>
          </div>
        }

        <!-- Timer -->
        @if (timerState() !== 'blocked') {
          <div class="flex flex-col items-center gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              @if (timerState() === 'ready') { Ready to start }
              @else if (timerState() === 'running') { Reading... }
              @else if (timerState() === 'paused') { Paused }
              @else if (timerState() === 'done') { Session complete }
            </p>
            <p
              class="font-mono text-7xl font-extrabold tabular-nums"
              [class.text-emerald-600]="timerState() === 'running'"
              [class.text-gray-400]="timerState() === 'paused' || timerState() === 'ready'"
              [class.text-gray-900]="timerState() === 'done'"
            >
              {{ formattedSessionTime() }}
            </p>
            <p class="text-sm text-gray-400">session time used</p>
          </div>

          <!-- Controls -->
          <div class="flex gap-3">
            @if (timerState() === 'ready' || timerState() === 'paused') {
              <button
                (click)="resume()"
                class="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold
                       text-white transition hover:bg-emerald-700"
              >
                @if (timerState() === 'ready') { Start Timer } @else { Resume }
              </button>
            }
            @if (timerState() === 'running') {
              <button
                (click)="pause()"
                class="rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold
                       text-gray-700 transition hover:bg-gray-300"
              >
                Pause
              </button>
            }
            @if (timerState() !== 'ready' && timerState() !== 'done') {
              <button
                (click)="done()"
                class="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold
                       text-gray-600 transition hover:bg-gray-100"
              >
                Done
              </button>
            }
          </div>

          @if (timerState() === 'done') {
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center text-sm text-emerald-800">
              Great reading session! You used {{ formattedSessionTime() }}.
              <a routerLink="/news/sites" class="ml-2 font-semibold underline">Read more →</a>
            </div>
          }
        }

        <!-- Blocked state -->
        @if (timerState() === 'blocked') {
          <div class="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-sm
                      ring-1 ring-red-200 text-center w-full">
            <span class="text-5xl">⏱️</span>
            <div>
              <p class="text-xl font-bold text-gray-900">Reading time ran out</p>
              <p class="mt-1 text-sm text-gray-500">Purchase more time to keep reading</p>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
              @for (opt of purchaseOptions; track opt.minutes) {
                <button
                  (click)="purchase(opt.minutes)"
                  [disabled]="store.isLoading()"
                  class="rounded-xl border border-emerald-500 bg-emerald-600 px-5 py-3
                         text-sm font-semibold text-white transition hover:bg-emerald-700
                         disabled:opacity-50"
                >
                  {{ opt.minutes }} min
                  <span class="ml-1 text-emerald-300">· {{ opt.coins }} coins</span>
                </button>
              }
            </div>
            @if (purchaseError()) {
              <p class="text-sm text-red-500">{{ purchaseError() }}</p>
            }
          </div>
        }

        <!-- Buy more time bar (while running/paused) -->
        @if (timerState() === 'running' || timerState() === 'paused') {
          <div class="w-full flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3
                      shadow-sm ring-1 ring-gray-100">
            <span class="text-sm text-gray-400">Buy more time:</span>
            @for (opt of purchaseOptions; track opt.minutes) {
              <button
                (click)="purchase(opt.minutes)"
                [disabled]="store.isLoading()"
                class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium
                       transition hover:bg-emerald-100 hover:text-emerald-700
                       disabled:opacity-50"
              >
                +{{ opt.minutes }}m · {{ opt.coins }} coins
              </button>
            }
            @if (purchaseError()) {
              <span class="ml-auto text-xs text-red-500">{{ purchaseError() }}</span>
            }
          </div>
        }

      </main>
    </div>
  `,
})
export class NewsTimerPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(NewsTimeStore);

  protected readonly timerState = signal<TimerState>('ready');
  protected readonly sessionSeconds = signal(0);
  protected readonly purchaseError = signal<string | null>(null);

  private tickInterval?: ReturnType<typeof setInterval>;
  private tickAccum = 0;

  protected readonly site = computed<NewsSite | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return NEWS_SITES.find(s => s.id === id);
  });

  protected readonly formattedBalance = computed(() => {
    const s = this.store.balanceSeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
  });

  protected readonly formattedSessionTime = computed(() => {
    const s = this.sessionSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  protected readonly purchaseOptions = [
    { minutes: 30, coins: COINS_PER_30_MIN },
    { minutes: 60, coins: COINS_PER_30_MIN * 2 },
    { minutes: 90, coins: COINS_PER_30_MIN * 3 },
  ];

  ngOnInit(): void {
    this.store.loadBalance();
  }

  ngOnDestroy(): void {
    this.stopTick();
  }

  protected resume(): void {
    if (this.store.balanceSeconds() <= 0) {
      this.timerState.set('blocked');
      return;
    }
    this.timerState.set('running');
    this.startTick();
  }

  protected pause(): void {
    this.timerState.set('paused');
    this.stopTick();
  }

  protected done(): void {
    this.stopTick();
    this.timerState.set('done');
  }

  private startTick(): void {
    this.stopTick();
    this.tickInterval = setInterval(() => {
      this.tickAccum++;
      this.sessionSeconds.update(s => s + 1);
      this.store.decrementLocal(1);

      if (this.store.balanceSeconds() <= 0) {
        this.timerState.set('blocked');
        this.stopTick();
        return;
      }

      if (this.tickAccum >= CONSUME_INTERVAL_S) {
        this.store.consumeNewsTime(this.tickAccum).then(() => {
          if (this.store.balanceSeconds() <= 0) {
            this.timerState.set('blocked');
          }
        });
        this.tickAccum = 0;
      }
    }, 1000);
  }

  private stopTick(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = undefined;
    }
    if (this.tickAccum > 0) {
      this.store.consumeNewsTime(this.tickAccum);
      this.tickAccum = 0;
    }
  }

  protected async purchase(minutes: number): Promise<void> {
    this.purchaseError.set(null);
    try {
      await this.store.purchaseNewsTime(minutes);
      if (this.timerState() === 'blocked') {
        this.timerState.set('paused');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      this.purchaseError.set(msg.replace('ApolloError: ', ''));
    }
  }
}
