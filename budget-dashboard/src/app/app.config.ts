import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { InMemoryCache } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { environment } from '../environments/environment';

const graphqlUri = environment.apiUrl ? `${environment.apiUrl}/graphql` : '/graphql';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withNavigationErrorHandler(e => {
        if (e.error?.message?.includes('Failed to fetch')) {
          window.location.assign(e.url);
        }
      }),
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({ uri: graphqlUri }),
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: { fetchPolicy: 'cache-and-network' },
        },
      };
    }),
  ],
};
