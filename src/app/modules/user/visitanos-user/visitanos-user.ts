import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visitanos-user',
  imports: [],
  templateUrl: './visitanos-user.html',
  styleUrl: './visitanos-user.css'
})
export class VisitanosUser {

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
