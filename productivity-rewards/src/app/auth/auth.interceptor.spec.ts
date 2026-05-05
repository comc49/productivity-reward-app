import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Auth } from '@angular/fire/auth';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let mockCurrentUser: { getIdToken: () => Promise<string> } | null = null;

  const mockAuth = {
    authStateReady: () => Promise.resolve(),
    get currentUser() {
      return mockCurrentUser;
    },
  };

  beforeEach(() => {
    mockCurrentUser = null;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: mockAuth },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('passes the request through without Authorization when no user', async () => {
    mockCurrentUser = null;
    http.get('/api/test').subscribe();

    await Promise.resolve();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('attaches Bearer token when user is logged in', async () => {
    mockCurrentUser = { getIdToken: () => Promise.resolve('test-token-123') };

    http.get('/api/test').subscribe();

    await Promise.resolve();
    await Promise.resolve();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-123');
    req.flush({});
  });
});
