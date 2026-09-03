import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api-config';

export interface Servicio {
  id: number;
  nombre: string;
  duracion: number;
}

export interface Dinamica {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
}

export interface HorarioSlot {
  hora: string;
  disponible: boolean;
}

export interface CitaPayload {
  nombre: string;
  telefono: string;
  correo: string;
  servicio: string;
  fecha: string; // yyyy-MM-dd
  hora: string;  // HH:mm
  notas?: string;
}

export interface MensajePayload {
  nombre: string;
  correo: string;
  asunto?: string;
  mensaje: string;
}

export interface ApiResult {
  ok: boolean;
  id?: number;
  mensaje?: string;
  errores?: string[];
}

/**
 * Cliente para la API de Google Apps Script.
 *
 * IMPORTANTE sobre CORS: los GET van como querystring normal.
 * Los POST se envían con Content-Type "text/plain" (no application/json)
 * a propósito: así el navegador los trata como "solicitud simple" y no
 * dispara un preflight OPTIONS, que Apps Script Web Apps no responde bien.
 * Code.gs igual hace JSON.parse(e.postData.contents) sin problema.
 */
@Injectable({ providedIn: 'root' })
export class BackendService {
  private readonly baseUrl = API_URL;

  constructor(private http: HttpClient) {}

  private get<T>(action: string, extraParams: Record<string, string> = {}): Observable<T> {
    let params = new HttpParams().set('action', action);
    Object.keys(extraParams).forEach((key) => {
      params = params.set(key, extraParams[key]);
    });
    return this.http.get<T>(this.baseUrl, { params });
  }

  private post<T>(action: string, data: unknown): Observable<T> {
    const body = JSON.stringify({ action, data });
    return this.http.post<T>(this.baseUrl, body, {
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
  }

  getServicios(): Observable<{ ok: boolean; servicios: Servicio[] }> {
    return this.get('getServicios');
  }

  getDinamicas(): Observable<{ ok: boolean; dinamicas: Dinamica[] }> {
    return this.get('getDinamicas');
  }

  getHorariosDisponibles(fecha: string): Observable<{ ok: boolean; horarios: HorarioSlot[] }> {
    return this.get('getHorariosDisponibles', { fecha });
  }

  crearCita(data: CitaPayload): Observable<ApiResult> {
    return this.post('crearCita', data);
  }

  enviarMensaje(data: MensajePayload): Observable<ApiResult> {
    return this.post('enviarMensaje', data);
  }
}