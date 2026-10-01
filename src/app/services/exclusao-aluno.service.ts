import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  ExclusaoAlunoRequest,
  ExclusaoAlunoResponse
} from '../models/exclusao-aluno-response';


@Injectable({
  providedIn: 'root'
})
export class ExclusaoAlunoService {

  private readonly apiUrl =
    '/api/exclusoes-alunos';

  constructor(
    private readonly http: HttpClient
  ) {
  }


  listarTodos():
    Observable<ExclusaoAlunoResponse[]> {

    return this.http.get<ExclusaoAlunoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }


  excluirNoSam(
    request: ExclusaoAlunoRequest
  ): Observable<ExclusaoAlunoResponse> {

    return this.http.post<ExclusaoAlunoResponse>(
      `${this.apiUrl}/sam`,
      request,
      {
        withCredentials: true
      }
    );
  }


  arquivarNoMod(
    request: ExclusaoAlunoRequest
  ): Observable<ExclusaoAlunoResponse> {

    return this.http.post<ExclusaoAlunoResponse>(
      `${this.apiUrl}/mod`,
      request,
      {
        withCredentials: true
      }
    );
  }

}
