import { Component, computed, output, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CreateTaskInput } from '../models/task.model';

@Component({
  selector: 'app-add-task-form',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <ng-container *transloco="let t; read: 'tasks.add'">
      <form
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
        (submit)="onSubmit($event)"
        novalidate
        aria-label="Add new task"
      >
        <!-- Title -->
        <div>
          <label
            for="task-title"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t('title_label') }}
            <span aria-hidden="true" class="text-red-500 ml-0.5">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <input
            id="task-title"
            type="text"
            class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            [class.border-red-400]="isDirty() && !!titleError()"
            [class.border-gray-300]="!(isDirty() && !!titleError())"
            [value]="title()"
            (input)="title.set($any($event.target).value)"
            [placeholder]="t('title_placeholder')"
            [attr.aria-invalid]="isDirty() && !!titleError() ? true : null"
            [attr.aria-describedby]="isDirty() && titleError() ? 'title-error' : null"
            autocomplete="off"
          />
          @if (isDirty() && titleError()) {
            <p
              id="title-error"
              class="mt-1.5 text-xs text-red-600 flex items-center gap-1"
              role="alert"
            >
              <span aria-hidden="true">⚠</span> {{ titleError() }}
            </p>
          }
        </div>

        <!-- Description -->
        <div>
          <label
            for="task-description"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            {{ t('description_label') }}
            <span class="text-gray-400 font-normal ml-1">({{ t('optional') ?? 'optional' }})</span>
          </label>
          <textarea
            id="task-description"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm resize-none
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="2"
            [value]="description()"
            (input)="description.set($any($event.target).value)"
            [placeholder]="t('description_placeholder')"
          ></textarea>
        </div>

        <!-- Coin reward + submit row -->
        <div class="flex items-end gap-4">
          <div>
            <label
              for="coin-reward"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              {{ t('coin_reward_label') }}
            </label>
            <div class="flex items-center gap-2">
              <span aria-hidden="true" class="text-xl select-none">🪙</span>
              <input
                id="coin-reward"
                type="number"
                class="w-24 rounded-lg border px-3 py-2 text-sm shadow-sm transition
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                [class.border-red-400]="isDirty() && !!coinRewardError()"
                [class.border-gray-300]="!(isDirty() && !!coinRewardError())"
                [value]="coinReward()"
                (input)="coinReward.set(+$any($event.target).value)"
                min="1"
                max="1000"
                [attr.aria-label]="t('coin_reward_label')"
                [attr.aria-invalid]="isDirty() && !!coinRewardError() ? true : null"
                [attr.aria-describedby]="isDirty() && coinRewardError() ? 'coin-error' : null"
              />
            </div>
            @if (isDirty() && coinRewardError()) {
              <p
                id="coin-error"
                class="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                role="alert"
              >
                <span aria-hidden="true">⚠</span> {{ coinRewardError() }}
              </p>
            }
          </div>

          <button
            type="submit"
            class="ml-auto flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm
                   font-semibold text-white shadow-sm transition
                   hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="isDirty() && !isValid()"
            [attr.aria-disabled]="isDirty() && !isValid() ? 'true' : null"
          >
            <span aria-hidden="true">+</span>
            {{ t('submit') }}
          </button>
        </div>
      </form>
    </ng-container>
  `,
})
export class AddTaskFormComponent {
  readonly taskSubmitted = output<CreateTaskInput>();

  // ── Signal-based form state ──────────────────────────────────────────────
  readonly title = signal('');
  readonly description = signal('');
  readonly coinReward = signal(10);
  /** Becomes true on first submit attempt — prevents premature error display */
  readonly isDirty = signal(false);

  // ── Derived validation ────────────────────────────────────────────────────
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

  // ── Actions ───────────────────────────────────────────────────────────────
  onSubmit(event: Event): void {
    event.preventDefault();
    this.isDirty.set(true);
    if (!this.isValid()) return;

    this.taskSubmitted.emit({
      title: this.title().trim(),
      description: this.description().trim() || undefined,
      coinReward: this.coinReward(),
    });

    this.title.set('');
    this.description.set('');
    this.coinReward.set(10);
    this.isDirty.set(false);
  }
}
