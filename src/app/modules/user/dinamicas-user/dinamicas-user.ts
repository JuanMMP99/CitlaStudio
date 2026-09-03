import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendService, Dinamica } from '../../../services/backend.service';

@Component({
  selector: 'app-dinamicas-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dinamicas-user.html',
  styleUrl: './dinamicas-user.css'
})
export class DinamicasUser implements OnInit {
  dinamicas: Dinamica[] = [];
  cargando = true;
  error = false;

  constructor(private backend: BackendService) {}

  ngOnInit(): void {
    this.backend.getDinamicas().subscribe({
      next: (res) => {
        this.dinamicas = res.dinamicas || [];
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  iconoPorTipo(tipo: string): string {
    switch (tipo) {
      case 'rifa': return 'fa-gift';
      case 'sorteo': return 'fa-star';
      case 'descuento': return 'fa-tags';
      default: return 'fa-bullhorn';
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}