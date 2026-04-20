import { Component, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header class="border-b border-indigo-100 bg-white/80 backdrop-blur-sm">
        <div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 class="text-xl font-bold text-indigo-700">ProductivityRewards</h1>
            <p class="text-xs text-gray-500">Turn tasks into rewards</p>
          </div>
          @if (authService.isLoggedIn()) {
            <a
              routerLink="/tasks"
              class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                     transition hover:bg-indigo-700"
            >
              Open App
            </a>
          }
        </div>
      </header>

      <main class="mx-auto max-w-4xl px-6 py-20">
        <div class="text-center">
          <span class="text-6xl" aria-hidden="true">🪙</span>
          <h2 class="mt-6 text-4xl font-extrabold tracking-tight text-gray-900">
            Get rewarded for getting things done
          </h2>
          <p class="mt-4 text-lg text-gray-600">
            Create tasks, complete them, and earn coins. Build productive habits with a reward system that keeps you motivated.
          </p>

          <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            @if (authService.isLoggedIn()) {
              <a
                routerLink="/tasks"
                class="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold
                       text-white shadow-md transition hover:bg-indigo-700 sm:w-auto"
              >
                Go to My Tasks
              </a>
            } @else {
              <button
                (click)="signIn()"
                class="flex w-full items-center justify-center gap-3 rounded-xl border
                       border-gray-300 bg-white px-8 py-3.5 text-base font-semibold
                       text-gray-700 shadow-md transition hover:bg-gray-50 sm:w-auto"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            }
          </div>
        </div>

        <div class="mt-24 grid gap-8 sm:grid-cols-3">
          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <span class="text-3xl" aria-hidden="true">✅</span>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Create Tasks</h3>
            <p class="mt-2 text-sm text-gray-500">
              Add tasks with a title, description, and coin reward. Set the value based on effort.
            </p>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <span class="text-3xl" aria-hidden="true">⚡</span>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Complete &amp; Earn</h3>
            <p class="mt-2 text-sm text-gray-500">
              Mark tasks complete to earn coins. Watch your balance grow as you stay productive.
            </p>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <span class="text-3xl" aria-hidden="true">🏆</span>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Build Habits</h3>
            <p class="mt-2 text-sm text-gray-500">
              Track completed tasks and use your coin balance as a motivator to keep going.
            </p>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class HomePageComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/tasks']);
      }
    });
  }

  signIn(): void {
    this.authService.signInWithGoogle().catch(console.error);
  }
}
