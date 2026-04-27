import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VideoSearchStore } from '../data-access/video-search.store';
import { WalletStore } from '../../wallet';
import { TranslocoModule } from "@jsverse/transloco";

@Component({
  selector: 'app-video-search-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule],
  template: `
    <div class="min-h-screen bg-gray-50" *transloco="let t">
      <!-- Header -->
      <header class="sticky top-0 z-10 border-b border-indigo-800 bg-indigo-700 shadow-md">
        <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4">
          <a routerLink="/tasks" class="text-indigo-200 transition hover:text-white">
            ← Tasks
          </a>
          <h1 class="text-lg font-bold text-white">Video Rewards</h1>
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
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-8">
        <!-- Search bar -->
        <form (ngSubmit)="onSearch()" class="flex gap-3">
          <input
            type="search"
            [value]="searchStore.query()"
            (input)="searchStore.setQuery($any($event.target).value)"
            name="query"
            placeholder="Search YouTube videos…"
            class="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3
                   text-sm shadow-sm outline-none transition
                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            [disabled]="searchStore.loading()"
          />
          <button
            type="submit"
            [disabled]="!searchStore.query().trim() || searchStore.loading()"
            class="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white
                   shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            @if (searchStore.loading()) { Searching… } @else { Search }
          </button>
        </form>

        <!-- Error -->
        @if (searchStore.error()) {
          <div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ searchStore.error() }}
          </div>
        }

        <!-- Empty state -->
        @if (!searchStore.loading() && !searchStore.error() && searchStore.hasSearched() && searchStore.videos().length === 0) {
          <div class="mt-16 text-center text-gray-400">
            <p class="text-lg">No results found for "{{ searchStore.lastQuery() }}"</p>
            <p class="mt-1 text-sm">Try a different keyword.</p>
          </div>
        }

        <!-- Initial prompt -->
        @if (!searchStore.hasSearched() && !searchStore.loading()) {
          <div class="mt-16 text-center text-gray-400">
            <span class="text-5xl">🎬</span>
            <p class="mt-4 text-lg font-medium text-gray-500">Search for videos to watch</p>
            <p class="mt-1 text-sm">Earn coins from tasks, then spend them on watch time.</p>
          </div>
        }

        <!-- Loading skeleton -->
        @if (searchStore.loading()) {
          <div class="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            @for (_ of skeletons; track $index) {
              <div class="animate-pulse rounded-2xl bg-white shadow-sm">
                <div class="aspect-video rounded-t-2xl bg-gray-200"></div>
                <div class="p-3 space-y-2">
                  <div class="h-3 rounded bg-gray-200 w-3/4"></div>
                  <div class="h-3 rounded bg-gray-200 w-1/2"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Results grid -->
        @if (!searchStore.loading() && searchStore.videos().length > 0) {
          <p class="mt-6 mb-3 text-sm text-gray-500">
            Results for <span class="font-medium text-gray-700">"{{ searchStore.lastQuery() }}"</span>
          </p>
          <div class="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            @for (video of searchStore.videos(); track video.id) {
              <article
                class="group flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-100
                       transition hover:shadow-md hover:ring-indigo-200 cursor-pointer"
                (click)="openVideo(video.id)"
                (keydown.enter)="openVideo(video.id)"
                tabindex="0"
                [attr.aria-label]="video.title"
                role="button"
              >
                <!-- Thumbnail -->
                <div class="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-100">
                  <img
                    [src]="video.thumbnailUrl"
                    [alt]="video.title"
                    class="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <!-- Duration badge -->
                  <span
                    class="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5
                           text-xs font-medium text-white"
                  >
                    {{ video.duration }}
                  </span>
                </div>

                <!-- Info -->
                <div class="flex flex-1 flex-col gap-1 p-3">
                  <p class="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
                    {{ video.title }}
                  </p>
                  <p class="mt-auto text-xs text-gray-400">{{ video.channelTitle }}</p>
                </div>
              </article>
            }
          </div>
        }
      </main>
    </div>
  `,
})
export class VideoSearchPageComponent {
  protected readonly searchStore = inject(VideoSearchStore);
  protected readonly walletStore = inject(WalletStore);
  private router = inject(Router);

  protected readonly skeletons = Array(8);

  onSearch(): void {
    this.searchStore.search();
  }

  openVideo(videoId: string): void {
    this.router.navigate(['/rewards/videos', videoId]);
  }
}
