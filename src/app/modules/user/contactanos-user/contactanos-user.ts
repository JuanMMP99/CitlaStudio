import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../../services/backend.service';

@Component({
  selector: 'app-contactanos-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contactanos-user.html',
  styleUrl: './contactanos-user.css'
})
export class ContactanosUser {
  contactForm: FormGroup;
  enviando = false;
  mensajeExito = '';
  erroresBackend: string[] = [];

  constructor(private fb: FormBuilder, private backend: BackendService) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      asunto: [''],
      mensaje: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  // Desplazamiento suave (se mantiene por si se usa en botones de esta sección)
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSubmitContact(event: Event): void {
    event.preventDefault();
    this.mensajeExito = '';
    this.erroresBackend = [];

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.erroresBackend = ['Revisa los campos marcados antes de enviar.'];
      return;
    }

    this.enviando = true;
    this.backend.enviarMensaje(this.contactForm.value).subscribe({
      next: (res) => {
        this.enviando = false;
        if (res.ok) {
          this.mensajeExito = res.mensaje || 'Mensaje enviado correctamente.';
          this.contactForm.reset();
        } else {
          this.erroresBackend = res.errores || ['No se pudo enviar el mensaje.'];
        }
      },
      error: () => {
        this.enviando = false;
        this.erroresBackend = ['Ocurrió un error de conexión. Intenta de nuevo.'];
      }
    });
  }
}