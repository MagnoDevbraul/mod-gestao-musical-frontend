import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DashboardAlunosPorComum,
  DashboardResponse
} from './models/dashboard-response';

import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  dashboard: DashboardResponse | null = null;

  carregando = false;
  erro = '';

  autenticado = false;

  email = '';
  senha = '';

  mensagemLogin = '';

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.verificarSessao();
  }

  verificarSessao(): void {

    this.authService
      .sessao()
      .subscribe({

        next: () => {
          this.autenticado = true;
          this.carregarDashboard();
        },

        error: () => {
          this.autenticado = false;
          this.dashboard = null;
        }

      });
  }

  login(): void {

    this.erro = '';
    this.mensagemLogin = '';

    if (!this.email || !this.senha) {
      this.erro = 'Informe o e-mail e a senha.';
      return;
    }

    this.authService
      .login(this.email, this.senha)
      .subscribe({

        next: (resposta) => {

          this.mensagemLogin =
            resposta.mensagem;

          this.autenticado = true;

          this.senha = '';

          this.carregarDashboard();

        },

        error: (erro) => {

          console.error(
            'Erro no login:',
            erro
          );

          this.autenticado = false;

          if (erro.status === 401) {

            this.erro =
              'E-mail ou senha inválidos.';

          } else {

            this.erro =
              'Não foi possível realizar o login.';

          }

        }

      });
  }

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next: () => {

          this.autenticado = false;
          this.dashboard = null;

          this.email = '';
          this.senha = '';

          this.erro = '';
          this.mensagemLogin = '';

        },

        error: (erro) => {

          console.error(
            'Erro no logout:',
            erro
          );

          this.erro =
            'Não foi possível encerrar a sessão.';

        }

      });
  }

  carregarDashboard(): void {

    this.carregando = true;
    this.erro = '';

    this.dashboardService
      .buscarDashboardSecretaria()
      .subscribe({

        next: (dados) => {

          this.dashboard = dados;

          this.carregando = false;

        },

        error: (erro) => {

          console.error(
            'Erro ao carregar Dashboard:',
            erro
          );

          if (erro.status === 401) {

            this.autenticado = false;

            this.erro =
              'Sessão não autenticada.';

          } else if (erro.status === 403) {

            this.erro =
              'O usuário autenticado não possui permissão para acessar o Dashboard da Secretaria.';

          } else {

            this.erro =
              'Não foi possível carregar os dados do Dashboard.';

          }

          this.carregando = false;

        }

      });
  }

  percentualAtivos(): number {

    if (!this.dashboard || this.dashboard.totalAlunos === 0) {
      return 0;
    }

    return (
      this.dashboard.alunosAtivos /
      this.dashboard.totalAlunos
    ) * 100;
  }

  percentualArquivados(): number {

    if (!this.dashboard || this.dashboard.totalAlunos === 0) {
      return 0;
    }

    return (
      this.dashboard.alunosArquivados /
      this.dashboard.totalAlunos
    ) * 100;
  }

  alturaBarra(item: DashboardAlunosPorComum): number {

    if (!this.dashboard?.alunosPorComum.length) {
      return 0;
    }

    const maiorQuantidade = Math.max(
      ...this.dashboard.alunosPorComum.map(
        comum => comum.quantidade
      )
    );

    if (maiorQuantidade === 0) {
      return 0;
    }

    return (
      item.quantidade /
      maiorQuantidade
    ) * 80;
  }

  nomeEvento(tipoEvento: string): string {

    const nomes: Record<string, string> = {

      REGISTRO_MSA:
        'Registro de MSA',

      REGISTRO_MTS:
        'Registro de MTS',

      REGISTRO_METODO:
        'Registro de Método',

      REGISTRO_HINO:
        'Registro de Hino',

      REGISTRO_ESCALA:
        'Registro de Escala',

      ATUALIZACAO_ALUNO:
        'Atualização de Aluno',

      SOLICITACAO_ALTERACAO_RESTRITA_ALUNO:
        'Solicitação de Alteração Restrita',

      ALTERACAO_RESTRITA_ALUNO_APROVADA:
        'Alteração Restrita Aprovada',

      ALTERACAO_RESTRITA_ALUNO_REJEITADA:
        'Alteração Restrita Rejeitada'

    };

    return nomes[tipoEvento] ?? tipoEvento;
  }

}
