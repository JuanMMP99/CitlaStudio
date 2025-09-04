import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-citas-user',
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  templateUrl: './citas-user.html',
  styleUrls: ['./citas-user.css']
})
export class CitasUser implements OnInit {
  appointmentForm!: FormGroup;
  selectedDate: Date | null = null;
  daysInMonth: { day: number; date: Date; isPast: boolean }[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/), // Solo números y exactamente 10 dígitos
          Validators.maxLength(10)
        ]
      ],
      servicio: ['', Validators.required],
      hora: ['', Validators.required],
      notas: ['']
    });

    this.generateCalendar();
  }

  validateNumber(event: KeyboardEvent): void {
  const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowedKeys.includes(event.key)) return;

  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
}

  // 📌 Generar calendario de este mes
  generateCalendar(): void {
    const today = new Date();
    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    this.daysInMonth = [];

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const isPast = date <= today; // hoy o antes = bloqueado
      this.daysInMonth.push({ day: i, date, isPast });
    }
  }

  // 📌 Seleccionar día válido
  selectDate(dayObj: { day: number; date: Date; isPast: boolean }): void {
    if (dayObj.isPast) return; // No permitir hoy o pasados
    this.selectedDate = dayObj.date;
  }

  // 📌 Enviar cita por WhatsApp
  onSubmitAppointment(event: Event): void {
    event.preventDefault();

    if (!this.appointmentForm.valid || !this.selectedDate) {
      alert('⚠️ Completa todos los campos y selecciona una fecha válida.');
      return;
    }

    const { nombre, telefono, servicio, hora, notas } = this.appointmentForm.value;
    const fecha = this.selectedDate.toLocaleDateString('es-MX');

const message =
  ` *Nueva cita:*\n\n` +
  ` *Nombre:* ${nombre}\n` +
  ` *Teléfono:* ${telefono}\n` +
  ` *Servicio:* ${servicio}\n` +
  ` *Fecha:* ${fecha}\n` +
  ` *Hora:* ${hora}\n` +
  ` *Notas:* ${notas || 'Ninguna'}`;
  

const whatsappUrl = `https://wa.me/529512563129?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    this.appointmentForm.reset();
    this.selectedDate = null;
  }
}
