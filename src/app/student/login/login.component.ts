import { Component, OnInit, Injectable, Inject, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { NotificationService } from '../../common/libraries/environment';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {
  tupvId: string = '';
  password: string = '';
  extras = Extras;
  showPassword: boolean = false;
  rememberMe: boolean = false;
  constructor(private studentService: StudentService,
    public router: Router, private notificationService: NotificationService,
    private cookieService: CookieService,
    private encryptData: EncryptData) { }

  ngOnInit(): void {
    if (localStorage.getItem('isFacultyRemember') == 'true') {
      this.rememberMe = localStorage.getItem('isFacultyRemember') == 'true';
      this.tupvId = localStorage.getItem('tupvId') ?? ''
    }
    
    Extras.errorMessage='';
  }
  rememberMeFunction(event: boolean) {
    this.rememberMe = event
    if (this.rememberMe) {
      this.rememberMe = false;
      localStorage.setItem('isFacultyRemember', '');
      localStorage.setItem('tupvId', '')
    } else {
      this.rememberMe = true;
    }
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
          if (response.student.status != 'enable') {
            Extras.isError('Account is disable contact registrar.')
            return;
          }
          this.notificationService.fetchNotification();
          this.encryptData.encryptAndStoreData('student', response.student);
          this.router.navigate(['/dashboard']);
          window.location.reload()
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
