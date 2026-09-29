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
  AuditoriaResponse
} from '../../models/auditoria-response';

import {
  AuditoriaService
} from '../../services/auditoria.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css',
})
export class AuditoriaComponent
  implements OnInit {

  registros: AuditoriaResponse[] = [];

  carregando = false;
  erro = '';

  termoBusca = '';

  auditoriaSelecionada:
    AuditoriaResponse | null = null;

  constructor(
    private readonly service:
    AuditoriaService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.carregarAuditorias();
  }

  carregarAuditorias(): void {

    this.carregando = true;
    this.erro = '';

    this.service
      .listarTodos()
      .subscribe({

        next: (dados) => {

          this.registros =
            dados ?? [];

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao carregar auditorias:',
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

  get registrosFiltrados():
    AuditoriaResponse[] {

    const termo =
      this.termoBusca
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.registros;
    }

    return this.registros.filter(
      (registro) => {

        const campos = [
          registro.usuarioNome,
          registro.acao,
          registro.tabelaAfetada,
          registro.registroId,
          registro.descricao,
          this.nomeAcao(
            registro.acao
          ),
          this.nomeTabela(
            registro.tabelaAfetada
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

  abrirDetalhes(
    auditoria: AuditoriaResponse
  ): void {

    this.auditoriaSelecionada =
      auditoria;
  }

  fecharDetalhes(): void {

    this.auditoriaSelecionada =
      null;
  }

  nomeAcao(
    acao: string | null | undefined
  ): string {

    if (!acao) {
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

    return nomes[acao] ??
      acao
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(
          /^./,
          (letra) =>
            letra.toUpperCase()
        );
  }

  nomeTabela(
    tabela: string | null | undefined
  ): string {

    if (!tabela) {
      return '-';
    }

    const nomes:
      Record<string, string> = {

      aluno:
        'Aluno',

      solicitacao_alteracao_aluno:
        'Alteração Restrita',

      historico:
        'Histórico',

      notificacao:
        'Notificação',

      usuario:
        'Usuário',
    };

    return nomes[tabela] ??
      tabela
        .replaceAll('_', ' ')
        .replace(
          /^./,
          (letra) =>
            letra.toUpperCase()
        );
  }

  formatarDados(
    dados:
      Record<string, unknown>
      | null
      | undefined
  ): string {

    if (
      !dados ||
      Object.keys(dados).length === 0
    ) {
      return 'Sem dados';
    }

    return Object
      .entries(dados)
      .map(
        ([chave, valor]) =>
          `${this.nomeCampo(chave)}: ${this.formatarValor(valor)}`
      )
      .join('\n');
  }

  private nomeCampo(
    campo: string
  ): string {

    const nomes:
      Record<string, string> = {

      id:
        'ID',

      nome:
        'Nome',

      comumId:
        'Comum',

      comumNome:
        'Comum',

      nivelId:
        'Nível',

      nivelNome:
        'Nível',

      cargoMinisterioId:
        'Cargo/Ministério',

      cargoMinisterioNome:
        'Cargo/Ministério',

      possuiInstrumento:
        'Possui instrumento',

      dataBatismo:
        'Data de batismo',

      dataInicioGem:
        'Início no GEM',

      situacao:
        'Situação',

      status:
        'Status',

      motivo:
        'Motivo',

      observacao:
        'Observação',

      solicitacaoId:
        'Solicitação',
    };

    return nomes[campo] ??
      campo;
  }

  private formatarValor(
    valor: unknown
  ): string {

    if (
      valor === null ||
      valor === undefined
    ) {
      return '-';
    }

    if (typeof valor === 'boolean') {
      return valor
        ? 'Sim'
        : 'Não';
    }

    return String(valor);
  }

  private obterMensagemErro(
    erro: HttpErrorResponse
  ): string {

    if (erro.status === 401) {
      return 'Sessão expirada ou usuário não autenticado.';
    }

    if (erro.status === 403) {
      return 'Você não possui permissão para consultar a auditoria.';
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

    return 'Não foi possível carregar os registros de auditoria.';
  }
}
