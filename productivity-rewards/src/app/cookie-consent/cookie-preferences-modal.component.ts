import { Component, inject, output, signal } from '@angular/core';
import { CookieConsentService } from './cookie-consent.service';

@Component({
  selector: 'app-cookie-preferences-modal',
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="cookie-modal-title" class="mb-2 text-lg font-semibold text-gray-900">
          Cookie Preferences
        </h2>
        <p class="mb-5 text-sm text-gray-500">
          Choose which cookies you allow. You can change these settings at any time.
        </p>

        <div class="space-y-4">
          <!-- Necessary -->
          <div class="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div>
              <p class="text-sm font-medium text-gray-900">Necessary</p>
              <p class="mt-0.5 text-xs text-gray-500">
                Required for authentication and core app functionality. Cannot be disabled.
              </p>
            </div>
            <span class="mt-0.5 shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Always on
            </span>
          </div>

          <!-- Functional -->
          <div class="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
            <div>
              <p class="text-sm font-medium text-gray-900">Functional</p>
              <p class="mt-0.5 text-xs text-gray-500">
                Enables embedded YouTube video playback and related features.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="functional()"
              (click)="functional.set(!functional())"
              class="mt-0.5 shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              [class.bg-indigo-600]="functional()"
              [class.bg-gray-200]="!functional()"
            >
              <span
                class="block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform duration-200"
                [class.translate-x-6]="functional()"
              ></span>
            </button>
          </div>

          <!-- Analytics -->
          <div class="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
            <div>
              <p class="text-sm font-medium text-gray-900">Analytics</p>
              <p class="mt-0.5 text-xs text-gray-500">
                Helps us understand how the app is used to improve the experience.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              [attr.aria-checked]="analytics()"
              (click)="analytics.set(!analytics())"
              class="mt-0.5 shrink-0 h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              [class.bg-indigo-600]="analytics()"
              [class.bg-gray-200]="!analytics()"
            >
              <span
                class="block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform duration-200"
                [class.translate-x-6]="analytics()"
              ></span>
            </button>
          </div>
        </div>

        <div class="mt-6 flex gap-3">
          <button
            type="button"
            (click)="onSave()"
            class="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save preferences
          </button>
          <button
            type="button"
            (click)="closed.emit()"
            class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CookiePreferencesModalComponent {
  private readonly consentService = inject(CookieConsentService);

  readonly closed = output<void>();

  readonly functional = signal(this.consentService.functional());
  readonly analytics = signal(this.consentService.analytics());

  onSave(): void {
    this.consentService.savePreferences({
      functional: this.functional(),
      analytics: this.analytics(),
    });
    this.closed.emit();
  }
}
