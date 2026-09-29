import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SolicitacaoAlteracaoAlunoResponse } from '../models/solicitacao-alteracao-aluno-response';

export interface DecisaoAlteracaoAlunoRequest {
  observacao: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AlteracaoRestritaService {

  private readonly apiUrl =
    '/api/alteracoes-restritas-alunos';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarPendentes():
    Observable<SolicitacaoAlteracaoAlunoResponse[]> {

    return this.http.get<SolicitacaoAlteracaoAlunoResponse[]>(
      `${this.apiUrl}/pendentes`,
      {
        withCredentials: true,
      }
    );
  }

  listarTodas():
    Observable<SolicitacaoAlteracaoAlunoResponse[]> {

    return this.http.get<SolicitacaoAlteracaoAlunoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true,
      }
    );
  }

  buscarPorId(
    id: number
  ): Observable<SolicitacaoAlteracaoAlunoResponse> {

    return this.http.get<SolicitacaoAlteracaoAlunoResponse>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true,
      }
    );
  }

  aprovar(
    id: number,
    observacao: string | null
  ): Observable<SolicitacaoAlteracaoAlunoResponse> {

    const body: DecisaoAlteracaoAlunoRequest = {
      observacao,
    };

    return this.http.patch<SolicitacaoAlteracaoAlunoResponse>(
      `${this.apiUrl}/${id}/aprovar`,
      body,
      {
        withCredentials: true,
      }
    );
  }

  rejeitar(
    id: number,
    observacao: string
  ): Observable<SolicitacaoAlteracaoAlunoResponse> {

    const body: DecisaoAlteracaoAlunoRequest = {
      observacao,
    };

    return this.http.patch<SolicitacaoAlteracaoAlunoResponse>(
      `${this.apiUrl}/${id}/rejeitar`,
      body,
      {
        withCredentials: true,
      }
    );
  }
}
