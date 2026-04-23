import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'budget',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./budget/budget-page.component').then(m => m.BudgetPageComponent),
  },
  {
    path: 'budget/manage',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./budget/manage/subscription-management-page.component').then(
        m => m.SubscriptionManagementPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
