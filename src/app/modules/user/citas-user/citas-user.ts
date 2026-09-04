import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService, HorarioSlot, Servicio } from '../../../services/backend.service';

@Component({
  selector: 'app-citas-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './citas-user.html',
  styleUrls: ['./citas-user.css']
})
export class CitasUser implements OnInit {
  appointmentForm!: FormGroup;
  selectedDate: Date | null = null;
  daysInMonth: { day: number; date: Date; isPast: boolean }[] = [];

  // Variables para la navegación de meses
  currentMonthDate: Date = new Date(); // Controla el mes que se está visualizando
  monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  emptyStartDays: number[] = []; // Para alinear el primer día con el día de la semana correcto

  servicios: Servicio[] = [];
  horarios: HorarioSlot[] = [];

  cargandoServicios = false;
  cargandoHorarios = false;
  enviando = false;

  mensajeExito = '';
  erroresBackend: string[] = [];

  constructor(private fb: FormBuilder, private backend: BackendService) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.maxLength(10)]],
      correo: ['', [Validators.required, Validators.email]],
      servicio: ['', Validators.required],
      hora: ['', Validators.required],
      notas: ['']
    });

    this.generateCalendar();
    this.cargarServicios();
  }

  validateNumber(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    this.backend.getServicios().subscribe({
      next: (res) => {
        this.servicios = res.servicios || [];
        this.cargandoServicios = false;
      },
      error: () => {
        this.cargandoServicios = false;
      }
    });
  }

  // Generar calendario según el mes seleccionado en currentMonthDate
  generateCalendar(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar hoy a medianoche

    const year = this.currentMonthDate.getFullYear();
    const month = this.currentMonthDate.getMonth();

    // Obtener en qué día de la semana cae el primer día del mes (0 = Domingo, 1 = Lunes...)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    this.emptyStartDays = Array(firstDayOfWeek).fill(0);

    // Días totales en el mes
    const totalDays = new Date(year, month + 1, 0).getDate();

    this.daysInMonth = [];
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);

      const isPast = date < today; // Días anteriores a hoy quedan bloqueados
      this.daysInMonth.push({ day: i, date, isPast });
    }
  }

  // Navegar al mes anterior
  prevMonth(): void {
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  // Navegar al mes siguiente
  nextMonth(): void {
    this.currentMonthDate = new Date(
      this.currentMonthDate.getFullYear(),
      this.currentMonthDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  // Comprobar si la fecha dada es la misma que la seleccionada
  isSameDate(date1: Date | null, date2: Date): boolean {
    if (!date1) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  selectDate(dayObj: { day: number; date: Date; isPast: boolean }): void {
    if (dayObj.isPast) return;
    this.selectedDate = dayObj.date;
    this.appointmentForm.get('hora')?.setValue('');
    this.horarios = [];
    this.erroresBackend = [];

    this.cargandoHorarios = true;
    this.backend.getHorariosDisponibles(this.toIsoDate(dayObj.date)).subscribe({
      next: (res) => {
        this.horarios = res.horarios || [];
        this.cargandoHorarios = false;
      },
      error: () => {
        this.cargandoHorarios = false;
        this.erroresBackend = ['No se pudieron consultar los horarios. Intenta de nuevo.'];
      }
    });
  }

  onSubmitAppointment(event: Event): void {
    event.preventDefault();
    this.mensajeExito = '';
    this.erroresBackend = [];

    if (!this.appointmentForm.valid || !this.selectedDate) {
      this.appointmentForm.markAllAsTouched();
      this.erroresBackend = ['Completa todos los campos y selecciona una fecha y hora válidas.'];
      return;
    }

    const { nombre, telefono, correo, servicio, hora, notas } = this.appointmentForm.value;
    const fechaIso = this.toIsoDate(this.selectedDate);

    this.enviando = true;
    this.backend
      .crearCita({ nombre, telefono, correo, servicio, fecha: fechaIso, hora, notas })
      .subscribe({
        next: (res) => {
          this.enviando = false;
          if (res.ok) {
            this.mensajeExito = res.mensaje || 'Cita registrada correctamente.';
            this.appointmentForm.reset();
            this.selectedDate = null;
            this.horarios = [];
          } else {
            this.erroresBackend = res.errores || ['No se pudo registrar la cita.'];
            if (this.selectedDate) {
              this.selectDate({ day: this.selectedDate.getDate(), date: this.selectedDate, isPast: false });
            }
          }
        },
        error: () => {
          this.enviando = false;
          this.erroresBackend = ['Ocurrió un error de conexión. Intenta de nuevo.'];
        }
      });
  }
}