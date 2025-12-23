import {Routes} from '@angular/router';
import {MainLayoutComponent} from './core/layout/main-layout/main-layout.component';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'users', pathMatch: 'full'},
  {path: 'login', loadComponent: () => import('./core/login/login.component').then(c => c.LoginComponent)},
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./pages/patient-visit/patient-visit.component').then(c => c.PatientVisitComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(c => c.ReportsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(c => c.UserListComponent),
      }
    ]
  },
  {path: '**', redirectTo: 'users'},
];
