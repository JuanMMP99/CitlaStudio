import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../../../api.service';

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
  private apiService = inject(ApiService);

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

    const { nombre, telefono, servicio, hora } = this.appointmentForm.value;
    // Formateamos la fecha a YYYY-MM-DD para consistencia con la base de datos
    const fecha = this.selectedDate.toISOString().split('T')[0]; 

    const nuevaCita = {
      name: nombre,
      phone: telefono,
      service: servicio,
      date: fecha,
      time: hora
    };

    this.apiService.addCita(nuevaCita).subscribe(() => {
      alert('¡Cita agendada con éxito! Te contactaremos pronto para confirmar.');
      this.appointmentForm.reset();
      this.selectedDate = null;
    });
  }
}
