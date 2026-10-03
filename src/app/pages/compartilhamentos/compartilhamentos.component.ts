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
  forkJoin
} from 'rxjs';

import {
  AlunoResponse
} from '../../models/aluno-response';

import {
  ComumResponse
} from '../../models/comum-response';

import {
  AlunoCompartilhamentoResponse
} from '../../models/aluno-compartilhamento-response';

import {
  AlunoService
} from '../../services/aluno.service';

import {
  ComumService
} from '../../services/comum.service';

import {
  AlunoCompartilhamentoService
} from '../../services/aluno-compartilhamento.service';


@Component({
  selector:
    'app-compartilhamentos',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './compartilhamentos.component.html',

  styleUrl:
    './compartilhamentos.component.css'
})
export class CompartilhamentosComponent
  implements OnInit {

  alunos:
    AlunoResponse[] = [];

  comuns:
    ComumResponse[] = [];

  compartilhamentos:
    AlunoCompartilhamentoResponse[] = [];

  alunoId:
    number | null = null;

  comumDestinoId:
    number | null = null;

  termoBusca = '';

  carregando = false;

  processando = false;

  erro = '';

  mensagem = '';


  constructor(
    private readonly alunoService:
    AlunoService,

    private readonly comumService:
    ComumService,

    private readonly compartilhamentoService:
    AlunoCompartilhamentoService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {

    this.carregarDados();
  }


  carregarDados(): void {

    this.carregando = true;

    this.erro = '';

    forkJoin({

      alunos:
        this.alunoService.listar(),

      comuns:
        this.comumService.listar(),

      compartilhamentos:
        this.compartilhamentoService
          .listarTodos()

    })
      .subscribe({

        next: (dados) => {

          this.compartilhamentos =
            this.ordenarPorDataDecrescente(
              dados.compartilhamentos ?? []
            );

          const alunosCompartilhados =
            new Set(
              this.compartilhamentos
                .map(
                  compartilhamento =>
                    compartilhamento.alunoId
                )
            );

          this.alunos =
            (dados.alunos ?? [])
              .filter(
                aluno =>

                  aluno.situacao
                    ?.toUpperCase()
                  !== 'ARQUIVADO'

                  &&

                  !alunosCompartilhados
                    .has(
                      aluno.id
                    )
              )
              .sort(
                (a, b) =>
                  a.nome.localeCompare(
                    b.nome,
                    'pt-BR'
                  )
              );

          this.comuns =
            [...(dados.comuns ?? [])]
              .sort(
                (a, b) =>
                  a.nome.localeCompare(
                    b.nome,
                    'pt-BR'
                  )
              );

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          erro:
          HttpErrorResponse
        ) => {

          console.error(
            'Erro ao carregar compartilhamentos:',
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


  get alunoSelecionado():
    AlunoResponse | null {

    if (
      this.alunoId === null
    ) {
      return null;
    }

    return this.alunos.find(
      aluno =>
        aluno.id ===
        this.alunoId
    ) ?? null;
  }


  get comunsDestino():
    ComumResponse[] {

    const aluno =
      this.alunoSelecionado;

    if (!aluno) {

      return this.comuns;
    }

    return this.comuns.filter(
      comum =>
        comum.id !==
        aluno.comumId
    );
  }


  get compartilhamentosFiltrados():
    AlunoCompartilhamentoResponse[] {

    const termo =
      this.termoBusca
        .trim()
        .toLowerCase();

    if (!termo) {

      return this.compartilhamentos;
    }

    return this.compartilhamentos
      .filter(
        compartilhamento => {

          const campos = [

            compartilhamento
              .alunoNome,

            compartilhamento
              .comumOrigemNome,

            compartilhamento
              .comumDestinoNome,

            compartilhamento
              .compartilhadoPorUsuarioNome

          ];

          return campos.some(
            campo =>
              String(
                campo ?? ''
              )
                .toLowerCase()
                .includes(
                  termo
                )
          );
        }
      );
  }


  aoSelecionarAluno(): void {

    this.comumDestinoId =
      null;

    this.erro = '';
    this.mensagem = '';
  }


  compartilhar(): void {

    this.erro = '';
    this.mensagem = '';

    if (
      this.alunoId === null
    ) {

      this.erro =
        'Selecione um aluno.';

      return;
    }

    if (
      this.comumDestinoId ===
      null
    ) {

      this.erro =
        'Selecione a Comum de destino.';

      return;
    }

    const aluno =
      this.alunoSelecionado;

    if (
      aluno &&
      aluno.comumId ===
      this.comumDestinoId
    ) {

      this.erro =
        'A Comum de destino deve ser diferente da Comum de origem.';

      return;
    }

    this.processando = true;

    this.compartilhamentoService
      .compartilhar({

        alunoId:
        this.alunoId,

        comumDestinoId:
        this.comumDestinoId

      })
      .subscribe({

        next: () => {

          this.processando = false;

          this.mensagem =
            'Aluno compartilhado com sucesso.';

          this.alunoId = null;

          this.comumDestinoId =
            null;

          this.carregarDados();

          this.cdr.detectChanges();
        },

        error: (
          erro:
          HttpErrorResponse
        ) => {

          console.error(
            'Erro ao compartilhar aluno:',
            erro
          );

          this.processando = false;

          this.erro =
            this.obterMensagemErro(
              erro
            );

          this.cdr.detectChanges();
        }

      });
  }


  private ordenarPorDataDecrescente(
    registros:
    AlunoCompartilhamentoResponse[]
  ):
    AlunoCompartilhamentoResponse[] {

    return [...registros]
      .sort(
        (a, b) => {

          const dataA =
            a.criadoEm
              ? new Date(
                a.criadoEm
              ).getTime()
              : 0;

          const dataB =
            b.criadoEm
              ? new Date(
                b.criadoEm
              ).getTime()
              : 0;

          return dataB - dataA;
        }
      );
  }


  private obterMensagemErro(
    erro:
    HttpErrorResponse
  ): string {

    if (
      erro.status === 400
    ) {

      return 'Verifique o aluno e a Comum de destino.';
    }

    if (
      erro.status === 401
    ) {

      return 'Sessão expirada ou usuário não autenticado.';
    }

    if (
      erro.status === 403
    ) {

      return 'Você não possui permissão para compartilhar alunos.';
    }

    if (
      erro.status === 404
    ) {

      return 'Aluno ou Comum de destino não encontrada.';
    }

    if (
      erro.status === 409
    ) {

      if (
        typeof erro.error ===
        'string'
      ) {

        return erro.error;
      }

      if (
        erro.error?.message
      ) {

        return erro.error.message;
      }

      return 'O aluno não pode ser compartilhado nesta situação.';
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

    return 'Não foi possível realizar o compartilhamento.';
  }

}
