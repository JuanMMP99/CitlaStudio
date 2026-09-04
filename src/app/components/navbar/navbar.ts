import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @ViewChild('mobileMenu') mobileMenu!: ElementRef<HTMLDivElement>;

  toggleMenu(): void {
    if (this.mobileMenu) {
      this.mobileMenu.nativeElement.classList.toggle('hidden');
    }
  }
}