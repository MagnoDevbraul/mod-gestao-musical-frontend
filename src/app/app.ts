import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

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
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  dashboard: DashboardResponse | null = null;

  carregando = false;
  autenticado = false;

  email = '';
  senha = '';

  mensagemLogin = '';

  private erroLogin = '';
  private erroDashboard = '';

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  get erro(): string {

    if (this.autenticado) {
      return this.erroDashboard;
    }

    return this.erroLogin;
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

          this.erroLogin = '';
          this.erroDashboard = '';

          this.cdr.detectChanges();

          this.carregarDashboard();
        },

        error: () => {

          this.autenticado = false;

          this.dashboard = null;

          this.erroDashboard = '';

          this.cdr.detectChanges();
        }

      });
  }

  login(): void {

    this.erroLogin = '';
    this.erroDashboard = '';
    this.mensagemLogin = '';

    if (
      !this.email.trim() ||
      !this.senha
    ) {

      this.autenticado = false;

      this.erroLogin =
        'Informe o e-mail e a senha.';

      this.cdr.detectChanges();

      return;
    }

    this.authService
      .login(
        this.email.trim(),
        this.senha
      )
      .subscribe({

        next: (resposta) => {

          this.autenticado = true;

          this.erroLogin = '';
          this.erroDashboard = '';

          this.mensagemLogin =
            resposta.mensagem;

          this.senha = '';

          this.router
            .navigateByUrl('/dashboard')
            .then(() => {

              this.cdr.detectChanges();

              this.carregarDashboard();
            });
        },

        error: (erro) => {

          console.error(
            'Erro no login:',
            erro
          );

          this.autenticado = false;

          this.dashboard = null;

          this.erroDashboard = '';

          if (erro.status === 401) {

            this.erroLogin =
              'E-mail ou senha inválidos.';

          } else {

            this.erroLogin =
              'Não foi possível realizar o login.';
          }

          this.cdr.detectChanges();
        }

      });
  }

  logout(): void {

    this.erroLogin = '';
    this.erroDashboard = '';
    this.mensagemLogin = '';

    this.authService
      .logout()
      .subscribe({

        next: () => {

          this.limparSessaoLocal();
        },

        error: (erro) => {

          console.error(
            'Erro no logout:',
            erro
          );

          this.erroDashboard =
            'Não foi possível encerrar a sessão.';

          this.cdr.detectChanges();
        }

      });
  }

  private limparSessaoLocal(): void {

    this.autenticado = false;

    this.dashboard = null;

    this.carregando = false;

    this.email = '';
    this.senha = '';

    this.erroLogin = '';
    this.erroDashboard = '';

    this.mensagemLogin = '';

    this.router
      .navigateByUrl('/dashboard')
      .then(() => {
        this.cdr.detectChanges();
      });
  }

  carregarDashboard(): void {

    this.carregando = true;

    this.erroDashboard = '';

    this.cdr.detectChanges();

    this.dashboardService
      .buscarDashboardSecretaria()
      .subscribe({

        next: (dados) => {

          this.dashboard = dados;

          this.erroDashboard = '';

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            'Erro ao carregar Dashboard:',
            erro
          );

          this.carregando = false;

          if (erro.status === 401) {

            this.dashboard = null;

            this.autenticado = false;

            this.erroDashboard = '';

            this.erroLogin =
              'Sua sessão expirou. Faça login novamente.';

          } else if (erro.status === 403) {

            this.erroDashboard =
              'O usuário autenticado não possui permissão para acessar o Dashboard da Secretaria.';

          } else {

            this.erroDashboard =
              'Não foi possível carregar os dados do Dashboard.';
          }

          this.cdr.detectChanges();
        }

      });
  }

  estaNoDashboard(): boolean {

    return (
      this.router.url === '/' ||
      this.router.url === '/dashboard' ||
      this.router.url.startsWith('/dashboard?')
    );
  }

  percentualAtivos(): number {

    if (
      !this.dashboard ||
      this.dashboard.totalAlunos === 0
    ) {
      return 0;
    }

    return (
      this.dashboard.alunosAtivos /
      this.dashboard.totalAlunos
    ) * 100;
  }

  percentualArquivados(): number {

    if (
      !this.dashboard ||
      this.dashboard.totalAlunos === 0
    ) {
      return 0;
    }

    return (
      this.dashboard.alunosArquivados /
      this.dashboard.totalAlunos
    ) * 100;
  }

  alturaBarra(
    item: DashboardAlunosPorComum
  ): number {

    if (
      !this.dashboard
        ?.alunosPorComum
        ?.length
    ) {
      return 0;
    }

    const maiorQuantidade =
      Math.max(
        ...this.dashboard
          .alunosPorComum
          .map(
            comum =>
              comum.quantidade
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

  nomeEvento(
    tipoEvento: string
  ): string {

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
