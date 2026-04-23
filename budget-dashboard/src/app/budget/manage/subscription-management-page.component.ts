import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubscriptionsStore } from '../data-access/subscriptions.store';
import { SubscriptionItem, UsageRating } from '../data-access/subscriptions.graphql';

const USAGE_CYCLE: UsageRating[] = ['ACTIVE', 'RARELY', 'NEVER'];

const USAGE_STYLES: Record<UsageRating, string> = {
  ACTIVE: 'bg-green-100 text-green-700 hover:bg-green-200',
  RARELY: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  NEVER: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const USAGE_LABELS: Record<UsageRating, string> = {
  ACTIVE: 'Active',
  RARELY: 'Rarely',
  NEVER: 'Never',
};

function monthlyOf(sub: SubscriptionItem): number {
  if (sub.costPerMonth != null) return sub.costPerMonth;
  if (sub.costPerYear != null) return sub.costPerYear / 12;
  return 0;
}

function annualOf(sub: SubscriptionItem): number {
  return monthlyOf(sub) * 12;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDaysUntil(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `in ${days}d`;
}

function daysUntilColor(days: number): string {
  if (days < 0) return 'text-red-600 font-semibold';
  if (days <= 7) return 'text-orange-500 font-semibold';
  if (days <= 14) return 'text-yellow-600';
  return 'text-gray-400';
}

function formatRenewalDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

@Component({
  selector: 'app-subscription-management-page',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 pb-32">
      <div class="max-w-3xl mx-auto px-4 py-10">

        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Manage Subscriptions</h1>
            <p class="text-sm text-gray-500 mt-1">{{ store.subscriptions().length }} subscriptions &middot; \${{ totalMonthly() | number:'1.2-2' }}/mo</p>
          </div>
          <a routerLink="/budget" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Budget
          </a>
        </div>

        <!-- Error Banner -->
        @if (store.error()) {
          <div class="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {{ store.error() }}
          </div>
        }

        <!-- Loading -->
        @if (store.isLoading() && store.subscriptions().length === 0) {
          <div class="text-center py-20 text-gray-400 text-sm">Loading…</div>
        }

        <!-- All Subscriptions sorted by renewsAt -->
        @if (sortedSubscriptions().length > 0) {
          <section class="mb-10">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All Subscriptions</h2>
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
              @for (sub of sortedSubscriptions(); track sub.id) {
                <div class="flex items-center gap-4 px-5 py-4" [class.opacity-50]="store.isLoading()">

                  <!-- Checkbox for savings calculator -->
                  <input
                    type="checkbox"
                    [checked]="isSelected(sub.id)"
                    (change)="toggleSelected(sub.id)"
                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                  />

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ sub.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ sub.company }}</p>
                  </div>

                  <!-- Renewal -->
                  <div class="text-right shrink-0 hidden sm:block">
                    <p class="text-xs text-gray-600">{{ formatRenewalDate(sub.renewsAt) }}</p>
                    <p class="text-xs" [class]="daysUntilColor(daysUntil(sub.renewsAt))">
                      {{ formatDaysUntil(daysUntil(sub.renewsAt)) }}
                    </p>
                  </div>

                  <!-- Cost -->
                  <div class="text-right shrink-0">
                    <p class="text-sm font-semibold text-gray-900">\${{ monthlyOf(sub) | number:'1.2-2' }}<span class="text-xs font-normal text-gray-400">/mo</span></p>
                  </div>

                  <!-- Usage Badge -->
                  <button
                    (click)="cycleUsage(sub.id, sub.usageRating)"
                    [class]="'text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ' + usageStyle(sub.usageRating)"
                    [disabled]="store.isLoading()"
                  >
                    {{ usageLabel(sub.usageRating) }}
                  </button>

                </div>
              }
            </div>
          </section>
        }

        <!-- Candidates to Cancel -->
        @if (cancelCandidates().length > 0) {
          <section class="mb-10">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Candidates to Cancel
              <span class="ml-2 text-xs text-gray-400 normal-case font-normal">Rated Rarely or Never</span>
            </h2>
            <div class="bg-white rounded-2xl border border-orange-100 shadow-sm divide-y divide-gray-100">
              @for (sub of cancelCandidates(); track sub.id) {
                <div class="flex items-center gap-4 px-5 py-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-semibold text-gray-900 truncate">{{ sub.name }}</p>
                      <span [class]="'text-xs px-2 py-0.5 rounded-full font-medium ' + usageStyle(sub.usageRating)">
                        {{ usageLabel(sub.usageRating) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 truncate">{{ sub.company }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm font-semibold text-gray-900">\${{ annualOf(sub) | number:'1.2-2' }}/yr</p>
                    <p class="text-xs text-green-600 font-medium">potential saving</p>
                  </div>
                </div>
              }

              <!-- Candidates total -->
              <div class="flex items-center justify-between px-5 py-3 bg-orange-50 rounded-b-2xl">
                <span class="text-sm font-medium text-orange-700">Total potential savings</span>
                <span class="text-sm font-bold text-orange-700">\${{ candidateAnnualSavings() | number:'1.2-2' }}/yr</span>
              </div>
            </div>
          </section>
        }

        @if (store.subscriptions().length === 0 && !store.isLoading()) {
          <div class="text-center py-20 text-gray-400 text-sm">
            No subscriptions yet.
            <a routerLink="/budget" class="text-indigo-500 hover:underline ml-1">Add one</a>
          </div>
        }

      </div>
    </div>

    <!-- Sticky Savings Calculator Footer -->
    @if (selectedIds().size > 0) {
      <div class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-gray-900">
              What if you cancelled {{ selectedIds().size }} subscription{{ selectedIds().size > 1 ? 's' : '' }}?
            </p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ selectedNames() }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs text-gray-500">Annual savings</p>
            <p class="text-2xl font-bold text-green-600">\${{ selectedAnnualSavings() | number:'1.2-2' }}</p>
          </div>
          <button
            (click)="clearSelection()"
            class="text-xs text-gray-400 hover:text-gray-600 shrink-0"
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>
      </div>
    }
  `,
})
export class SubscriptionManagementPageComponent implements OnInit {
  readonly store = inject(SubscriptionsStore);

  readonly selectedIds = signal<Set<string>>(new Set());

  readonly sortedSubscriptions = computed(() =>
    [...this.store.subscriptions()].sort(
      (a, b) => new Date(a.renewsAt).getTime() - new Date(b.renewsAt).getTime(),
    ),
  );

  readonly totalMonthly = computed(() =>
    this.store.subscriptions().reduce((sum, s) => sum + monthlyOf(s), 0),
  );

  readonly cancelCandidates = computed(() =>
    this.sortedSubscriptions().filter(
      s => s.usageRating === 'RARELY' || s.usageRating === 'NEVER',
    ),
  );

  readonly candidateAnnualSavings = computed(() =>
    this.cancelCandidates().reduce((sum, s) => sum + annualOf(s), 0),
  );

  readonly selectedSubscriptions = computed(() =>
    this.store.subscriptions().filter(s => this.selectedIds().has(s.id)),
  );

  readonly selectedAnnualSavings = computed(() =>
    this.selectedSubscriptions().reduce((sum, s) => sum + annualOf(s), 0),
  );

  readonly selectedNames = computed(() =>
    this.selectedSubscriptions()
      .map(s => s.name)
      .join(', '),
  );

  ngOnInit(): void {
    this.store.loadSubscriptions();
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelected(id: string): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  cycleUsage(id: string, current: UsageRating): void {
    const next = USAGE_CYCLE[(USAGE_CYCLE.indexOf(current) + 1) % USAGE_CYCLE.length];
    this.store.updateUsageRating(id, next);
  }

  usageStyle(rating: UsageRating): string {
    return USAGE_STYLES[rating];
  }

  usageLabel(rating: UsageRating): string {
    return USAGE_LABELS[rating];
  }

  readonly monthlyOf = monthlyOf;
  readonly annualOf = annualOf;
  readonly daysUntil = daysUntil;
  readonly formatDaysUntil = formatDaysUntil;
  readonly daysUntilColor = daysUntilColor;
  readonly formatRenewalDate = formatRenewalDate;
}
