import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Fix typo from `styleUrl` to `styleUrls`
})
export class NavbarComponent implements AfterViewInit, OnInit, DoCheck {
  settingsDropdown: boolean = false;
  isSideBarHidden: boolean = false;
  urlVerifier: boolean = false;
  program: string = '';
  fullName: string = '';
  tupvId: string = '';
  email: string = '';
  facultyProgram: string = '';
  facultyFullName: string = '';
  facultyEmail: string = '';
  facultyType: string = '';
  facultyStatus: string = '';
  userType: string = '';
  @ViewChild('dropDown') dropDown!: ElementRef;
  @ViewChild('sideBar') sideBar!: ElementRef;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private cookieService: CookieService
  ) { }

  ngAfterViewInit() {
    this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (!this.dropDown?.nativeElement.contains(event.target) && this.settingsDropdown) {
        this.settingsDropdown = false;
      }
      if (!this.sideBar?.nativeElement.contains(event.target) && this.isSideBarHidden) {
        this.isSideBarHidden = false;
      }
    });
  }

  ngDoCheck(): void {
    this.loadUserData();
    this.userType = this.cookieService.get('userType');
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.urlChecker();
      }
    });
  }


  private loadUserData(): void {
    if (this.userType == 'student') {
      this.tupvId = this.cookieService.get('tupvId');
      this.fullName = `${this.cookieService.get('firstName')}` + ' ' + `${this.cookieService.get('lastName')}`;
      this.email = this.cookieService.get('email');
      this.program = this.cookieService.get('program');
    }
    if (this.userType == 'faculty') {
      this.facultyFullName = `${this.cookieService.get('facultyFirstName')}` + ' ' + `${this.cookieService.get('facultyLastName')}`;
      this.facultyEmail = this.cookieService.get('facultyEmail');
      this.facultyType = this.cookieService.get('facultyType');
      this.facultyStatus = this.cookieService.get('facultyStatus');
      this.facultyProgram = this.cookieService.get('facultyProgram');
    }
  }

  urlChecker() {
    this.urlVerifier = this.router.url.startsWith('/login') || this.router.url.startsWith('/signup') || this.router.url.startsWith('/faculty/signup') || this.router.url.startsWith('/faculty/login') || this.router.url.includes('forget-password');
  }


  logout() {
    this.isSideBarHidden = false;
    this.settingsDropdown = false;
    this.cookieService.deleteAll();
    if (this.userType == 'student') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/faculty/login']);
    }
  }
}
