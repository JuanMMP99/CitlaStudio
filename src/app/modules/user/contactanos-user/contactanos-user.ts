import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contactanos-user',
  imports: [],
  templateUrl: './contactanos-user.html',
  styleUrl: './contactanos-user.css'
})
export class ContactanosUser implements OnInit {
  selectedDate: Date | null = null;
  activeTab: string = 'citas-pendientes';

  constructor() { }

  ngOnInit(): void {
    this.generateCalendar();
  }

  // Función para desplazamiento suave
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  // Función para mostrar pestañas en el panel admin
  showTab(tabId: string, event: Event): void {
    // Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('hidden');
    });
    
    // Mostrar la pestaña seleccionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.remove('hidden');
    }
    
    // Actualizar botones activos
    document.querySelectorAll('#admin button').forEach(btn => {
      btn.classList.remove('bg-purple-600', 'text-white');
      btn.classList.add('bg-purple-200', 'text-purple-800');
    });
    
    // Actualizar el botón clickeado
    const target = event.target as HTMLElement;
    target.classList.remove('bg-purple-200', 'text-purple-800');
    target.classList.add('bg-purple-600', 'text-white');
    
    // Actualizar estado activo
    this.activeTab = tabId;
  }

  // Generar calendario simple
  generateCalendar(): void {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    let calendarHTML = '<div class="grid grid-cols-7 gap-2">';
    
    // Días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    weekdays.forEach(day => {
      calendarHTML += `<div class="text-center font-semibold text-purple-800 py-2">${day}</div>`;
    });
    
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      calendarHTML += `
        <div class="calendar-day text-center p-2 rounded-lg border border-transparent ${
          isPast ? 'text-gray-400' : 
          isWeekend ? 'text-purple-600' : 'text-gray-800'
        } ${isPast ? '' : 'hover:bg-purple-200 cursor-pointer'}" 
        onclick="${isPast ? '' : 'this.componentRef.selectDate(this)'}">
          ${i}
        </div>
      `;
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
    
    // Asignar referencia al componente para que pueda ser accedida desde el HTML
    (window as any).componentRef = this;
  }

  selectDate(element: HTMLElement): void {
    // Quitar selección anterior
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
      day.classList.remove('selected', 'bg-purple-600', 'text-white');
      day.classList.add('border-transparent');
    });
    
    // Seleccionar nuevo día
    element.classList.add('selected', 'bg-purple-600', 'text-white');
    element.classList.remove('border-transparent');
    
    // Guardar fecha seleccionada
    const day = parseInt(element.textContent || '0');
    const today = new Date();
    this.selectedDate = new Date(today.getFullYear(), today.getMonth(), day);
  }

  // Manejar envío del formulario
  onSubmitAppointment(event: Event): void {
    event.preventDefault();
    alert('¡Cita agendada con éxito! Te contactaremos pronto para confirmar.');
    
    // Resetear formulario
    const form = event.target as HTMLFormElement;
    form.reset();
    
    // Resetear fecha seleccionada
    this.selectedDate = null;
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
      day.classList.remove('selected', 'bg-purple-600', 'text-white');
      day.classList.add('border-transparent');
    });
  }

  // Manejar envío del formulario de contacto
  onSubmitContact(event: Event): void {
    event.preventDefault();
    alert('¡Mensaje enviado con éxito! Te responderemos pronto.');
    
    // Resetear formulario
    const form = event.target as HTMLFormElement;
    form.reset();
  }
}
