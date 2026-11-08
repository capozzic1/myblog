import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home').then(m => m.Home), title: 'Chris  — The Blog' },
  { path: 'posts/:slug', loadComponent: () => import('./post-page').then(m => m.PostPage), title: 'Reflections — Chris ' },
  { path: '**', redirectTo: '' },
];
