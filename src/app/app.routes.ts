import { Routes } from '@angular/router';

import { DashboardRouteComponent } from './pages/dashboard/dashboard-route.component';
import { AlunosComponent } from './pages/alunos/alunos.component';
import { HistoricoComponent } from './pages/historico/historico.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardRouteComponent,
  },

  {
    path: 'alunos',
    component: AlunosComponent,
  },

  {
    path: 'historico',
    component: HistoricoComponent,
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
