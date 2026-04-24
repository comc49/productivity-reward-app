import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';

const isThirdPartyUrl = (url: string): boolean => {
  if (url.startsWith('/')) return false;
  const apiUrl = (environment as { apiUrl?: string }).apiUrl;
  if (apiUrl && url.startsWith(apiUrl)) return false;
  return url.startsWith('https://');
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (isThirdPartyUrl(req.url)) return next(req);

  const auth = inject(Auth);

  // Wait for Firebase to restore auth state before deciding whether to attach a token.
  // Without this, requests fired before Firebase resolves its initial state go out unauthenticated.
  return from(auth.authStateReady()).pipe(
    switchMap(() => {
      const currentUser = auth.currentUser;
      if (!currentUser) return next(req);
      return from(currentUser.getIdToken()).pipe(
        switchMap(token => {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
          return next(authReq);
        }),
      );
    }),
  );
};
