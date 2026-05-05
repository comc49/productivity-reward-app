import { Component, computed, output, signal } from '@angular/core';
import { CreateDailyTaskInput } from '../models/daily-task.model';

@Component({
  selector: 'app-add-daily-task-form',
  standalone: true,
  template: `
    <form
      class="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      (submit)="onSubmit($event)"
      novalidate
    >
      <div class="flex-1 min-w-0">
        <label for="daily-task-title" class="block text-sm font-medium text-gray-700 mb-1">
          Task name <span aria-hidden="true" class="text-red-500">*</span>
        </label>
        <input
          id="daily-task-title"
          type="text"
          class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          [class.border-red-400]="isDirty() && !!titleError()"
          [class.border-gray-300]="!(isDirty() && !!titleError())"
          [value]="title()"
          (input)="title.set($any($event.target).value)"
          placeholder="e.g. Morning workout"
          autocomplete="off"
        />
        @if (isDirty() && titleError()) {
          <p class="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {{ titleError() }}
          </p>
        }
      </div>

      <div>
        <label for="daily-coin-reward" class="block text-sm font-medium text-gray-700 mb-1">
          Coins
        </label>
        <div class="flex items-center gap-2">
          <span aria-hidden="true" class="text-xl select-none">🪙</span>
          <input
            id="daily-coin-reward"
            type="number"
            class="w-20 rounded-lg border px-3 py-2 text-sm shadow-sm transition
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            [class.border-red-400]="isDirty() && !!coinRewardError()"
            [class.border-gray-300]="!(isDirty() && !!coinRewardError())"
            [value]="coinReward()"
            (input)="coinReward.set(+$any($event.target).value)"
            min="1"
            max="1000"
          />
        </div>
        @if (isDirty() && coinRewardError()) {
          <p class="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {{ coinRewardError() }}
          </p>
        }
      </div>

      <button
        type="submit"
        class="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold
               text-white shadow-sm transition hover:bg-indigo-700
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed"
        [disabled]="isDirty() && !isValid()"
      >
        <span aria-hidden="true">+</span> Add
      </button>
    </form>
  `,
})
export class AddDailyTaskFormComponent {
  readonly taskSubmitted = output<CreateDailyTaskInput>();

  readonly title = signal('');
  readonly coinReward = signal(10);
  readonly isDirty = signal(false);

  readonly titleError = computed<string | null>(() => {
    if (!this.isDirty()) return null;
    const v = this.title().trim();
    if (!v) return 'Title is required';
    if (v.length < 3) return 'Title must be at least 3 characters';
    return null;
  });

  readonly coinRewardError = computed<string | null>(() => {
    if (!this.isDirty()) return null;
    if (this.coinReward() < 1) return 'Coin reward must be at least 1';
    return null;
  });

  readonly isValid = computed(
    () => !this.titleError() && !this.coinRewardError() && this.title().trim().length >= 3
  );

  onSubmit(event: Event): void {
    event.preventDefault();
    this.isDirty.set(true);
    if (!this.isValid()) return;

    this.taskSubmitted.emit({
      title: this.title().trim(),
      coinReward: this.coinReward(),
    });

    this.title.set('');
    this.coinReward.set(10);
    this.isDirty.set(false);
  }
}
