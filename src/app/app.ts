import { Component, signal } from '@angular/core';
import { Footer } from "./components/footer/footer";
import { Navbar } from './components/navbar/navbar'
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Navbar, Footer, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CitlaStudio');
}
