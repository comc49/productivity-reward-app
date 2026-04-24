import { Component, inject, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NewsTimeStore } from '../data-access/news-time.store';

export interface NewsSite {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
}

export const NEWS_SITES: NewsSite[] = [
  { id: 'electrek',   name: 'Electrek',    description: 'EV and clean energy news',        url: 'https://electrek.co',             icon: '⚡', category: 'EV & Energy' },
  { id: 'teslarati',  name: 'Teslarati',   description: 'Tesla and EV coverage',            url: 'https://www.teslarati.com',       icon: '🚗', category: 'EV & Energy' },
  { id: 'macrumors',  name: 'MacRumors',   description: 'Apple news and rumors',            url: 'https://www.macrumors.com',       icon: '🍎', category: 'Tech' },
  { id: 'theverge',   name: 'The Verge',   description: 'Technology and culture',           url: 'https://www.theverge.com',        icon: '🔺', category: 'Tech' },
  { id: 'arstechnica',name: 'Ars Technica','description': 'In-depth tech journalism',       url: 'https://arstechnica.com',         icon: '🔬', category: 'Tech' },
  { id: '9to5mac',    name: '9to5Mac',     description: 'Apple news and tutorials',         url: 'https://9to5mac.com',             icon: '📱', category: 'Tech' },
  { id: 'wccftech',   name: 'WCCFtech',    description: 'Gaming and hardware news',         url: 'https://wccftech.com',            icon: '🎮', category: 'Gaming' },
  { id: 'engadget',   name: 'Engadget',    description: 'Consumer electronics and tech',    url: 'https://www.engadget.com',        icon: '📡', category: 'Tech' },
];

@Component({
  selector: 'app-news-sites-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="sticky top-0 z-10 border-b border-emerald-800 bg-emerald-700 shadow-md">
        <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div class="flex items-center gap-4">
            <a routerLink="/news" class="text-emerald-200 transition hover:text-white text-sm">
              ← Shop
            </a>
            <h1 class="text-lg font-bold text-white">Browse News</h1>
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

      <main class="mx-auto max-w-3xl px-4 py-8">

        @if (store.balanceSeconds() === 0) {
          <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            You have no reading time left.
            <a routerLink="/news" class="ml-1 font-semibold underline">Buy more →</a>
          </div>
        }

        @for (category of categories(); track category) {
          <section class="mb-8">
            <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {{ category }}
            </h2>
            <div class="grid gap-3 sm:grid-cols-2">
              @for (site of sitesByCategory(category); track site.id) {
                <button
                  (click)="openSite(site)"
                  [disabled]="store.balanceSeconds() === 0"
                  class="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100
                         text-left transition hover:ring-emerald-300 hover:shadow-md
                         disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span class="flex h-12 w-12 shrink-0 items-center justify-center
                               rounded-xl bg-emerald-50 text-2xl">
                    {{ site.icon }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900">{{ site.name }}</p>
                    <p class="mt-0.5 truncate text-sm text-gray-500">{{ site.description }}</p>
                  </div>
                  <span class="ml-auto shrink-0 text-gray-300">→</span>
                </button>
              }
            </div>
          </section>
        }

      </main>
    </div>
  `,
})
export class NewsSitesPageComponent implements OnInit {
  protected readonly store = inject(NewsTimeStore);
  private readonly router = inject(Router);

  protected readonly sites = NEWS_SITES;

  protected readonly formattedBalance = computed(() => {
    const s = this.store.balanceSeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
  });

  protected readonly categories = computed(() =>
    [...new Set(NEWS_SITES.map(s => s.category))],
  );

  protected sitesByCategory(category: string): NewsSite[] {
    return NEWS_SITES.filter(s => s.category === category);
  }

  ngOnInit(): void {
    this.store.loadBalance();
  }

  protected openSite(site: NewsSite): void {
    this.router.navigate(['/news/read', site.id]);
  }
}
