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
  forkJoin
} from 'rxjs';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AlunoResponse
} from '../../models/aluno-response';

import {
  ExclusaoAlunoResponse
} from '../../models/exclusao-aluno-response';

import {
  AlunoService
} from '../../services/aluno.service';

import {
  ExclusaoAlunoService
} from '../../services/exclusao-aluno.service';


@Component({
  selector: 'app-exclusoes',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './exclusoes.component.html',

  styleUrl:
    './exclusoes.component.css'
})
export class ExclusoesComponent
  implements OnInit {

  alunosAtivos: AlunoResponse[] = [];
  alunosArquivados: AlunoResponse[] = [];

  exclusoes: ExclusaoAlunoResponse[] = [];

  alunoSelecionado:
    AlunoResponse | null = null;

  filtroAtivos = '';
  filtroArquivados = '';
  filtroHistorico = '';

  motivo = '';

  tipoOperacao:
    'MOD' | 'SAM' | null = null;

  carregando = false;
  processando = false;

  erro = '';
  mensagem = '';


  constructor(
    private readonly alunoService:
    AlunoService,

    private readonly exclusaoService:
    ExclusaoAlunoService,

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
    this.mensagem = '';

    forkJoin({
      alunos:
        this.alunoService.listar(),

      arquivados:
        this.alunoService.listarArquivados(),

      exclusoes:
        this.exclusaoService.listarTodos()
    })
      .subscribe({

        next: (dados) => {

          this.alunosAtivos =
            (dados.alunos ?? [])
              .filter(
                aluno =>
                  aluno.situacao
                    ?.toUpperCase()
                  !== 'ARQUIVADO'
              );

          this.alunosArquivados =
            dados.arquivados ?? [];

          this.exclusoes =
            [...(dados.exclusoes ?? [])]
              .sort(
                (a, b) =>
                  new Date(b.dataHora)
                    .getTime()
                  -
                  new Date(a.dataHora)
                    .getTime()
              );

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            'Erro ao carregar exclusões:',
            erro
          );

          this.carregando = false;

          this.erro =
            'Não foi possível carregar os dados de exclusões.';

          this.cdr.detectChanges();
        }

      });
  }


  get alunosAtivosFiltrados():
    AlunoResponse[] {

    const termo =
      this.filtroAtivos
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.alunosAtivos;
    }

    return this.alunosAtivos.filter(
      aluno =>
        aluno.nome
          ?.toLowerCase()
          .includes(termo)
        ||
        aluno.comumNome
          ?.toLowerCase()
          .includes(termo)
    );
  }


  get alunosArquivadosFiltrados():
    AlunoResponse[] {

    const termo =
      this.filtroArquivados
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.alunosArquivados;
    }

    return this.alunosArquivados.filter(
      aluno =>
        aluno.nome
          ?.toLowerCase()
          .includes(termo)
        ||
        aluno.comumNome
          ?.toLowerCase()
          .includes(termo)
    );
  }


  get exclusoesFiltradas():
    ExclusaoAlunoResponse[] {

    const termo =
      this.filtroHistorico
        .trim()
        .toLowerCase();

    if (!termo) {
      return this.exclusoes;
    }

    return this.exclusoes.filter(
      item =>
        item.alunoNome
          ?.toLowerCase()
          .includes(termo)
        ||
        item.usuarioNome
          ?.toLowerCase()
          .includes(termo)
        ||
        item.motivo
          ?.toLowerCase()
          .includes(termo)
    );
  }


  abrirArquivamento(
    aluno: AlunoResponse,
    tipo: 'MOD' | 'SAM'
  ): void {

    this.alunoSelecionado = aluno;

    this.tipoOperacao = tipo;

    this.motivo = '';

    this.erro = '';
    this.mensagem = '';
  }


  fecharModal(): void {

    if (this.processando) {
      return;
    }

    this.alunoSelecionado = null;

    this.tipoOperacao = null;

    this.motivo = '';
  }


  confirmarArquivamento(): void {

    if (
      !this.alunoSelecionado ||
      !this.tipoOperacao
    ) {
      return;
    }

    const motivo =
      this.motivo.trim();

    if (!motivo) {

      this.erro =
        'Informe o motivo da exclusão/arquivamento.';

      return;
    }

    this.processando = true;

    this.erro = '';
    this.mensagem = '';

    const request = {
      alunoId:
      this.alunoSelecionado.id,

      motivo
    };

    const operacao =
      this.tipoOperacao === 'SAM'
        ? this.exclusaoService
          .excluirNoSam(request)
        : this.exclusaoService
          .arquivarNoMod(request);

    operacao.subscribe({

      next: () => {

        this.processando = false;

        this.mensagem =
          this.tipoOperacao === 'SAM'
            ? 'Aluno excluído do SAM e arquivado no MOD com sucesso.'
            : 'Aluno arquivado no MOD com sucesso.';

        this.alunoSelecionado = null;

        this.tipoOperacao = null;

        this.motivo = '';

        this.carregarDados();

        this.cdr.detectChanges();
      },

      error: (
        erro: HttpErrorResponse
      ) => {

        console.error(
          'Erro na exclusão/arquivamento:',
          erro
        );

        this.processando = false;

        if (erro.status === 400) {

          this.erro =
            'Verifique o aluno e informe um motivo válido.';

        } else if (
          erro.status === 403
        ) {

          this.erro =
            'O usuário autenticado não possui permissão para realizar esta operação.';

        } else if (
          erro.status === 404
        ) {

          this.erro =
            'Aluno não encontrado.';

        } else if (
          erro.status === 409
        ) {

          this.erro =
            'O aluno já está arquivado.';

        } else {

          this.erro =
            'Não foi possível concluir a operação.';
        }

        this.cdr.detectChanges();
      }

    });
  }


  restaurar(
    aluno: AlunoResponse
  ): void {

    const confirmou =
      window.confirm(
        `Deseja restaurar o aluno "${aluno.nome}"?`
      );

    if (!confirmou) {
      return;
    }

    this.processando = true;

    this.erro = '';
    this.mensagem = '';

    this.alunoService
      .restaurar(aluno.id)
      .subscribe({

        next: () => {

          this.processando = false;

          this.mensagem =
            'Aluno restaurado com sucesso.';

          this.carregarDados();

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao restaurar aluno:',
            erro
          );

          this.processando = false;

          if (erro.status === 403) {

            this.erro =
              'O usuário autenticado não possui permissão para restaurar este aluno.';

          } else {

            this.erro =
              'Não foi possível restaurar o aluno.';
          }

          this.cdr.detectChanges();
        }

      });
  }

}
