import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  RelatorioMensalResponse
} from '../models/relatorio-mensal-response';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  private readonly apiUrl =
    '/api/relatorios/mensais';

  constructor(
    private readonly http: HttpClient
  ) {
  }

  buscar(
    ano: number,
    mes: number
  ): Observable<RelatorioMensalResponse> {

    return this.http.get<RelatorioMensalResponse>(
      `${this.apiUrl}/${ano}/${mes}`,
      {
        withCredentials: true
      }
    );
  }

  gerar(
    ano: number,
    mes: number
  ): Observable<RelatorioMensalResponse> {

    return this.http.post<RelatorioMensalResponse>(
      `${this.apiUrl}/${ano}/${mes}`,
      {},
      {
        withCredentials: true
      }
    );
  }
}
