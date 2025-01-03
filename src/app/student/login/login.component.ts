import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/environments/environment';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {
  tupvId: string = '';
  password: string = '';
  extras = Extras;
  showPassword: boolean = false;
  constructor(private studentService: StudentService, public router: Router, private cookieService: CookieService) { }

  ngOnInit() {
  }

  onSubmit() {
    Extras.load = true;
    if (!this.tupvId || !this.password) {
      Extras.isError('All fields are required.')
      Extras.load = false;  // Stop loading
      return;
    }

    if (!Extras.formatID(this.tupvId)) {
      Extras.isError('Please input valid TUPV ID.');
      Extras.load = false;  // Stop loading
      return;
    }
    this.studentService.login(this.tupvId, this.password).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success && response.tokenId) {
          this.cookieService.set('tupvId', response.student.tupvId, 1 / 24);
          this.cookieService.set('studentId', response.student.studentId, 1 / 24);
          this.cookieService.set('firstName', response.student.firstName, 1 / 24);
          this.cookieService.set('lastName', response.student.lastName, 1 / 24);
          this.cookieService.set('email', response.student.email, 1 / 24);
          this.cookieService.set('studentId', response.student.studentId, 1 / 24);
          this.cookieService.set('program', response.program, 1 / 24);
          this.cookieService.set('tokenId', response.tokenId, 1 / 24);
          this.cookieService.set('dateCreated', response.dateCreated, 1 / 24);
          this.cookieService.set('isLoggedIn', 'true', 1 / 24);
          this.cookieService.set('userType', 'student', 1 / 24);
          this.router.navigate(['/dashboard']);
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
