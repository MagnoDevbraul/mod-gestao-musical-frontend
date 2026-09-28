import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlunoResponse } from '../../models/aluno-response';
import { AlunoService } from '../../services/aluno.service';

@Component({
  selector: 'app-alunos',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './alunos.component.html',
  styleUrl: './alunos.component.css'
})
export class AlunosComponent implements OnInit {

  alunos: AlunoResponse[] = [];
  alunosFiltrados: AlunoResponse[] = [];

  filtro = '';

  carregando = false;
  erro = '';

  constructor(
    private readonly alunoService: AlunoService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.carregarAlunos();
  }

  carregarAlunos(): void {

    this.carregando = true;
    this.erro = '';

    this.cdr.detectChanges();

    this.alunoService
      .listar()
      .subscribe({

        next: (dados) => {

          this.alunos = dados ?? [];
          this.alunosFiltrados = [...this.alunos];

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            'Erro ao carregar alunos:',
            erro
          );

          this.carregando = false;

          if (erro.status === 401) {

            this.erro =
              'Sessão inválida ou expirada.';

          } else if (erro.status === 403) {

            this.erro =
              'Você não possui permissão para consultar alunos.';

          } else {

            this.erro =
              'Não foi possível carregar os alunos.';
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

      this.alunosFiltrados = [
        ...this.alunos
      ];

      return;
    }

    this.alunosFiltrados =
      this.alunos.filter(
        aluno => {

          return (
            aluno.nome
              ?.toLowerCase()
              .includes(termo) ||

            aluno.comumNome
              ?.toLowerCase()
              .includes(termo) ||

            aluno.nivelNome
              ?.toLowerCase()
              .includes(termo) ||

            aluno.cargoMinisterioNome
              ?.toLowerCase()
              .includes(termo) ||

            aluno.situacao
              ?.toLowerCase()
              .includes(termo)
          );
        }
      );
  }

  limparFiltro(): void {

    this.filtro = '';

    this.alunosFiltrados = [
      ...this.alunos
    ];
  }

  classeSituacao(
    situacao: string
  ): string {

    if (
      situacao?.toUpperCase() === 'ATIVO'
    ) {
      return 'ativo';
    }

    return 'arquivado';
  }

}
