import { Routes } from '@angular/router';
import { HomeUser } from './modules/user/home-user/home-user';
import { ServiciosUser } from './modules/user/servicios-user/servicios-user';
import { GaleriaUser } from './modules/user/galeria-user/galeria-user';
import { CitasUser } from './modules/user/citas-user/citas-user';
import { ContactanosUser } from './modules/user/contactanos-user/contactanos-user';
import { DinamicasUser } from './modules/user/dinamicas-user/dinamicas-user';
import { VisitanosUser } from './modules/user/visitanos-user/visitanos-user';

// NOTA: el panel de administración ya NO vive en Angular.
// Ahora se administra desde Apps Script en:
//   https://script.google.com/macros/s/TU_ID_DE_DESPLIEGUE/exec?page=admin
// Por eso se eliminaron las rutas 'inicioAdmin' y el módulo modules/admin.

export const routes: Routes = [
  { path: '', component: HomeUser },
  { path: 'inicio', component: HomeUser },

  // rutas para usuarios
  { path: 'servicios', component: ServiciosUser },
  { path: 'galeria', component: GaleriaUser },
  { path: 'agendar-cita', component: CitasUser },
  { path: 'contactanos', component: ContactanosUser },
  { path: 'dinamicas', component: DinamicasUser },
  { path: 'visitanos', component: VisitanosUser },

  { path: '**', redirectTo: '' }
];