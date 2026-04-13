import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./tasks/feature/task-list-page.component').then(
        (m) => m.TaskListPageComponent
      ),
  },
];
