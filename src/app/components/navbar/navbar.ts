import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true, // si usas standalone components
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  mobileMenuOpen = false;

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
