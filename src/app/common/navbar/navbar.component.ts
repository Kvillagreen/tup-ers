import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, OnDestroy, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../environments/environment';
import { DevToolsDetectorService } from '../../services/dev-tools-detector.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Fix typo from `styleUrl` to `styleUrls`
})
export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy, DoCheck {
  settingsDropdown: boolean = false;
  isSideBarHidden: boolean = false;
  urlVerifier: boolean = false;
  program: string = '';
  fullName: string = '';
  tupvId: string = '';
  isLoggedIn: boolean = false;
  autoLogout: boolean = false;
  email: string = '';
  facultyProgram: string = '';
  facultyFullName: string = '';
  facultyEmail: string = '';
  facultyType: string = '';
  facultyStatus: string = '';
  userType: string = '';
  extras = Extras;
  @ViewChild('dropDown') dropDown!: ElementRef;
  @ViewChild('sideBar') sideBar!: ElementRef;

  private lastActivityTime: number = Date.now();
  private timeoutInterval: any;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private cookieService: CookieService,
    private devToolsDetector: DevToolsDetectorService
  ) { }

  ngAfterViewInit() {
    if (this.cookieService.get('isLoggedIn') != '') {
      this.setupUserActivityTracking();
      this.timeoutInterval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - this.lastActivityTime > 5 * 60 * 1000) {
          this.userInactive();
        }
      }, 10000);

      /*this.devToolsDetector.detectDevTools((isOpen: boolean) => {
        if (isOpen) {
          this.logout();
        }
      });
*/
    }


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

  ngOnDestroy(): void {
    // Cleanup the interval when the component is destroyed
    clearInterval(this.timeoutInterval);
  }

  private setupUserActivityTracking(): void {
    document.addEventListener('mousemove', this.resetActivityTimer.bind(this));
    document.addEventListener('keydown', this.resetActivityTimer.bind(this));
    document.addEventListener('focus', this.resetActivityTimer.bind(this));
    document.addEventListener('click', this.resetActivityTimer.bind(this));
  }

  private resetActivityTimer(): void {
    this.lastActivityTime = Date.now();
  }

  private userInactive(): void {
    if (this.cookieService.get('tokenId') || this.cookieService.get('facultyTokenId')) {
      this.extras.isError('Logout automatically due to inactivity within 5 minutes.')
      this.logout();
      this.autoLogout = true;
      this.lastActivityTime = Date.now();
    }
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
    if (this.userType == 'student') {
      this.cookieService.delete('tupvId');
      this.cookieService.delete('studentId');
      this.cookieService.delete('firstName');
      this.cookieService.delete('lastName');
      this.cookieService.delete('email');
      this.cookieService.delete('studentId');
      this.cookieService.delete('program');
      this.cookieService.delete('tokenId');
      this.cookieService.delete('dateCreated');
      this.cookieService.delete('isLoggedIn');
      this.cookieService.delete('userType');
      this.cookieService.delete('units');
      this.router.navigate(['/login']);
    } else {
      this.cookieService.delete('facultyId');
      this.cookieService.delete('facultyType');
      this.cookieService.delete('facultyFirstName');
      this.cookieService.delete('facultyLastName');
      this.cookieService.delete('facultyEmail');
      this.cookieService.delete('facultyStatus');
      this.cookieService.delete('facultyProgram');
      this.cookieService.delete('facultyTokenId');
      this.cookieService.delete('facultyDateCreated');
      this.cookieService.delete('facultyIsLoggedIn');
      this.cookieService.delete('userType');
      this.cookieService.delete('units');
      this.router.navigate(['/faculty/login']);
    }
  }
}
