import { Component, OnInit } from '@angular/core';
import { Extras } from '../../common/libraries/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { FacultyService } from '../../services/faculty.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EncryptData } from '../../common/libraries/encrypt-data';
@Component({
  standalone: true,
  selector: 'app-faculty-login',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-login.component.html',
  styleUrl: './faculty-login.component.css'
})
export class FacultyLoginComponent implements OnInit {
  showPassword: boolean = false;
  email: string = '';
  password: string = '';
  rememberMe: boolean = false

  extras = Extras
  constructor(public router: Router, private cookieService: CookieService, private encrypData: EncryptData,
    private facultyService: FacultyService) { }

  rememberMeFunction(event: boolean) {
    this.rememberMe = event
    if (this.rememberMe) {
      this.rememberMe = false;
      localStorage.setItem('isFacultyRemember', '');
      localStorage.setItem('email', '')
    } else {
      this.rememberMe = true;
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem('isFacultyRemember') == 'true') {
      this.rememberMe = localStorage.getItem('isFacultyRemember') == 'true';
      this.email = localStorage.getItem('email') ?? ''
    }
    
    Extras.errorMessage='';
  }
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
    if (this.rememberMe) {
      localStorage.setItem('isFacultyRemember', this.rememberMe.toString())
      localStorage.setItem('email', this.email.toString())
    }
    this.facultyService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success && response.tokenId) {
          this.encrypData.encryptAndStoreData('faculty', response.faculty);
          this.router.navigate(['/faculty/dashboard']);
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
