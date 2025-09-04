import { Routes } from '@angular/router';
import { HomeUser } from './modules/user/home-user/home-user';
import { HomeAdmin } from './modules/admin/home-admin/home-admin';
import { ServiciosUser } from './modules/user/servicios-user/servicios-user';
import { GaleriaUser } from './modules/user/galeria-user/galeria-user';
import { CitasUser } from './modules/user/citas-user/citas-user';
import { ContactanosUser } from './modules/user/contactanos-user/contactanos-user';

export const routes: Routes = [
{ path: '', component: HomeUser},
{ path: 'inicio', component: HomeUser},
{ path: 'inicioAdmin', component: HomeAdmin},
// rutas para usuarios
{ path: 'servicios', component: ServiciosUser},
{ path: 'galeria', component: GaleriaUser},
{ path: 'agendar-cita', component: CitasUser},
{ path: 'contactanos', component: ContactanosUser},

{ path: '**', redirectTo: '' }   
];
