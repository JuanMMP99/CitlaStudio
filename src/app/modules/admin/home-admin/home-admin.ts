import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../../api.service';


interface Cita {
  id?: number;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  confirmed?: boolean;
}

interface Dinamica {
  id?: number;
  title: string;
  description: string;
  type: string;
}

@Component({
  selector: 'app-home-admin',
  imports: [FormsModule, CommonModule],
  templateUrl: './home-admin.html',
  styleUrls: ['./home-admin.css']
})
export class HomeAdmin implements OnInit {
  activeTab: string = 'citas';
  citas: Cita[] = [];
  dinamicas: Dinamica[] = [];
  
  newCita: Cita = {
    name: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  };
  
  newDinamica: Dinamica = {
    title: '',
    description: '',
    type: ''
  };

  private apiService = inject(ApiService);

  ngOnInit(): void {
    this.loadCitas();
    this.loadDinamicas();
  }

  loadCitas(): void {
    this.apiService.getCitas().subscribe(data => {
      this.citas = data;
    });
  }

  loadDinamicas(): void {
    this.apiService.getDinamicas().subscribe(data => {
      this.dinamicas = data;
    });
  }

  showAdminTab(tabId: string): void {
    this.activeTab = tabId;
  }

  confirmCita(cita: Cita): void {
    if (!cita.id) return;
    this.apiService.confirmCita(cita.id).subscribe(() => {
      alert(`Cita de ${cita.name} confirmada`);
      cita.confirmed = true;
    });
  }

  deleteCita(index: number): void {
    const citaId = this.citas[index].id;
    if (!citaId) return;
    this.apiService.deleteCita(citaId).subscribe(() => {
      this.citas.splice(index, 1);
      alert('Cita eliminada.');
    });
  }

  onManualAppointmentSubmit(): void {
    this.apiService.addCita(this.newCita).subscribe(citaGuardada => {
      this.citas.unshift(citaGuardada); // Agrega al inicio de la lista
      this.newCita = { name: '', phone: '', service: '', date: '', time: '' };
      alert('Cita agregada con éxito');
    });
  }

  deleteDinamica(index: number): void {
    const dinamicaId = this.dinamicas[index].id;
    if (!dinamicaId) return;
    this.apiService.deleteDinamica(dinamicaId).subscribe(() => {
      this.dinamicas.splice(index, 1);
      alert('Dinámica eliminada.');
    });
  }

  onDinamicaSubmit(): void {
    this.apiService.addDinamica(this.newDinamica).subscribe(dinamicaGuardada => {
      this.dinamicas.unshift(dinamicaGuardada); // Agrega al inicio de la lista
      this.newDinamica = { title: '', description: '', type: '' };
      alert('Dinámica agregada con éxito');
    });
  }
}