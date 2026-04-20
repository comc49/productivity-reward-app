import { Component, inject, OnInit, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { TasksStore } from '../data-access/tasks.store';
import { WalletStore } from '../../wallet';
import { TaskItemComponent } from '../ui/task-item.component';
import { AddTaskFormComponent } from '../ui/add-task-form.component';
import { CreateTaskInput } from '../models/task.model';
import { AuthService } from '../../auth/auth.service';
import { WatchTimeStore } from '../../rewards/data-access/watch-time.store';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [TranslocoModule, TaskItemComponent, AddTaskFormComponent, RouterLink],
  template: `
    <ng-container *transloco="let t">
      <div class="min-h-screen bg-gray-50">
        <!-- ── Site Header ───────────────────────────────────────────── -->
        <header class="sticky top-0 z-10 border-b border-indigo-800 bg-indigo-700 shadow-md" role="banner">
          <div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <div class="flex items-center gap-4">
              <div>
                <h1 class="text-xl font-bold tracking-tight text-white">
                  {{ t('app.name') }}
                </h1>
                <p class="text-xs text-indigo-200">{{ t('app.tagline') }}</p>
              </div>
              <a
                routerLink="/rewards"
                class="rounded-lg bg-indigo-800 px-3 py-1.5 text-xs font-medium
                       text-indigo-200 transition hover:bg-indigo-900 hover:text-white"
              >
                🏆 Rewards
              </a>
            </div>

            <div class="flex items-center gap-3">
              <!-- Coin balance — live region so screen readers announce changes -->
              <div
                class="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5
                       ring-1 ring-indigo-400"
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

              <!-- Watch time balance -->
              <a
                routerLink="/rewards"
                class="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5
                       ring-1 ring-indigo-400 transition hover:bg-indigo-500"
                aria-label="Watch time balance"
              >
                <span aria-hidden="true" class="text-sm leading-none">⏱️</span>
                <span class="text-sm font-bold text-white">{{ formattedWatchBalance() }}</span>
              </a>

              <!-- User avatar + sign out -->
              @if (authService.user(); as user) {
                <div class="flex items-center gap-2">
                  @if (user.photoURL) {
                    <img
                      [src]="user.photoURL"
                      [alt]="user.displayName ?? 'User'"
                      class="h-8 w-8 rounded-full ring-2 ring-indigo-400"
                    />
                  }
                  <button
                    (click)="signOut()"
                    class="rounded-lg bg-indigo-800 px-3 py-1.5 text-xs font-medium
                           text-indigo-200 transition hover:bg-indigo-900"
                  >
                    Sign out
                  </button>
                </div>
              }
            </div>
          </div>
        </header>

        <!-- ── Main Content ──────────────────────────────────────────── -->
        <main class="mx-auto max-w-2xl space-y-8 px-4 py-8" id="main-content">

          <!-- Add Task Section -->
          <section aria-labelledby="add-task-heading">
            <h2
              id="add-task-heading"
              class="mb-3 text-base font-semibold text-gray-700 uppercase tracking-wide"
            >
              {{ t('tasks.add.heading') }}
            </h2>
            <app-add-task-form
              (taskSubmitted)="onCreateTask($event)"
              aria-label="Add new task form"
            />
          </section>

          <!-- Task List Section -->
          <section aria-labelledby="task-list-heading">
            <div class="mb-3 flex items-baseline gap-2">
              <h2
                id="task-list-heading"
                class="text-base font-semibold text-gray-700 uppercase tracking-wide"
              >
                {{ t('tasks.list.heading') }}
              </h2>
              <span class="text-sm text-gray-400" aria-live="polite">
                ({{ t('tasks.list.pending_count', { count: tasksStore.pendingTasks().length }) }})
              </span>
            </div>

            <!-- Loading -->
            @if (tasksStore.isLoading()) {
              <div
                class="flex items-center justify-center gap-3 rounded-xl border border-gray-200
                       bg-white py-12 text-gray-400"
                role="status"
                aria-live="polite"
              >
                <svg
                  class="h-5 w-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span class="text-sm">{{ t('tasks.list.loading') }}</span>
              </div>
            }

            <!-- Error -->
            @else if (tasksStore.error()) {
              <div
                class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
                aria-live="assertive"
              >
                <p class="font-semibold">{{ t('common.error') }}</p>
                <p>{{ tasksStore.error() }}</p>
              </div>
            }

            <!-- Empty -->
            @else if (tasksStore.tasks().length === 0) {
              <div
                class="rounded-xl border border-dashed border-gray-300 bg-white py-12
                       text-center text-sm text-gray-400"
                role="status"
              >
                <p aria-label="No tasks">{{ t('tasks.list.empty') }}</p>
              </div>
            }

            <!-- Task list -->
            @else {
              <ul
                role="list"
                class="space-y-3"
                aria-label="{{ t('tasks.list.heading') }}"
              >
                @for (task of tasksStore.tasks(); track task.id) {
                  <li>
                    <app-task-item
                      [task]="task"
                      (complete)="onCompleteTask($event)"
                    />
                  </li>
                }
              </ul>
            }
          </section>
        </main>
      </div>
    </ng-container>
  `,
})
export class TaskListPageComponent implements OnInit {
  protected readonly tasksStore = inject(TasksStore);
  protected readonly walletStore = inject(WalletStore);
  protected readonly watchTimeStore = inject(WatchTimeStore);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly formattedWatchBalance = computed(() => {
    const s = this.watchTimeStore.balanceSeconds();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  });

  ngOnInit(): void {
    this.tasksStore.loadTasks();
    this.watchTimeStore.loadBalance();
  }

  onCreateTask(input: CreateTaskInput): void {
    this.tasksStore.createTask(input);
  }

  onCompleteTask(id: string): void {
    this.tasksStore.completeTask(id);
  }

  signOut(): void {
    this.authService.signOut().then(() => this.router.navigate(['/']));
  }
}
