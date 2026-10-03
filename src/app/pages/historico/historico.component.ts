import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HistoricoResponse } from '../../models/historico-response';
import { HistoricoService } from '../../services/historico.service';


@Component({
  selector: 'app-historico',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnInit {

  historicos: HistoricoResponse[] = [];
  historicosFiltrados: HistoricoResponse[] = [];

  filtro = '';

  carregando = false;
  erro = '';


  constructor(
    private readonly historicoService: HistoricoService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {
    this.carregarHistorico();
  }


  carregarHistorico(): void {

    this.carregando = true;
    this.erro = '';

    this.cdr.detectChanges();

    this.historicoService
      .listar()
      .subscribe({

        next: (dados) => {

          /*
           * Ordenação decrescente:
           * registros mais recentes aparecem primeiro.
           */
          this.historicos =
            this.ordenarPorDataDecrescente(
              dados ?? []
            );

          this.historicosFiltrados = [
            ...this.historicos
          ];

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            'Erro ao carregar histórico:',
            erro
          );

          this.carregando = false;

          if (erro.status === 401) {

            this.erro =
              'Sessão inválida ou expirada.';

          } else if (erro.status === 403) {

            this.erro =
              'Você não possui permissão para consultar o histórico.';

          } else {

            this.erro =
              'Não foi possível carregar o histórico.';
          }

          this.cdr.detectChanges();
        }

      });
  }


  filtrar(): void {

    const termo =
      this.filtro
        .trim()
        .toLowerCase();

    if (!termo) {

      this.historicosFiltrados = [
        ...this.historicos
      ];

      return;
    }

    const resultado =
      this.historicos.filter(
        historico => {

          const anterior =
            this.situacaoAnterior(
              historico
            );

          const nova =
            this.situacaoNova(
              historico
            );

          return (
            historico.alunoNome
              ?.toLowerCase()
              .includes(termo) ||

            historico.usuarioNome
              ?.toLowerCase()
              .includes(termo) ||

            historico.tipoEvento
              ?.toLowerCase()
              .includes(termo) ||

            historico.descricao
              ?.toLowerCase()
              .includes(termo) ||

            anterior
              .toLowerCase()
              .includes(termo) ||

            nova
              .toLowerCase()
              .includes(termo)
          );
        }
      );

    this.historicosFiltrados =
      this.ordenarPorDataDecrescente(
        resultado
      );
  }


  limparFiltro(): void {

    this.filtro = '';

    this.historicosFiltrados = [
      ...this.historicos
    ];
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
        'Alteração Restrita Rejeitada',

      ALTERACAO_RESTRITA_ALUNO_DIRETA_SECRETARIA:
        'Alteração Restrita Direta',

      CADASTRO_ALUNO:
        'Cadastro de Aluno',

      EXCLUSAO_ALUNO:
        'Exclusão de Aluno',

      EXCLUSAO_ALUNO_SAM:
        'Exclusão no SAM',

      ARQUIVAMENTO_ALUNO_MOD:
        'Arquivamento no MOD',

      RESTAURACAO_ALUNO:
        'Restauração de Aluno',

      TESTE_HISTORICO:
        'Teste de Histórico'

    };

    return nomes[tipoEvento]
      ?? tipoEvento;
  }


  situacaoAnterior(
    historico: HistoricoResponse
  ): string {

    const evento =
      historico.tipoEvento
        ?.toUpperCase();


    /*
     * Arquivamento/exclusão:
     * antes o aluno estava ativo.
     */
    if (
      evento === 'EXCLUSAO_ALUNO' ||
      evento === 'EXCLUSAO_ALUNO_SAM' ||
      evento === 'ARQUIVAMENTO_ALUNO_MOD'
    ) {
      return 'ATIVO';
    }


    /*
     * Restauração:
     * antes estava arquivado.
     */
    if (
      evento === 'RESTAURACAO_ALUNO'
    ) {
      return 'ARQUIVADO';
    }


    /*
     * Cadastro não possui situação anterior.
     */
    if (
      evento === 'CADASTRO_ALUNO'
    ) {
      return '-';
    }


    /*
     * Eventos musicais não alteram
     * a situação do cadastro do aluno.
     */
    if (
      this.ehEventoMusical(
        evento
      )
    ) {
      return '-';
    }


    /*
     * Tenta recuperar a situação
     * registrada no valor anterior.
     */
    const situacao =
      this.extrairSituacao(
        historico.valorAnterior
      );

    return situacao ?? '-';
  }


  situacaoNova(
    historico: HistoricoResponse
  ): string {

    const evento =
      historico.tipoEvento
        ?.toUpperCase();


    /*
     * No MOD, exclusão/arquivamento
     * significa arquivamento lógico.
     */
    if (
      evento === 'EXCLUSAO_ALUNO' ||
      evento === 'EXCLUSAO_ALUNO_SAM' ||
      evento === 'ARQUIVAMENTO_ALUNO_MOD'
    ) {
      return 'ARQUIVADO';
    }


    /*
     * Restauração devolve o aluno
     * à situação ativa.
     */
    if (
      evento === 'RESTAURACAO_ALUNO'
    ) {
      return 'ATIVO';
    }


    /*
     * Aluno recém-cadastrado
     * inicia ativo no MOD.
     */
    if (
      evento === 'CADASTRO_ALUNO'
    ) {
      return 'ATIVO';
    }


    /*
     * MSA, MTS, método, hino e escala
     * não representam mudança de situação.
     */
    if (
      this.ehEventoMusical(
        evento
      )
    ) {
      return '-';
    }


    /*
     * Tenta recuperar a situação
     * registrada no valor novo.
     */
    const situacao =
      this.extrairSituacao(
        historico.valorNovo
      );

    return situacao ?? '-';
  }


  classeSituacao(
    situacao: string
  ): string {

    if (
      situacao === 'ATIVO'
    ) {
      return 'ativo';
    }

    if (
      situacao === 'ARQUIVADO'
    ) {
      return 'arquivado';
    }

    return 'neutro';
  }


  private ordenarPorDataDecrescente(
    historicos: HistoricoResponse[]
  ): HistoricoResponse[] {

    return [...historicos]
      .sort(
        (a, b) => {

          const dataA =
            a.dataHora
              ? new Date(a.dataHora).getTime()
              : 0;

          const dataB =
            b.dataHora
              ? new Date(b.dataHora).getTime()
              : 0;

          return dataB - dataA;
        }
      );
  }


  private ehEventoMusical(
    evento: string
  ): boolean {

    return [
      'REGISTRO_MSA',
      'REGISTRO_MTS',
      'REGISTRO_METODO',
      'REGISTRO_HINO',
      'REGISTRO_ESCALA'
    ].includes(evento);
  }


  private extrairSituacao(
    valor: string | null | undefined
  ): string | null {

    if (
      valor === null ||
      valor === undefined
    ) {
      return null;
    }

    const texto =
      String(valor)
        .trim();

    if (
      !texto ||
      texto.toLowerCase() === 'null'
    ) {
      return null;
    }


    /*
     * Caso o backend já envie somente
     * ATIVO ou ARQUIVADO.
     */
    const direta =
      this.normalizarSituacao(
        texto
      );

    if (direta) {
      return direta;
    }


    /*
     * Formato Java:
     * situacao=ATIVO
     */
    const formatoJava =
      texto.match(
        /situacao\s*=\s*([A-Za-zÀ-ÿ_]+)/i
      );

    if (
      formatoJava &&
      formatoJava[1]
    ) {

      return this.normalizarSituacao(
        formatoJava[1]
      );
    }


    /*
     * Formato JSON:
     * "situacao":"ATIVO"
     */
    const formatoJson =
      texto.match(
        /["']?situacao["']?\s*:\s*["']?([A-Za-zÀ-ÿ_]+)["']?/i
      );

    if (
      formatoJson &&
      formatoJson[1]
    ) {

      return this.normalizarSituacao(
        formatoJson[1]
      );
    }

    return null;
  }


  private normalizarSituacao(
    valor: string
  ): string | null {

    const texto =
      valor
        .trim()
        .toUpperCase()
        .replace(
          /["'{}\[\],;]/g,
          ''
        );

    switch (texto) {

      case 'ATIVO':
      case 'ATIVA':
        return 'ATIVO';

      case 'ARQUIVADO':
      case 'ARQUIVADA':
        return 'ARQUIVADO';

      /*
       * Para o MOD, exclusão lógica
       * equivale a arquivamento.
       */
      case 'EXCLUIDO':
      case 'EXCLUÍDO':
      case 'EXCLUIDA':
      case 'EXCLUÍDA':
        return 'ARQUIVADO';

      default:
        return null;
    }
  }

}
