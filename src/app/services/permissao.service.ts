import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PermissaoResponse
} from '../models/permissao-response';

@Injectable({
  providedIn: 'root'
})
export class PermissaoService {

  private readonly apiUrl =
    '/api/permissoes';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarTodas():
    Observable<PermissaoResponse[]> {

    return this.http.get<PermissaoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }

  listarPorPerfil(
    perfilId: number
  ): Observable<PermissaoResponse[]> {

    return this.http.get<PermissaoResponse[]>(
      `${this.apiUrl}/perfil/${perfilId}`,
      {
        withCredentials: true
      }
    );
  }

  atualizarPerfil(
    perfilId: number,
    permissaoIds: number[]
  ): Observable<PermissaoResponse[]> {

    return this.http.put<PermissaoResponse[]>(
      `${this.apiUrl}/perfil/${perfilId}`,
      {
        permissaoIds
      },
      {
        withCredentials: true
      }
    );
  }
}
