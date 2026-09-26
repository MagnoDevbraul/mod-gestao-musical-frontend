import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard-response';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly apiUrl = '/api/dashboard/secretaria';

  constructor(private http: HttpClient) {
  }

  buscarDashboardSecretaria(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }
}
