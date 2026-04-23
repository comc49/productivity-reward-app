import { Component, inject, signal } from '@angular/core';
import { CookieConsentService } from './cookie-consent.service';
import { CookiePreferencesModalComponent } from './cookie-preferences-modal.component';

@Component({
  selector: 'app-cookie-banner',
  imports: [CookiePreferencesModalComponent],
  template: `
    @if (showModal()) {
      <app-cookie-preferences-modal (closed)="showModal.set(false)" />
    }

    @if (!consentService.decided()) {
      <div
        role="region"
        aria-label="Cookie consent"
        class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 py-4 shadow-lg sm:px-6"
      >
        <div class="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-gray-600">
            We use cookies to keep you signed in and enable video playback.
            <button
              type="button"
              (click)="showModal.set(true)"
              class="underline hover:text-gray-900 focus:outline-none"
            >
              Manage preferences
            </button>
          </p>
          <div class="flex shrink-0 gap-3">
            <button
              type="button"
              (click)="consentService.rejectAll()"
              class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Reject all
            </button>
            <button
              type="button"
              (click)="consentService.acceptAll()"
              class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieBannerComponent {
  readonly consentService = inject(CookieConsentService);
  readonly showModal = signal(false);
}
