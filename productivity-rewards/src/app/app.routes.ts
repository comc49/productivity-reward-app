import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./tasks/feature/task-list-page.component').then(
        (m) => m.TaskListPageComponent
      ),
  },
  {
    path: 'rewards',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./rewards/feature/rewards-page.component').then(
        (m) => m.RewardsPageComponent
      ),
  },
  {
    path: 'rewards/videos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./rewards/feature/video-search-page.component').then(
        (m) => m.VideoSearchPageComponent
      ),
  },
  {
    path: 'rewards/videos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./rewards/feature/video-player-page.component').then(
        (m) => m.VideoPlayerPageComponent
      ),
  },
  {
    path: 'news',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./news/feature/news-shop-page.component').then(
        (m) => m.NewsShopPageComponent
      ),
  },
  {
    path: 'news/sites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./news/feature/news-sites-page.component').then(
        (m) => m.NewsSitesPageComponent
      ),
  },
  {
    path: 'news/read/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./news/feature/news-timer-page.component').then(
        (m) => m.NewsTimerPageComponent
      ),
  },
];
