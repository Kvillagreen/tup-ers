import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PreventLoginGuard } from '../../services/prevent-login.guard';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements AfterViewInit, OnInit, DoCheck {
  settingsDropdown: boolean = false;
  urlVerifier: boolean = false;
  program: string = '';
  fullName: string = '';
  tupvId: string = '';
  email: string = '';
  @ViewChild('dropDown') dropDown!: ElementRef;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private cookieService: CookieService,
    private preventLoginGuard: PreventLoginGuard) {
  }

  ngAfterViewInit() {
    // Add a global click listener after the view is initialized
    this.renderer.listen('document', 'click', (event: any) => this.onClickOutside(event));
  }
  onClickOutside(event: MouseEvent) {
    if (this.dropDown && !this.dropDown.nativeElement.contains(event.target) && this.settingsDropdown == true) {
      this.settingsDropdown = false;
    } else {
      event.stopPropagation();
    }
  }

  urlChecker() {
    if (this.router.url.startsWith('/login') || this.router.url.startsWith('/signup')) {
      this.urlVerifier = true;
    }
    else {
      this.urlVerifier = false;
    }
  }
  ngOnInit(): void {
    this.urlChecker();
  }

  ngDoCheck(): void {
    this.urlChecker();
    this.tupvId = this.cookieService.get('tupvId');
    this.fullName = this.cookieService.get('firsName') + ' ' + this.cookieService.get('lastName');
    this.email = this.cookieService.get('email');
    this.program = this.cookieService.get('program');
  }
  logout() {
    this.cookieService.set('tupvId', '', 7);
    this.cookieService.set('firsName', '', 7);
    this.cookieService.set('lastName', '', 7);
    this.cookieService.set('email', '', 7);
    this.cookieService.set('studentId', '', 7);
    this.cookieService.set('program', '', 7);
    this.cookieService.set('tokenId', '', 7);
    this.cookieService.set('dateCreated', '', 7);
    this.cookieService.set('isLoggedIn', '', 7);
    this.router.navigate(['/login'])
  }
}
