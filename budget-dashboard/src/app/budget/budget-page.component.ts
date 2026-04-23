import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubscriptionsStore } from './data-access/subscriptions.store';
import { SubscriptionCategory, UsageRating } from './data-access/subscriptions.graphql';
import { InsightsSectionComponent } from './insights-section.component';

type CostMode = 'month' | 'year';

interface SubscriptionForm {
  name: string;
  company: string;
  category: SubscriptionCategory | '';
  cost: number | null;
  costMode: CostMode;
  renewsAt: string;
}

const CATEGORIES: { value: SubscriptionCategory; label: string }[] = [
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'PRODUCTIVITY', label: 'Productivity' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  ENTERTAINMENT: 'bg-purple-100 text-purple-700',
  PRODUCTIVITY: 'bg-indigo-100 text-indigo-700',
  HEALTH: 'bg-green-100 text-green-700',
  FINANCE: 'bg-yellow-100 text-yellow-700',
  EDUCATION: 'bg-blue-100 text-blue-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

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

@Component({
  selector: 'app-budget-page',
  standalone: true,
  imports: [FormsModule, CommonModule, InsightsSectionComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-3xl mx-auto px-4 py-10">

        <h1 class="text-2xl font-bold text-gray-900 mb-8">Subscriptions</h1>

        <!-- Add Subscription Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 class="text-base font-semibold text-gray-700 mb-5">Add Subscription</h2>
          <form (ngSubmit)="onSubmit()" #f="ngForm" class="space-y-4">

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  [(ngModel)]="form().name"
                  (ngModelChange)="patchForm({ name: $event })"
                  required
                  placeholder="Netflix"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  [(ngModel)]="form().company"
                  (ngModelChange)="patchForm({ company: $event })"
                  required
                  placeholder="Netflix Inc."
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                [(ngModel)]="form().category"
                (ngModelChange)="patchForm({ category: $event })"
                required
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="" disabled>Select a category</option>
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cost</label>
              <div class="flex gap-2">
                <input
                  type="number"
                  name="cost"
                  [(ngModel)]="form().cost"
                  (ngModelChange)="patchForm({ cost: $event })"
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                  class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div class="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                  <button
                    type="button"
                    (click)="patchForm({ costMode: 'month' })"
                    [class]="form().costMode === 'month'
                      ? 'px-3 py-2 bg-indigo-600 text-white font-medium'
                      : 'px-3 py-2 bg-white text-gray-600 hover:bg-gray-50'"
                  >/ mo</button>
                  <button
                    type="button"
                    (click)="patchForm({ costMode: 'year' })"
                    [class]="form().costMode === 'year'
                      ? 'px-3 py-2 bg-indigo-600 text-white font-medium'
                      : 'px-3 py-2 bg-white text-gray-600 hover:bg-gray-50'"
                  >/ yr</button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
              <input
                type="date"
                name="renewsAt"
                [(ngModel)]="form().renewsAt"
                (ngModelChange)="patchForm({ renewsAt: $event })"
                required
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="pt-1">
              <button
                type="submit"
                [disabled]="store.isLoading() || !isFormValid()"
                class="w-full sm:w-auto px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ store.isLoading() ? 'Adding...' : 'Add Subscription' }}
              </button>
            </div>

          </form>
        </div>

        <!-- Error Banner -->
        @if (store.error()) {
          <div class="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {{ store.error() }}
          </div>
        }

        <!-- Subscription List -->
        @if (store.isLoading() && store.subscriptions().length === 0) {
          <div class="text-center py-16 text-gray-400 text-sm">Loading subscriptions...</div>
        } @else if (store.subscriptions().length === 0) {
          <div class="text-center py-16 text-gray-400 text-sm">No subscriptions yet. Add one above.</div>
        } @else {
          <div class="space-y-3">
            @for (sub of store.subscriptions(); track sub.id) {
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex items-center gap-4">

                <!-- Left: Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-gray-900 text-sm">{{ sub.name }}</span>
                    <span [class]="'text-xs px-2 py-0.5 rounded-full font-medium ' + categoryColor(sub.category)">
                      {{ categoryLabel(sub.category) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">{{ sub.company }}</p>
                  <p class="text-xs text-gray-400 mt-1">Renews {{ formatDate(sub.renewsAt) }}</p>
                </div>

                <!-- Middle: Cost -->
                <div class="text-right shrink-0">
                  <p class="text-sm font-semibold text-gray-900">\${{ monthlyCost(sub) | number:'1.2-2' }}<span class="text-xs font-normal text-gray-400">/mo</span></p>
                  @if (sub.costPerYear) {
                    <p class="text-xs text-gray-400">\${{ sub.costPerYear | number:'1.2-2' }}/yr</p>
                  }
                </div>

                <!-- Right: Usage + Delete -->
                <div class="flex flex-col items-end gap-2 shrink-0">
                  <button
                    (click)="cycleUsage(sub.id, sub.usageRating)"
                    [class]="'text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ' + usageStyle(sub.usageRating)"
                  >
                    {{ usageLabel(sub.usageRating) }}
                  </button>
                  <button
                    (click)="onDelete(sub.id)"
                    class="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Delete subscription"
                  >
                    Remove
                  </button>
                </div>

              </div>
            }
          </div>

          <!-- Total -->
          <div class="mt-6 bg-indigo-50 rounded-2xl border border-indigo-100 px-5 py-4 flex justify-between items-center">
            <span class="text-sm font-medium text-indigo-700">Total per month</span>
            <span class="text-lg font-bold text-indigo-900">\${{ totalMonthly() | number:'1.2-2' }}</span>
          </div>
        }

        <!-- Insights -->
        <app-insights-section [subscriptions]="store.subscriptions()" />

      </div>
    </div>
  `,
})
export class BudgetPageComponent implements OnInit {
  readonly store = inject(SubscriptionsStore);

  readonly categories = CATEGORIES;

  private readonly _form = signal<SubscriptionForm>({
    name: '',
    company: '',
    category: '',
    cost: null,
    costMode: 'month',
    renewsAt: '',
  });

  readonly form = this._form.asReadonly();

  readonly isFormValid = computed(() => {
    const f = this._form();
    return f.name.trim() !== '' && f.company.trim() !== '' && f.category !== '' && f.cost !== null && f.cost > 0 && f.renewsAt !== '';
  });

  readonly totalMonthly = computed(() =>
    this.store.subscriptions().reduce((sum, s) => sum + this.monthlyCost(s), 0),
  );

  ngOnInit(): void {
    this.store.loadSubscriptions();
  }

  patchForm(patch: Partial<SubscriptionForm>): void {
    this._form.update(f => ({ ...f, ...patch }));
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) return;
    const f = this._form();
    await this.store.createSubscription({
      name: f.name.trim(),
      company: f.company.trim(),
      category: f.category as SubscriptionCategory,
      costPerMonth: f.costMode === 'month' ? (f.cost ?? undefined) : undefined,
      costPerYear: f.costMode === 'year' ? (f.cost ?? undefined) : undefined,
      renewsAt: f.renewsAt,
    });
    this._form.set({ name: '', company: '', category: '', cost: null, costMode: 'month', renewsAt: '' });
  }

  cycleUsage(id: string, current: UsageRating): void {
    const next = USAGE_CYCLE[(USAGE_CYCLE.indexOf(current) + 1) % USAGE_CYCLE.length];
    this.store.updateUsageRating(id, next);
  }

  onDelete(id: string): void {
    this.store.deleteSubscription(id);
  }

  monthlyCost(sub: { costPerMonth: number | null; costPerYear: number | null }): number {
    if (sub.costPerMonth != null) return sub.costPerMonth;
    if (sub.costPerYear != null) return sub.costPerYear / 12;
    return 0;
  }

  categoryColor(category: SubscriptionCategory): string {
    return CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600';
  }

  categoryLabel(category: SubscriptionCategory): string {
    return CATEGORIES.find(c => c.value === category)?.label ?? category;
  }

  usageStyle(rating: UsageRating): string {
    return USAGE_STYLES[rating];
  }

  usageLabel(rating: UsageRating): string {
    return USAGE_LABELS[rating];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
