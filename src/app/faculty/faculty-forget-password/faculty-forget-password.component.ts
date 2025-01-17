
import { Component, OnInit, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { Extras } from '../../common/libraries/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StudentService } from '../../services/student.service';
import { addMinutes, parse, isBefore } from 'date-fns';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { FacultyService } from '../../services/faculty.service';

@Component({
  selector: 'app-faculty-forget-password',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-forget-password.component.html',
  styleUrl: './faculty-forget-password.component.css'
})
export class FacultyForgetPasswordComponent  implements OnInit {
  showPassword: boolean = false;
  email: string = '';
  extras = Extras
  otp: string = '';
  timer: number = 60;
  timerActive: boolean = false;
  timerInterval: any;
  dataNotLoad: any = [{
    'timer': 0,
    'timerActive': false,
  }]
  constructor(public router: Router,
    private emailService: EmailService,
    private cdRef: ChangeDetectorRef,
    private facultyService: FacultyService,
    private encryptData: EncryptData
  ) { }

  ngOnInit() {
    let data: any = []
    data = this.encryptData.decryptData('web') ?? '';
    this.timer = data[0].timer;
    if (data[0].timerActive) {
      this.timerActive = data[0].timerActive;
      Extras.isError('Kindly wait for timer to be finished, to be able to resend a new the code.')
      this.sendOTP();
    }
  }

  onSubmit() {
    Extras.load = true;
    if (!this.otp || !this.email) {
      Extras.isError("All fields are required");
      Extras.load = false;
      return;
    }
    if (!Extras.formatFacultyEmail(this.email)) {
      Extras.isError("Please input valid TUPV ID");
      Extras.load = false;
      return;
    }
    if (this.otp.length != 6) {
      Extras.isError("OTP must be 6 digits only");
      Extras.load = false;
      return;
    }
    this.facultyService.otpVerification(this.email).subscribe({
      next: (response: any) => {
        if (response.success) {
          const expiryTime = parse(response.time, 'hh:mm a', new Date());
          const extendedExpiryTime = addMinutes(expiryTime, 2);
          const currentTime = new Date();
          if (isBefore(currentTime, extendedExpiryTime) && response.otp == this.otp) {
            Extras.load = true;
            this.emailService.facultyTemporaryPasswordSender(this.email).subscribe({
              next: (response: any) => {
                Extras.load = false;
                Extras.isError(response.message)
              },
              error: (error: any) => {
                Extras.load = false;
                Extras.isError(error.message);
              },
            });
          } else {
            Extras.load = false;
            Extras.isError("OTP is invalid");
          }
        } else {
          Extras.load = false;
          Extras.isError("OTP is invalid");
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.isError(error.message);
      },
    });

  }

  disablerButton(): boolean {
    if (!this.email) {
      return false;
    }
    if (!Extras.formatFacultyEmail(this.email)) {
      return false;
    } 
    return true;
  }

  sendOTP() {
    if (!this.timerActive) {
      Extras.load = true;
      this.emailService.facultyForgetPasswordEmail(this.email).subscribe({
        next: (response: any) => {
          Extras.load = false;
          if (response.success && response.otpCode) {
            Extras.isError('OTP was already been sent to your email address')
          } else {
            this.stopTimer();
            Extras.isError(response.message)
          }
        },
        error: (error: any) => {
          this.stopTimer();
          console.log(error)
          Extras.load = false;
          Extras.isError(error.message)
        },
      });
    }
    this.timerActive = true;
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        const data = this.encryptData.decryptData('web') ?? '';
        data[0].timerActive = this.timerActive;
        data[0].timer = this.timer;
        this.encryptData.encryptAndStoreData('web', data);
      } else {
        this.stopTimer();
      }
    }, 1000);

  }

  stopTimer() {
    this.timer = 60;
    this.timerActive = false;
    const data = this.encryptData.decryptData('web') ?? '';
    data[0].timerActive = false;
    data[0].timer = 0;
    this.encryptData.encryptAndStoreData('web', data);
    clearInterval(this.timerInterval);
  }
}
