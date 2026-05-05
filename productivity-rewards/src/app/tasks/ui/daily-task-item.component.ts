import { Component, input, output } from '@angular/core';
import { DailyTask } from '../models/daily-task.model';

export interface DailyTaskWithStatus extends DailyTask {
  completedToday: boolean;
}

@Component({
  selector: 'app-daily-task-item',
  standalone: true,
  template: `
    <article
      class="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-opacity"
      [class.opacity-50]="task().completedToday"
      [attr.aria-labelledby]="'daily-task-title-' + task().id"
    >
      <!-- Status indicator -->
      <div
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        [class.border-indigo-500]="!task().completedToday"
        [class.border-green-500]="task().completedToday"
        [class.bg-green-500]="task().completedToday"
        aria-hidden="true"
      >
        @if (task().completedToday) {
          <svg class="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        }
      </div>

      <!-- Title + coin reward -->
      <div class="min-w-0 flex-1">
        <p
          [id]="'daily-task-title-' + task().id"
          class="text-sm font-semibold text-gray-900 leading-snug"
          [class.line-through]="task().completedToday"
          [class.text-gray-400]="task().completedToday"
        >
          {{ task().title }}
        </p>
        <span
          class="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5
                 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
        >
          <span aria-hidden="true">🪙</span>{{ task().coinReward }}
        </span>
      </div>

      <!-- Complete button -->
      <button
        type="button"
        [disabled]="task().completedToday"
        class="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white
               shadow-sm transition hover:bg-indigo-700
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
               disabled:cursor-not-allowed disabled:opacity-50"
        [attr.aria-label]="'Complete ' + task().title"
        (click)="complete.emit(task().id)"
      >
        {{ task().completedToday ? 'Done' : 'Complete' }}
      </button>

      <!-- Delete button -->
      <button
        type="button"
        class="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600
               shadow-sm transition hover:bg-red-200
               focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        [attr.aria-label]="'Delete ' + task().title"
        (click)="delete.emit(task().id)"
      >
        Delete
      </button>
    </article>
  `,
})
export class DailyTaskItemComponent {
  readonly task = input.required<DailyTaskWithStatus>();
  readonly complete = output<string>();
  readonly delete = output<string>();
}
