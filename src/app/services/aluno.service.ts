import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  AlunoResponse
} from '../models/aluno-response';


@Injectable({
  providedIn: 'root'
})
export class AlunoService {

  private readonly apiUrl =
    '/api/alunos';

  constructor(
    private readonly http: HttpClient
  ) {
  }


  listar():
    Observable<AlunoResponse[]> {

    return this.http.get<AlunoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }


  listarArquivados():
    Observable<AlunoResponse[]> {

    return this.http.get<AlunoResponse[]>(
      `${this.apiUrl}/arquivados`,
      {
        withCredentials: true
      }
    );
  }


  buscarPorId(
    id: number
  ): Observable<AlunoResponse> {

    return this.http.get<AlunoResponse>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }


  restaurar(
    id: number
  ): Observable<AlunoResponse> {

    return this.http.patch<AlunoResponse>(
      `${this.apiUrl}/${id}/restaurar`,
      {},
      {
        withCredentials: true
      }
    );
  }

}
