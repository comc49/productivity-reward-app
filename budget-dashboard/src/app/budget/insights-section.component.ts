import { Component, input, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { SubscriptionItem, SubscriptionCategory } from './data-access/subscriptions.graphql';

const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  ENTERTAINMENT: 'Entertainment',
  PRODUCTIVITY: 'Productivity',
  HEALTH: 'Health',
  FINANCE: 'Finance',
  EDUCATION: 'Education',
  OTHER: 'Other',
};

const CATEGORY_ORDER: SubscriptionCategory[] = [
  'ENTERTAINMENT', 'PRODUCTIVITY', 'HEALTH', 'FINANCE', 'EDUCATION', 'OTHER',
];

const CHART_COLORS = [
  'rgba(139,92,246,0.8)',   // purple  — ENTERTAINMENT
  'rgba(99,102,241,0.8)',   // indigo  — PRODUCTIVITY
  'rgba(34,197,94,0.8)',    // green   — HEALTH
  'rgba(234,179,8,0.8)',    // yellow  — FINANCE
  'rgba(59,130,246,0.8)',   // blue    — EDUCATION
  'rgba(156,163,175,0.8)',  // gray    — OTHER
];

function monthlyOf(sub: SubscriptionItem): number {
  if (sub.costPerMonth != null) return sub.costPerMonth;
  if (sub.costPerYear != null) return sub.costPerYear / 12;
  return 0;
}

@Component({
  selector: 'app-insights-section',
  standalone: true,
  imports: [CommonModule, DecimalPipe, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <div class="mt-10">
      <h2 class="text-lg font-bold text-gray-900 mb-5">Insights</h2>

      <!-- Stat Cards -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        @for (card of statCards(); track card.label) {
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{{ card.label }}</p>
            <p class="text-xl font-bold text-gray-900">\${{ card.value | number:'1.2-2' }}</p>
          </div>
        }
      </div>

      <!-- Charts -->
      @if (hasSubscriptions()) {
        <div class="space-y-6">

          <!-- Bar: spend by category -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Monthly Spend by Category</h3>
            <div class="h-52">
              <canvas baseChart
                [data]="barData()"
                [options]="barOptions"
                type="bar">
              </canvas>
            </div>
          </div>

          <!-- Pie: proportion by category -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">Spend Proportion by Category</h3>
            <div class="h-64 flex justify-center">
              <canvas baseChart
                [data]="pieData()"
                [options]="pieOptions"
                type="doughnut">
              </canvas>
            </div>
          </div>

          <!-- Line: 12-month projection -->
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">12-Month Cumulative Projection</h3>
            <div class="h-52">
              <canvas baseChart
                [data]="lineData()"
                [options]="lineOptions"
                type="line">
              </canvas>
            </div>
          </div>

        </div>
      }
    </div>
  `,
})
export class InsightsSectionComponent {
  readonly subscriptions = input.required<SubscriptionItem[]>();

  readonly hasSubscriptions = computed(() => this.subscriptions().length > 0);

  readonly totalMonthly = computed(() =>
    this.subscriptions().reduce((sum, s) => sum + monthlyOf(s), 0),
  );

  readonly statCards = computed(() => {
    const monthly = this.totalMonthly();
    return [
      { label: 'Per Day', value: monthly / 30.44 },
      { label: 'Per Month', value: monthly },
      { label: 'Per Year', value: monthly * 12 },
    ];
  });

  readonly spendByCategory = computed(() => {
    const map = new Map<SubscriptionCategory, number>();
    for (const sub of this.subscriptions()) {
      const cat = sub.category;
      map.set(cat, (map.get(cat) ?? 0) + monthlyOf(sub));
    }
    return map;
  });

  readonly barData = computed<ChartData<'bar'>>(() => {
    const map = this.spendByCategory();
    const active = CATEGORY_ORDER.filter(c => (map.get(c) ?? 0) > 0);
    return {
      labels: active.map(c => CATEGORY_LABELS[c]),
      datasets: [{
        label: 'Monthly (\$)',
        data: active.map(c => map.get(c) ?? 0),
        backgroundColor: active.map(c => CHART_COLORS[CATEGORY_ORDER.indexOf(c)]),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  });

  readonly pieData = computed<ChartData<'doughnut'>>(() => {
    const map = this.spendByCategory();
    const active = CATEGORY_ORDER.filter(c => (map.get(c) ?? 0) > 0);
    return {
      labels: active.map(c => CATEGORY_LABELS[c]),
      datasets: [{
        data: active.map(c => map.get(c) ?? 0),
        backgroundColor: active.map(c => CHART_COLORS[CATEGORY_ORDER.indexOf(c)]),
        hoverOffset: 8,
      }],
    };
  });

  readonly lineData = computed<ChartData<'line'>>(() => {
    const monthly = this.totalMonthly();
    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      data.push(parseFloat((monthly * i).toFixed(2)));
    }
    return {
      labels,
      datasets: [{
        label: 'Cumulative Spend (\$)',
        data,
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(99,102,241,1)',
      }],
    };
  });

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `\$${v}` } },
      x: { grid: { display: false } },
    },
  };

  readonly pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: { callbacks: { label: ctx => ` \$${(ctx.raw as number).toFixed(2)}/mo` } },
    },
    cutout: '60%',
  };

  readonly lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `\$${v}` } },
      x: { grid: { display: false } },
    },
  };
}
