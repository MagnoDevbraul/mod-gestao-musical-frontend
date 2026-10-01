import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PerfilUsuarioResponse
} from '../models/perfil-usuario-response';

@Injectable({
  providedIn: 'root'
})
export class PerfilUsuarioService {

  private readonly apiUrl =
    '/api/perfis-usuarios';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarTodos():
    Observable<PerfilUsuarioResponse[]> {

    return this.http.get<PerfilUsuarioResponse[]>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }
}
