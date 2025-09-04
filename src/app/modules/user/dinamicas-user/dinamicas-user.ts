import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dinamicas-user',
  imports: [],
  templateUrl: './dinamicas-user.html',
  styleUrl: './dinamicas-user.css'
})
export class DinamicasUser {
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
