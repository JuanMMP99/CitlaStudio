import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Cita {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}

interface Dinamica {
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

  constructor() { }

  ngOnInit(): void {
    // Cargar datos iniciales si es necesario
  }

  showAdminTab(tabId: string): void {
    this.activeTab = tabId;
  }

  confirmCita(index: number): void {
    alert(`Cita de ${this.citas[index].name} confirmada`);
    // Aquí puedes agregar lógica adicional para cambiar el estado de la cita
  }

  deleteCita(index: number): void {
    this.citas.splice(index, 1);
  }

  onManualAppointmentSubmit(): void {
    // Agregar la nueva cita
    this.citas.push({...this.newCita});
    
    // Resetear el formulario
    this.newCita = {
      name: '',
      phone: '',
      service: '',
      date: '',
      time: ''
    };
    
    alert('Cita agregada con éxito');
  }

  deleteDinamica(index: number): void {
    this.dinamicas.splice(index, 1);
  }

  onDinamicaSubmit(): void {
    // Agregar la nueva dinámica
    this.dinamicas.push({...this.newDinamica});
    
    // Resetear el formulario
    this.newDinamica = {
      title: '',
      description: '',
      type: ''
    };
    
    alert('Dinámica agregada con éxito');
  }
}