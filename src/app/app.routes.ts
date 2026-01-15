import {Routes} from '@angular/router';
import {MainLayoutComponent} from './core/layout/main-layout/main-layout.component';
import {authGuard} from './core/guards/auth.guard';
import {loadRemoteModule} from '@angular-architects/module-federation';

export const routes: Routes = [
  {path: 'login', loadComponent: () => import('./core/login/login.component').then(c => c.LoginComponent)},
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'dashboard/list',
        loadComponent: () => import('./pages/dashboard/list/list.component').then(c => c.ListComponent),
      },
      {
        path: 'patient-visit',
        loadComponent: () => import('./pages/patient-visit/patient-visit.component').then(c => c.PatientVisitComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(c => c.ReportsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(c => c.UserListComponent),
      },
      {
        path: 'telemed',
        children: [
          {
            path: 'arm',
            loadComponent: () => import('./pages/arm/arm.component').then(c => c.ARMComponent)
          }
        ]
      }
      // {
      //   path: 'telemed',
      //   loadChildren: () =>
      //     loadRemoteModule({
      //       type: 'module',
      //       remoteEntry: 'http://localhost:4201/remoteEntry.js',
      //       exposedModule: './Routes',
      //     })
      //       .then(m => m.routes)
      //       .catch(err => {
      //         console.error('Error loading remote module:', err);
      //         return [];
      //       })
      // },
      // {
      //   path: 'asmo',
      //   loadChildren: () =>
      //     loadRemoteModule({
      //       type: 'module',
      //       remoteEntry: 'http://localhost:4202/remoteEntry.js',
      //       exposedModule: './Routes',
      //     })
      //       .then(m => m.routes)
      //       .catch(err => {
      //         console.error('Error loading remote module:', err);
      //         return [];
      //       })
      // }
    ]
  },
  {path: '**', redirectTo: 'login'},
];
