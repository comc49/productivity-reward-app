import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ElementRef,
  viewChild,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WatchTimeStore } from '../data-access/watch-time.store';
import { WalletStore } from '../../wallet';
import { TranslocoModule } from "@jsverse/transloco";

interface YTPlayer {
  pauseVideo(): void;
  playVideo(): void;
  destroy(): void;
}

interface YTWindow {
  YT: {
    Player: new (el: HTMLElement, opts: object) => YTPlayer;
    PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
  };
  onYouTubeIframeAPIReady?: () => void;
}

type PlayerState = 'idle' | 'playing' | 'paused' | 'ended' | 'blocked';

const CONSUME_INTERVAL_S = 10;
const COINS_PER_10_MIN = 10;

@Component({
  selector: 'app-video-player-page',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslocoModule],
  template: `
    <div class="min-h-screen bg-gray-900 text-white" *transloco="let t">
      <!-- Header -->
      <header class="border-b border-gray-700 bg-gray-800">
        <div class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <a routerLink="/rewards/videos" class="text-sm text-gray-400 transition hover:text-white">
            ← Back to search
          </a>
           <div class="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 ring-1 ring-indigo-400"
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
          <div class="ml-auto flex items-center gap-3">
            <span class="text-sm text-gray-400">Watch balance:</span>
            <span
              class="font-mono text-sm font-semibold"
              [class.text-green-400]="watchTimeStore.balanceSeconds() > 0"
              [class.text-red-400]="watchTimeStore.balanceSeconds() === 0"
            >
              {{ formattedBalance() }}
            </span>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-4 py-6">
        <!-- Player container -->
        <div class="relative w-full overflow-hidden rounded-2xl bg-black" style="aspect-ratio:16/9">
          <div #playerContainer class="h-full w-full"></div>

          <!-- Blocked overlay -->
          @if (playerState() === 'blocked') {
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-6
                        bg-black/90 px-6 text-center backdrop-blur-sm">
              <span class="text-5xl">⏱️</span>
              <div>
                <p class="text-xl font-bold">Your watch time ran out</p>
                <p class="mt-1 text-sm text-gray-400">Purchase more time to keep watching</p>
              </div>
              <div class="flex flex-wrap justify-center gap-3">
                @for (opt of watchOptions; track opt.minutes) {
                  <button
                    (click)="purchase(opt.minutes)"
                    [disabled]="watchTimeStore.isLoading()"
                    class="rounded-xl border border-indigo-500 bg-indigo-600 px-5 py-3
                           text-sm font-semibold transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {{ opt.minutes }} min
                    <span class="ml-1 text-indigo-300">· {{ opt.coins }} coins</span>
                  </button>
                }
              </div>
              @if (purchaseError()) {
                <p class="text-sm text-red-400">{{ purchaseError() }}</p>
              }
            </div>
          }

          <!-- Loading overlay -->
          @if (playerState() === 'idle') {
            <div class="absolute inset-0 flex items-center justify-center bg-black">
              <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
            </div>
          }
        </div>

        <!-- Buy more time bar -->
        @if (playerState() !== 'blocked' && playerState() !== 'idle') {
          <div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-gray-800 px-4 py-3">
            <span class="text-sm text-gray-400">Buy more time:</span>
            @for (opt of watchOptions; track opt.minutes) {
              <button
                (click)="purchase(opt.minutes)"
                [disabled]="watchTimeStore.isLoading()"
                class="rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium
                       transition hover:bg-indigo-600 disabled:opacity-50"
              >
                +{{ opt.minutes }}m · {{ opt.coins }} coins
              </button>
            }
            @if (purchaseError()) {
              <span class="ml-auto text-xs text-red-400">{{ purchaseError() }}</span>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class VideoPlayerPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  protected readonly watchTimeStore = inject(WatchTimeStore);
  protected readonly walletStore = inject(WalletStore);


  private playerContainer = viewChild.required<ElementRef>('playerContainer');
  private player?: YTPlayer;
  private tickInterval?: ReturnType<typeof setInterval>;
  private tickAccum = 0;

  protected readonly playerState = signal<PlayerState>('idle');
  protected readonly purchaseError = signal<string | null>(null);

  protected readonly formattedBalance = computed(() => {
    const s = this.watchTimeStore.balanceSeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}h ${String(m).padStart(2, '0')}m`
      : `${m}:${String(sec).padStart(2, '0')}`;
  });

  protected readonly watchOptions = [
    { minutes: 10, coins: COINS_PER_10_MIN },
    { minutes: 20, coins: COINS_PER_10_MIN * 2 },
    { minutes: 30, coins: COINS_PER_10_MIN * 3 },
  ];

  ngOnInit(): void {
    this.watchTimeStore.loadBalance();
    if (isPlatformBrowser(this.platformId)) {
      this.loadYouTubeApi();
    }
  }

  ngOnDestroy(): void {
    this.stopTick();
    this.player?.destroy();
  }

  private get yt(): YTWindow['YT'] {
    return (window as unknown as YTWindow).YT;
  }

  private loadYouTubeApi(): void {
    const videoId = this.route.snapshot.paramMap.get('id') ?? '';
    const win = window as unknown as YTWindow;

    const init = () => {
      this.player = new this.yt.Player(this.playerContainer().nativeElement, {
        videoId,
        playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => this.playerState.set('paused'),
          onStateChange: (e: { data: number }) => this.onPlayerStateChange(e.data),
        },
      });
    };

    if (win.YT?.Player) {
      init();
    } else {
      win.onYouTubeIframeAPIReady = init;
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }
  }

  private onPlayerStateChange(state: number): void {
    const S = this.yt.PlayerState;

    if (state === S.PLAYING) {
      if (this.watchTimeStore.balanceSeconds() <= 0) {
        this.player?.pauseVideo();
        this.playerState.set('blocked');
        return;
      }
      this.playerState.set('playing');
      this.startTick();
    } else if (state === S.PAUSED) {
      if (this.playerState() !== 'blocked') this.playerState.set('paused');
      this.stopTick();
    } else if (state === S.ENDED) {
      this.playerState.set('ended');
      this.stopTick();
    }
  }

  private startTick(): void {
    this.stopTick();
    this.tickAccum = 0;
    this.tickInterval = setInterval(() => {
      this.tickAccum++;
      this.watchTimeStore.decrementLocal(1);

      if (this.watchTimeStore.balanceSeconds() <= 0) {
        this.player?.pauseVideo();
        this.playerState.set('blocked');
        this.stopTick();
        return;
      }

      if (this.tickAccum >= CONSUME_INTERVAL_S) {
        this.watchTimeStore.consumeWatchTime(this.tickAccum).then(() => {
          if (this.watchTimeStore.balanceSeconds() <= 0) {
            this.player?.pauseVideo();
            this.playerState.set('blocked');
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
      this.watchTimeStore.consumeWatchTime(this.tickAccum);
      this.tickAccum = 0;
    }
  }

  protected async purchase(minutes: number): Promise<void> {
    this.purchaseError.set(null);
    try {
      await this.watchTimeStore.purchaseWatchTime(minutes);
      if (this.playerState() === 'blocked') {
        this.playerState.set('paused');
        this.player?.playVideo();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Purchase failed';
      this.purchaseError.set(msg.replace('ApolloError: ', ''));
    }
  }
}
