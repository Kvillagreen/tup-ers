import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';

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
  errorMessage: string = '';
  load: boolean = false;
  showPassword: boolean = false;
  constructor(private studentService: StudentService, public router: Router, private cookieService: CookieService) { }

  ngOnInit() {
  }

  formatID(tupvId: string): boolean {
    const tupvIdFormat = /^TUPV-\d{2}-\d{4}$/;
    return tupvIdFormat.test(this.tupvId);
  }
  isError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }
  onSubmit() {
    this.errorMessage = '';
    this.load = true;
    if (!this.tupvId || !this.password) {
      this.isError('All fields are required.')
      this.load = false;  // Stop loading
      return;
    }
    if (!this.formatID(this.tupvId)) {
      this.isError('Please input valid TUPV ID.')
      this.load = false;  // Stop loading
      return;
    }
    this.studentService.login(this.tupvId, this.password).subscribe({
      next: (response: any) => {
        this.load = false;
        if (response.success && response.tokenId) {
          this.cookieService.set('tupvId', response.student.tupvId, 1 / 24);
          this.cookieService.set('firsName', response.student.firstName, 1 / 24);
          this.cookieService.set('lastName', response.student.lastName, 1 / 24);
          this.cookieService.set('email', response.student.email, 1 / 24);
          this.cookieService.set('studentId', response.student.studentId, 1 / 24);
          this.cookieService.set('program', response.program, 1 / 24);
          this.cookieService.set('tokenId', response.tokenId, 1 / 24);
          this.cookieService.set('dateCreated', response.dateCreated, 1 / 24);
          this.cookieService.set('isLoggedIn', 'true', 1 /24);
          this.router.navigate(['/dashboard']);
        } else {
          this.isError(response.message)
        }
      },
      error: (error: any) => {
        this.load = false;
        this.isError(error.message)
      },
    });
  }
}
