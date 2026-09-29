import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AuditoriaResponse
} from '../models/auditoria-response';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {

  private readonly apiUrl = '/api/auditorias';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarTodos(): Observable<AuditoriaResponse[]> {

    return this.http.get<AuditoriaResponse[]>(
      this.apiUrl,
      {
        withCredentials: true,
      }
    );
  }

  buscarPorId(
    id: number
  ): Observable<AuditoriaResponse> {

    return this.http.get<AuditoriaResponse>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true,
      }
    );
  }
}
