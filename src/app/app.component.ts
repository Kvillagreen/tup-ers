import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { RouterOutlet, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { FooterComponent } from './common/footer/footer.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Extras } from './common/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DevToolsDetectorService } from './services/dev-tools-detector.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FooterComponent, HttpClientTestingModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'tup-ers';
  extras = Extras;
  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        Extras.load = true; // Show spinner
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        Extras.load = false; // Hide spinner
      }
    });
  }

  /*
  @HostListener('document:contextmenu', ['$event'])
  disableRightClick(event: MouseEvent): void {
    event.preventDefault();
  }
  @HostListener('document:keydown', ['$event'])
  disableDevTools(event: KeyboardEvent): void {
    const forbiddenKeys = ['F12', 'I', 'J', 'U'];
    if (
      (event.ctrlKey && forbiddenKeys.includes(event.key.toUpperCase())) ||
      event.key === 'F12'
    ) {
      event.preventDefault();
    }
  }
  */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const activeElement = document.activeElement as HTMLElement;
      const isInput = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'BUTTON';

      if (!isInput) {
        event.preventDefault(); // Block Tab if not in input
      }
    }
  }
  ngOnInit(): void {
    /*setInterval(() => {
      const before = new Date();
      debugger;
      const after = new Date();
      if (after.getTime() - before.getTime() > 100) {
      }
    }, 1000);
    */
  }
}
