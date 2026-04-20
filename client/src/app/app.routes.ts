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
];
