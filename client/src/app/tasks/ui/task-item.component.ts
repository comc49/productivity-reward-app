import { Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <ng-container *transloco="let t; read: 'tasks.list'">
      <article
        class="group flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-opacity"
        [class.opacity-60]="task().isCompleted"
        [attr.aria-labelledby]="'task-title-' + task().id"
        [attr.aria-describedby]="task().description ? 'task-desc-' + task().id : null"
      >
        <!-- Status indicator -->
        <div
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
          [class.border-indigo-500]="!task().isCompleted"
          [class.border-green-500]="task().isCompleted"
          [class.bg-green-500]="task().isCompleted"
          aria-hidden="true"
        >
          @if (task().isCompleted) {
            <svg
              class="h-3 w-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <h3
            [id]="'task-title-' + task().id"
            class="text-sm font-semibold text-gray-900 leading-snug"
            [class.line-through]="task().isCompleted"
            [class.text-gray-500]="task().isCompleted"
          >
            {{ task().title }}
          </h3>

          @if (task().description) {
            <p
              [id]="'task-desc-' + task().id"
              class="mt-0.5 text-xs text-gray-500 line-clamp-2"
            >
              {{ task().description }}
            </p>
          }

          <div class="mt-2 flex flex-wrap items-center gap-2">
            <!-- Coin reward badge -->
            <span
              class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5
                     text-xs font-medium text-amber-700 ring-1 ring-amber-200"
              [attr.aria-label]="task().coinReward + ' coin reward'"
            >
              <span aria-hidden="true">🪙</span>
              {{ task().coinReward }}
            </span>

            <!-- Completed badge -->
            @if (task().isCompleted) {
              <span
                class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5
                       text-xs font-medium text-green-700 ring-1 ring-green-200"
                role="status"
                [attr.aria-label]="task().title + ' is completed'"
              >
                <span aria-hidden="true">✓</span>
                {{ t('completed_badge') }}
              </span>
            }
          </div>
        </div>

        <!-- Complete action -->
        @if (!task().isCompleted) {
          <button
            type="button"
            class="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white
                   shadow-sm transition hover:bg-indigo-700
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            [attr.aria-label]="t('complete_aria_label', { title: task().title, coins: task().coinReward })"
            (click)="complete.emit(task().id)"
          >
            {{ t('complete_button') }}
          </button>
        }
      </article>
    </ng-container>
  `,
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly complete = output<string>();
}
