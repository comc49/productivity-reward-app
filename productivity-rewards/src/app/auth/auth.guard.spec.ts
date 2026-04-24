import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

function runGuard() {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as never, {} as never),
  );
}

describe('authGuard', () => {
  const isLoggedIn = signal(false);

  beforeEach(() => {
    isLoggedIn.set(false);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn } },
        {
          provide: Router,
          useValue: { createUrlTree: (commands: string[]) => commands },
        },
      ],
    });
  });

  it('returns true when the user is logged in', () => {
    isLoggedIn.set(true);
    expect(runGuard()).toBe(true);
  });

  it('redirects to / when the user is not logged in', () => {
    isLoggedIn.set(false);
    expect(runGuard()).toEqual(['/']);
  });
});
