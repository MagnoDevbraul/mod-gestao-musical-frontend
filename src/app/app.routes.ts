import { Routes } from '@angular/router';

import {
  DashboardRouteComponent
} from './pages/dashboard/dashboard-route.component';

import {
  AlunosComponent
} from './pages/alunos/alunos.component';

import {
  HistoricoComponent
} from './pages/historico/historico.component';

import {
  AuditoriaComponent
} from './pages/auditoria/auditoria.component';

import {
  NotificacoesComponent
} from './pages/notificacoes/notificacoes.component';

import {
  AlteracoesRestritasComponent
} from './pages/alteracoes-restritas/alteracoes-restritas.component';

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
    path: 'auditoria',
    component: AuditoriaComponent,
  },

  {
    path: 'notificacoes',
    component: NotificacoesComponent,
  },

  {
    path: 'alteracoes-restritas',
    component: AlteracoesRestritasComponent,
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
