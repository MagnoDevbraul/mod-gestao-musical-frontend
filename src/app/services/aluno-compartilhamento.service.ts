import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  AlunoCompartilhamentoRequest,
  AlunoCompartilhamentoResponse
} from '../models/aluno-compartilhamento-response';


@Injectable({
  providedIn: 'root'
})
export class AlunoCompartilhamentoService {

  private readonly apiUrl =
    '/api/alunos-compartilhamentos';


  constructor(
    private readonly http:
    HttpClient
  ) {
  }


  listarTodos():
    Observable<
      AlunoCompartilhamentoResponse[]
    > {

    return this.http.get<
      AlunoCompartilhamentoResponse[]
    >(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }


  buscarPorId(
    id: number
  ): Observable<
    AlunoCompartilhamentoResponse
  > {

    return this.http.get<
      AlunoCompartilhamentoResponse
    >(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }


  buscarPorAluno(
    alunoId: number
  ): Observable<
    AlunoCompartilhamentoResponse
  > {

    return this.http.get<
      AlunoCompartilhamentoResponse
    >(
      `${this.apiUrl}/aluno/${alunoId}`,
      {
        withCredentials: true
      }
    );
  }


  compartilhar(
    request:
    AlunoCompartilhamentoRequest
  ): Observable<
    AlunoCompartilhamentoResponse
  > {

    return this.http.post<
      AlunoCompartilhamentoResponse
    >(
      this.apiUrl,
      request,
      {
        withCredentials: true
      }
    );
  }

}
