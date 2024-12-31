import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { FooterComponent } from './common/footer/footer.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Extras } from './common/environments/environment';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
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
