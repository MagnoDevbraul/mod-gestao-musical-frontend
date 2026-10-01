import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  RelatorioMensalResponse
} from '../../models/relatorio-mensal-response';

import {
  RelatorioService
} from '../../services/relatorio.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.css'
})
export class RelatoriosComponent
  implements OnInit {

  ano = new Date().getFullYear();
  mes = new Date().getMonth() + 1;

  relatorio:
    RelatorioMensalResponse | null = null;

  carregando = false;
  erro = '';
  mensagem = '';

  readonly meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  constructor(
    private readonly service:
    RelatorioService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {

    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.service
      .buscar(this.ano, this.mes)
      .subscribe({

        next: (dados) => {

          this.relatorio = dados;
          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: () => {

          this.relatorio = null;
          this.carregando = false;

          this.erro =
            'Não existe relatório gerado para o período selecionado.';

          this.cdr.detectChanges();
        }
      });
  }

  gerar(): void {

    this.carregando = true;
    this.erro = '';
    this.mensagem = '';

    this.service
      .gerar(this.ano, this.mes)
      .subscribe({

        next: (dados) => {

          this.relatorio = dados;

          this.mensagem =
            'Relatório mensal gerado com sucesso.';

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          erro: HttpErrorResponse
        ) => {

          console.error(
            'Erro ao gerar relatório:',
            erro
          );

          this.erro =
            'Não foi possível gerar o relatório mensal.';

          this.carregando = false;

          this.cdr.detectChanges();
        }
      });
  }

  nomeMes(): string {

    return this.meses.find(
      item =>
        item.valor === this.mes
    )?.nome ?? '';
  }
}
