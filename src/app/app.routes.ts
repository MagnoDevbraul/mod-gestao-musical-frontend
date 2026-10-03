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
  CompartilhamentosComponent
} from './pages/compartilhamentos/compartilhamentos.component';

import {
  AlteracoesRestritasComponent
} from './pages/alteracoes-restritas/alteracoes-restritas.component';

import {
  RelatoriosComponent
} from './pages/relatorios/relatorios.component';

import {
  UsuariosPermissoesComponent
} from './pages/usuarios-permissoes/usuarios-permissoes.component';

import { ExclusoesComponent } from './pages/exclusoes/exclusoes.component';

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
    path: 'compartilhamentos',
    component: CompartilhamentosComponent,
  },

  {
    path: 'alteracoes-restritas',
    component: AlteracoesRestritasComponent,
  },

  {
    path: 'relatorios',
    component: RelatoriosComponent,
  },

  {
    path: 'usuarios-permissoes',
    component: UsuariosPermissoesComponent,
  },

  {
    path: 'exclusoes',
    component: ExclusoesComponent,
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
