import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'camera',
    loadComponent: () => import('./pages/camera/camera.page').then( m => m.CameraPage)
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/upload/upload.page').then( m => m.UploadPage)
  },
  {
    path: 'gps',
    loadComponent: () => import('./pages/gps/gps.page').then( m => m.GpsPage)
  },
  {
    path: 'api',
    loadComponent: () => import('./pages/api/api.page').then( m => m.ApiPage)
  },
  {
  path: 'character/:id',
  loadComponent: () =>
    import('./pages/character-details/character-details.page').then((m) => m.CharacterDetailsPage)
  },
  {
    path: 'news',
    loadComponent: () => import('./pages/news/news.page').then( m => m.NewsPage)
  }
];

export const appRouting = provideRouter(routes);