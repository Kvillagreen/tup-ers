import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit {
  settingsDropdown: boolean = false;

  @ViewChild('dropDown') dropDown!: ElementRef;

  constructor(private router: Router ,private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    // Add a global click listener after the view is initialized
    this.renderer.listen('document', 'click', (event:any) => this.onClickOutside(event));
  }
  onClickOutside(event: MouseEvent) {
    if (this.dropDown && !this.dropDown.nativeElement.contains(event.target) && this.settingsDropdown == true) {
      this.settingsDropdown = false;
    } else {
      event.stopPropagation();
    }
  }
  urlChecker() {
    if (this.router.url === '/login' || this.router.url === '/signup') {
      return false;
    }
    else {
      return true;
    }
  }
}
