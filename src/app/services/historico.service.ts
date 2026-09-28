import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { HistoricoResponse } from '../models/historico-response';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {

  private readonly apiUrl = '/api/historicos';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listar(): Observable<HistoricoResponse[]> {

    return this.http.get<HistoricoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }

  buscarPorId(
    id: number
  ): Observable<HistoricoResponse> {

    return this.http.get<HistoricoResponse>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }

  listarPorAluno(
    alunoId: number
  ): Observable<HistoricoResponse[]> {

    return this.http.get<HistoricoResponse[]>(
      `${this.apiUrl}/aluno/${alunoId}`,
      {
        withCredentials: true
      }
    );
  }

}
