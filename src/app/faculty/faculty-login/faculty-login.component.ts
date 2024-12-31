import { Component } from '@angular/core';
import { Extras } from '../../common/environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FacultyService } from '../../services/faculty.service';
@Component({
  selector: 'app-faculty-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './faculty-login.component.html',
  styleUrl: './faculty-login.component.css'
})
export class FacultyLoginComponent {
  showPassword: boolean = false;
  email: string = '';
  password: string = '';

  extras = Extras
  constructor(public router: Router, private cookieService: CookieService, private facultyService: FacultyService) { }
  onSubmit() {
    Extras.load = true;
    if (!this.email || !this.password) {
      Extras.isError('All fields are required.')
      Extras.load = false;  // Stop loading
      return;
    }

    if (!Extras.formatFacultyEmail(this.email)) {
      Extras.isError('Please input valid email.');
      Extras.load = false;  // Stop loading
      return;
    }

    this.facultyService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success && response.tokenId) {
          this.cookieService.set('facultyId', response.faculty.facultyId, 1 / 24);
          this.cookieService.set('facultyType', response.faculty.facultyType, 1 / 24);
          this.cookieService.set('facultyFirstName', response.faculty.firstName, 1 / 24);
          this.cookieService.set('facultyLastName', response.faculty.lastName, 1 / 24);
          this.cookieService.set('facultyEmail', response.faculty.email, 1 / 24);
          this.cookieService.set('facultyStatus', response.status, 1 / 24);
          this.cookieService.set('facultyProgram', response.program, 1 / 24);
          this.cookieService.set('facultyTokenId', response.tokenId, 1 / 24);
          this.cookieService.set('facultyDateCreated', response.dateCreated, 1 / 24);
          this.cookieService.set('facultyIsLoggedIn', 'true', 1 / 24);
          this.cookieService.set('userType', 'faculty', 1 / 24);
          this.router.navigate(['/faculty/dashboard']);
        } else {
          Extras.isError(response.message)
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.isError(error.message)
      },
    });
  }
}
