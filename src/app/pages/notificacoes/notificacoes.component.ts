import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  NotificacaoResponse
} from '../../models/notificacao-response';

import {
  NotificacaoService
} from '../../services/notificacao.service';


@Component({
  selector: 'app-notificacoes',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './notificacoes.component.html',

  styleUrl:
    './notificacoes.component.css',
})
export class NotificacoesComponent
  implements OnInit {

  notificacoes:
    NotificacaoResponse[] = [];

  carregando = false;
  erro = '';
  termoBusca = '';


  constructor(
    private readonly service:
    NotificacaoService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {
    this.carregarNotificacoes();
  }


  carregarNotificacoes(): void {

    this.carregando = true;
    this.erro = '';

    this.service
      .listarTodos()
      .subscribe({

        next: (dados) => {

          this.notificacoes =
            this.ordenarPorDataDecrescente(
              dados ?? []
            );

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao carregar notificações:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro
            );

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }


  get notificacoesFiltradas():
    NotificacaoResponse[] {

    const termo =
      this.termoBusca
        .trim()
        .toLowerCase();

    if (!termo) {

      return this.ordenarPorDataDecrescente(
        this.notificacoes
      );
    }

    const resultado =
      this.notificacoes.filter(
        (notificacao) => {

          const campos = [
            notificacao.titulo,
            notificacao.mensagem,
            notificacao.tipoEvento,
            notificacao.usuarioNome,
            notificacao.alunoNome,
          ];

          return campos.some(
            (campo) =>
              String(campo ?? '')
                .toLowerCase()
                .includes(termo)
          );
        }
      );

    return this.ordenarPorDataDecrescente(
      resultado
    );
  }


  get totalNaoLidas(): number {

    return this.notificacoes.filter(
      (notificacao) =>
        !notificacao.lida
    ).length;
  }


  marcarComoLida(
    notificacao: NotificacaoResponse
  ): void {

    if (notificacao.lida) {
      return;
    }

    this.erro = '';

    this.service
      .marcarComoLida(
        notificacao.id
      )
      .subscribe({

        next: (atualizada) => {

          const indice =
            this.notificacoes
              .findIndex(
                (item) =>
                  item.id === atualizada.id
              );

          if (indice >= 0) {

            this.notificacoes[indice] =
              atualizada;

            this.notificacoes =
              this.ordenarPorDataDecrescente(
                this.notificacoes
              );
          }

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao marcar notificação como lida:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro
            );

          this.cdr.detectChanges();
        }

      });
  }


  nomeEvento(
    evento: string | null | undefined
  ): string {

    if (!evento) {
      return '-';
    }

    const nomes:
      Record<string, string> = {

      CADASTRO_ALUNO:
        'Cadastro de aluno',

      ATUALIZACAO_ALUNO:
        'Atualização de aluno',

      EXCLUSAO_ALUNO:
        'Arquivamento de aluno',

      EXCLUSAO_ALUNO_SAM:
        'Exclusão no SAM',

      ARQUIVAMENTO_ALUNO_MOD:
        'Arquivamento no MOD',

      RESTAURACAO_ALUNO:
        'Restauração de aluno',

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

      SOLICITACAO_ALTERACAO_RESTRITA_ALUNO:
        'Solicitação de alteração restrita',

      ALTERACAO_RESTRITA_ALUNO_APROVADA:
        'Alteração restrita aprovada',

      ALTERACAO_RESTRITA_ALUNO_REJEITADA:
        'Alteração restrita rejeitada',

      ALTERACAO_RESTRITA_ALUNO_DIRETA_SECRETARIA:
        'Alteração restrita pela Secretaria',
    };

    return nomes[evento] ??
      evento
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(
          /^./,
          (letra) =>
            letra.toUpperCase()
        );
  }


  private ordenarPorDataDecrescente(
    notificacoes:
    NotificacaoResponse[]
  ): NotificacaoResponse[] {

    return [...notificacoes]
      .sort(
        (a, b) => {

          const dataA =
            a.dataHora
              ? new Date(
                a.dataHora
              ).getTime()
              : 0;

          const dataB =
            b.dataHora
              ? new Date(
                b.dataHora
              ).getTime()
              : 0;

          return dataB - dataA;
        }
      );
  }


  private obterMensagemErro(
    erro: HttpErrorResponse
  ): string {

    if (erro.status === 401) {

      return 'Sessão expirada ou usuário não autenticado.';
    }

    if (erro.status === 403) {

      return 'Você não possui permissão para consultar as notificações.';
    }

    if (
      typeof erro.error ===
      'string' &&
      erro.error.trim()
    ) {

      return erro.error;
    }

    if (
      erro.error &&
      typeof erro.error.message ===
      'string'
    ) {

      return erro.error.message;
    }

    return 'Não foi possível carregar as notificações.';
  }

}
