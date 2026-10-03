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
  ComumResponse
} from '../models/comum-response';


@Injectable({
  providedIn: 'root'
})
export class ComumService {

  private readonly apiUrl =
    '/api/comuns';


  constructor(
    private readonly http:
    HttpClient
  ) {
  }


  listar():
    Observable<ComumResponse[]> {

    return this.http.get<
      ComumResponse[]
    >(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }


  buscarPorId(
    id: number
  ): Observable<ComumResponse> {

    return this.http.get<
      ComumResponse
    >(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }

}
