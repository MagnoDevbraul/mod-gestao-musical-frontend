import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  NotificacaoResponse
} from '../models/notificacao-response';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {

  private readonly apiUrl = '/api/notificacoes';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  listarTodos(): Observable<NotificacaoResponse[]> {

    return this.http.get<NotificacaoResponse[]>(
      this.apiUrl,
      {
        withCredentials: true,
      }
    );
  }

  buscarPorId(
    id: number
  ): Observable<NotificacaoResponse> {

    return this.http.get<NotificacaoResponse>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true,
      }
    );
  }

  marcarComoLida(
    id: number
  ): Observable<NotificacaoResponse> {

    return this.http.patch<NotificacaoResponse>(
      `${this.apiUrl}/${id}/marcar-lida`,
      {},
      {
        withCredentials: true,
      }
    );
  }
}
