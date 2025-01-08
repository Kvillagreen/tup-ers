import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DoCheck, OnDestroy, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Extras, NotificationService, restrictService } from '../libraries/environment';
import { DevToolsDetectorService } from '../../services/dev-tools-detector.service';
import { NotificationComponent } from '../../student/notification/notification.component';
import { dataViewer } from '../libraries/data-viewer';
import { EncryptData } from '../libraries/encrypt-data';
@Component({
  standalone: true,
  selector: 'app-navbar',
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
  runOnce: boolean = false;
  runOnceRecurssive: boolean = false;
  dataViewer = dataViewer;
  dataNotLoad: any = [{
    'timer': 0,
    'timerActive': false,
  }]
  @ViewChild('dropDown') dropDown!: ElementRef;
  @ViewChild('sideBar') sideBar!: ElementRef;

  private lastActivityTime: number = Date.now();
  private timeoutInterval: any;
  private notificationInterval: any;


  constructor(
    private router: Router,
    private renderer: Renderer2,
    private devToolsDetector: DevToolsDetectorService,
    public restrictService: restrictService,
    private notificationService: NotificationService,
    private encryptData: EncryptData,
  ) { }

  ngAfterViewInit() {

    const dataFaculty = this.encryptData.decryptData('faculty') ?? '';
    const dataStudent = this.encryptData.decryptData('faculty') ?? '';


    if (dataStudent.isLoggedIn || dataFaculty.facultyIsLoggedIn) {
      this.setupUserActivityTracking();
      this.timeoutInterval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - this.lastActivityTime > 5 * 60 * 1000) {
          this.userInactive();
        } else {
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
  }

  ngOnInit(): void {
    let data: any = []
    data = this.encryptData.decryptData('web') ?? '';
    if (!data) {
      this.encryptData.encryptAndStoreData('web', this.dataNotLoad);
    }
    
    this.notificationService.fetchNotification();
    const dataStudent = this.encryptData.decryptData('faculty') ?? '';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.urlChecker();
      }
    });
    this.loadUserData();


    if (dataStudent.isLoggedIn == 'true' && dataStudent.userType == 'student') {
      if (!this.runOnce) {
        this.runOnce = true;
        this.notificationService.fetchNotification();
      }
      this.notificationInterval = setInterval(() => {
        this.notificationService.fetchNotification();
      }, 15000);
    }
  }

  toggleDropdown(state: boolean): void {
    this.isSideBarHidden = state;
    console.log(this.isSideBarHidden) // Open or close dropdown based on hover state
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


    const dataFaculty = this.encryptData.decryptData('faculty') ?? '';
    const dataStudent = this.encryptData.decryptData('faculty') ?? '';
    if (dataStudent.tokenId || dataFaculty.tokenId) {
      this.extras.isError('Logout automatically due to inactivity within 5 minutes.')
      this.logout();
      this.autoLogout = true;
      this.lastActivityTime = Date.now();
    }
  }
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  private loadUserData(): void {

    const dataFaculty = this.encryptData.decryptData('faculty') ?? '';
    const dataStudent = this.encryptData.decryptData('student') ?? '';


    if (dataStudent.userType == 'student' && dataStudent.isLoggedIn == true) {
      this.userType = dataStudent.userType;
      this.tupvId = dataStudent.tupvId;
      this.fullName = `${dataStudent.firstName}` + ' ' + `${dataStudent.lastName}`;
      this.email = dataStudent.email;
      this.program = dataStudent.program;
    }

    if (dataFaculty.userType == 'faculty' && dataFaculty.facultyIsLoggedIn == true) {
      this.userType = dataFaculty.userType;
      this.facultyFullName = `${dataFaculty.firstName}` + ' ' + `${dataFaculty.lastName}`;
      this.facultyEmail = dataFaculty.email;
      this.facultyType = dataFaculty.facultyType;
      this.facultyStatus = dataFaculty.status;
      this.facultyProgram = dataFaculty.program;
    }
  }

  checkLength() {
    return dataViewer.getNotificationList('unread').length
  }

  urlChecker() {
    this.urlVerifier = this.router.url.startsWith('/login') || this.router.url.startsWith('/signup') || this.router.url.startsWith('/faculty/signup') || this.router.url.startsWith('/faculty/login') || this.router.url.includes('forget-password');
  }

  logout() {
    this.isSideBarHidden = false;
    this.settingsDropdown = false;
    if (this.userType == 'student') {
      this.encryptData.logoutDelete('student')
      this.router.navigate(['/login']);
    } else {
      this.encryptData.logoutDelete('faculty')
      this.router.navigate(['/faculty/login']);
    }
  }
}
