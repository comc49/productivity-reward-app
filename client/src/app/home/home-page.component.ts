import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
          <a
            routerLink="/tasks"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white
                   transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Open App
          </a>
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
            <a
              routerLink="/tasks"
              class="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold
                     text-white shadow-md transition hover:bg-indigo-700 sm:w-auto"
            >
              Get Started
            </a>
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
export class HomePageComponent {}
