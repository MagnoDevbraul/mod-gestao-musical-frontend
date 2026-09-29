import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  SolicitacaoAlteracaoAlunoResponse
} from '../../models/solicitacao-alteracao-aluno-response';

import {
  AlteracaoRestritaService
} from '../../services/alteracao-restrita.service';

type TipoDecisao =
  | 'APROVAR'
  | 'REJEITAR';

@Component({
  selector: 'app-alteracoes-restritas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './alteracoes-restritas.component.html',
  styleUrl:
    './alteracoes-restritas.component.css',
})
export class AlteracoesRestritasComponent
  implements OnInit {

  solicitacoes:
    SolicitacaoAlteracaoAlunoResponse[] = [];

  carregando = false;
  processando = false;

  erro = '';
  mensagemSucesso = '';

  termoBusca = '';

  solicitacaoSelecionada:
    SolicitacaoAlteracaoAlunoResponse | null = null;

  tipoDecisao:
    TipoDecisao | null = null;

  observacaoDecisao = '';

  constructor(
    private readonly service:
    AlteracaoRestritaService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.carregarPendentes();
  }

  carregarPendentes(): void {

    this.carregando = true;
    this.erro = '';
    this.mensagemSucesso = '';

    this.service
      .listarPendentes()
      .subscribe({

        next: (dados) => {

          this.solicitacoes =
            dados ?? [];

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao carregar alterações restritas:',
            erro
          );

          this.erro =
            this.obterMensagemErro(
              erro,
              'Não foi possível carregar as alterações restritas.'
            );

          this.carregando = false;

          this.cdr.detectChanges();
        }
      });
  }

  get solicitacoesFiltradas():
    SolicitacaoAlteracaoAlunoResponse[] {

    const termo =
      this.termoBusca
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.solicitacoes;
    }

    return this.solicitacoes.filter(
      (solicitacao) => {

        const campos = [
          solicitacao.alunoNome,
          solicitacao.solicitanteNome,
          solicitacao.status,
          solicitacao.motivo,
          this.camposSolicitados(
            solicitacao
          ),
        ];

        return campos.some(
          (campo) =>
            String(campo ?? '')
              .toLowerCase()
              .includes(termo)
        );
      }
    );
  }

  abrirAprovacao(
    solicitacao:
    SolicitacaoAlteracaoAlunoResponse
  ): void {

    this.solicitacaoSelecionada =
      solicitacao;

    this.tipoDecisao =
      'APROVAR';

    this.observacaoDecisao = '';
    this.erro = '';
    this.mensagemSucesso = '';
  }

  abrirRejeicao(
    solicitacao:
    SolicitacaoAlteracaoAlunoResponse
  ): void {

    this.solicitacaoSelecionada =
      solicitacao;

    this.tipoDecisao =
      'REJEITAR';

    this.observacaoDecisao = '';
    this.erro = '';
    this.mensagemSucesso = '';
  }

  fecharDecisao(): void {

    if (this.processando) {
      return;
    }

    this.solicitacaoSelecionada = null;
    this.tipoDecisao = null;
    this.observacaoDecisao = '';
  }

  confirmarDecisao(): void {

    if (
      !this.solicitacaoSelecionada ||
      !this.tipoDecisao
    ) {
      return;
    }

    if (
      this.tipoDecisao ===
      'REJEITAR' &&
      !this.observacaoDecisao.trim()
    ) {

      this.erro =
        'Informe o motivo da rejeição.';

      return;
    }

    const id =
      this.solicitacaoSelecionada.id;

    const observacao =
      this.observacaoDecisao
        .trim() || null;

    this.processando = true;
    this.erro = '';
    this.mensagemSucesso = '';

    const requisicao =
      this.tipoDecisao ===
      'APROVAR'
        ? this.service.aprovar(
          id,
          observacao
        )
        : this.service.rejeitar(
          id,
          observacao ?? ''
        );

    requisicao.subscribe({

      next: () => {

        this.mensagemSucesso =
          this.tipoDecisao ===
          'APROVAR'
            ? 'Alteração restrita aprovada com sucesso.'
            : 'Alteração restrita rejeitada com sucesso.';

        this.processando = false;

        this.solicitacaoSelecionada =
          null;

        this.tipoDecisao = null;
        this.observacaoDecisao = '';

        this.carregarPendentes();

        this.cdr.detectChanges();
      },

      error: (erro: HttpErrorResponse) => {

        console.error(
          'Erro ao processar alteração restrita:',
          erro
        );

        this.erro =
          this.obterMensagemErro(
            erro,
            'Não foi possível concluir a decisão.'
          );

        this.processando = false;

        this.cdr.detectChanges();
      }
    });
  }

  camposSolicitados(
    solicitacao:
    SolicitacaoAlteracaoAlunoResponse
  ): string {

    const campos: string[] = [];

    if (
      solicitacao.comumId !== null &&
      solicitacao.comumId !== undefined
    ) {
      campos.push(
        `Comum → ID ${solicitacao.comumId}`
      );
    }

    if (
      solicitacao.nivelId !== null &&
      solicitacao.nivelId !== undefined
    ) {
      campos.push(
        `Nível → ID ${solicitacao.nivelId}`
      );
    }

    if (
      solicitacao.cargoMinisterioId !==
      null &&
      solicitacao.cargoMinisterioId !==
      undefined
    ) {
      campos.push(
        `Cargo/Ministério → ID ${solicitacao.cargoMinisterioId}`
      );
    }

    if (solicitacao.dataBatismo) {
      campos.push(
        `Data de Batismo → ${this.formatarData(
          solicitacao.dataBatismo
        )}`
      );
    }

    if (solicitacao.dataInicioGem) {
      campos.push(
        `Início GEM → ${this.formatarData(
          solicitacao.dataInicioGem
        )}`
      );
    }

    if (campos.length === 0) {
      return 'Nenhuma alteração informada';
    }

    return campos.join(' • ');
  }

  formatarData(
    data: string
  ): string {

    if (!data) {
      return '-';
    }

    const partes =
      data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  tituloModal(): string {

    return this.tipoDecisao ===
    'APROVAR'
      ? 'Aprovar Alteração Restrita'
      : 'Rejeitar Alteração Restrita';
  }

  textoBotaoConfirmacao(): string {

    if (this.processando) {
      return 'Processando...';
    }

    return this.tipoDecisao ===
    'APROVAR'
      ? 'Confirmar aprovação'
      : 'Confirmar rejeição';
  }

  private obterMensagemErro(
    erro: HttpErrorResponse,
    mensagemPadrao: string
  ): string {

    if (erro.status === 401) {
      return 'Sessão expirada ou usuário não autenticado.';
    }

    if (erro.status === 403) {
      return 'Você não possui permissão para executar esta operação.';
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

    if (
      erro.error &&
      typeof erro.error.erro ===
      'string'
    ) {
      return erro.error.erro;
    }

    return mensagemPadrao;
  }
}
