import { Injectable, signal, computed } from '@angular/core';

export type ConsentCategory = 'functional' | 'analytics';

export interface CookieConsent {
  decided: boolean;
  functional: boolean;
  analytics: boolean;
}

const STORAGE_KEY = 'cookie_consent';

const defaultConsent = (): CookieConsent => ({
  decided: false,
  functional: false,
  analytics: false,
});

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly _consent = signal<CookieConsent>(this.load());

  readonly consent = this._consent.asReadonly();
  readonly decided = computed(() => this._consent().decided);
  readonly functional = computed(() => this._consent().functional);
  readonly analytics = computed(() => this._consent().analytics);

  acceptAll(): void {
    this.save({ decided: true, functional: true, analytics: true });
  }

  rejectAll(): void {
    this.save({ decided: true, functional: false, analytics: false });
  }

  savePreferences(prefs: Pick<CookieConsent, 'functional' | 'analytics'>): void {
    this.save({ decided: true, ...prefs });
  }

  private save(consent: CookieConsent): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    this._consent.set(consent);
  }

  private load(): CookieConsent {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultConsent(), ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return defaultConsent();
  }
}
