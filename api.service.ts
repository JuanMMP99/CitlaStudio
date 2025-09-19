import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Citas
  getCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/citas`);
  }

  addCita(cita: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/citas`, cita);
  }

  confirmCita(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/citas/${id}/confirm`, {});
  }

  deleteCita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/citas/${id}`);
  }

  // Dinamicas
  getDinamicas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dinamicas`);
  }

  addDinamica(dinamica: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dinamicas`, dinamica);
  }

  deleteDinamica(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/dinamicas/${id}`);
  }
}