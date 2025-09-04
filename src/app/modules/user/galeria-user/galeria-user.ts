import { Component } from '@angular/core';

@Component({
  selector: 'app-galeria-user',
  imports: [],
  templateUrl: './galeria-user.html',
  styleUrl: './galeria-user.css'
})
export class GaleriaUser {
  // Función para desplazamiento suave
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }
}
