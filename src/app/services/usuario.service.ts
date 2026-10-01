import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  UsuarioResponse
} from '../models/usuario-response';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly apiUrl =
    '/api/usuarios';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarTodos():
    Observable<UsuarioResponse[]> {

    return this.http.get<UsuarioResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }

  alterarAtivo(
    id: number,
    ativo: boolean
  ): Observable<UsuarioResponse> {

    return this.http.patch<UsuarioResponse>(
      `${this.apiUrl}/${id}/ativo`,
      {
        ativo
      },
      {
        withCredentials: true
      }
    );
  }

  alterarPerfil(
    id: number,
    perfilUsuarioId: number
  ): Observable<UsuarioResponse> {

    return this.http.patch<UsuarioResponse>(
      `${this.apiUrl}/${id}/perfil`,
      {
        perfilUsuarioId
      },
      {
        withCredentials: true
      }
    );
  }
}
