import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';


export interface LoginResponse {
  mensagem: string;
}


export interface SessaoResponse {
  usuarioId: number;
  nome: string;
  email: string;
  perfil: string;
  online: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly apiUrl =
    '/api/auth';


  constructor(
    private readonly http: HttpClient
  ) {
  }


  login(
    email: string,
    senha: string
  ): Observable<LoginResponse> {

    const body =
      new HttpParams()
        .set(
          'email',
          email
        )
        .set(
          'senha',
          senha
        );


    const headers =
      new HttpHeaders({
        'Content-Type':
          'application/x-www-form-urlencoded',
      });


    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      body.toString(),
      {
        headers,
        withCredentials: true,
      },
    );
  }


  logout(): Observable<unknown> {

    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }


  sessao(): Observable<SessaoResponse> {

    return this.http.get<SessaoResponse>(
      `${this.apiUrl}/sessao`,
      {
        withCredentials: true,
      },
    );
  }

}
