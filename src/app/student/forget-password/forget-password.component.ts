import { Component, OnInit, ChangeDetectorRef, AfterContentInit } from '@angular/core';
import { Extras } from '../../common/environments/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StudentService } from '../../services/student.service';
import { addMinutes, parse, isBefore } from 'date-fns';
@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent implements OnInit, AfterContentInit {
  showPassword: boolean = false;
  tupvId: string = '';
  extras = Extras
  otp: string = '';
  timer: number = 60;
  timerActive: boolean = false;
  timerInterval: any;
  constructor(public router: Router, private emailService: EmailService, private cdRef: ChangeDetectorRef, private cookieService: CookieService, private studentService: StudentService) { }


  ngAfterContentInit(): void {
  }
  ngOnInit(): void {
    this.timer = Number(this.cookieService.get('timer'));
    if (Boolean(this.cookieService.get('timerActive'))) {
      this.timerActive = true;
      Extras.isError('Kindly wait for timer to be finished, to be able to resend a new the code.')
    }
    this.sendOTP();
  }

  onSubmit() {
    Extras.load = true;
    if (!this.otp || !this.tupvId) {
      Extras.isError("All fields are required");
      Extras.load = false;
      return;
    }
    if(!Extras.formatID(this.tupvId)){
      Extras.isError("Please input valid TUPV ID");
      Extras.load = false;
      return;
    }
    
    if (this.otp.length != 6) {
      Extras.isError("OTP must be 6 digits only");
      Extras.load = false;
      return;
    }
    this.studentService.otpVerification(this.tupvId).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.success) {
          const expiryTime = parse(response.time, 'hh:mm a', new Date());
          const extendedExpiryTime = addMinutes(expiryTime, 2);
          const currentTime = new Date();
          if (isBefore(currentTime, extendedExpiryTime) && response.otp == this.otp) {
            Extras.load = true;
            this.emailService.temporaryPasswordSender(this.tupvId).subscribe({
              next: (response: any) => {
                Extras.load = false;
                Extras.isError(response.message)
              },
              error: (error: any) => {
                console.log("Request error:", error);
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
        console.log("Request error:", error);
        Extras.load = false;
        Extras.isError(error.message);
      },
    });

  }

  disablerButton(): boolean {
    if (!this.tupvId) {
      return false;
    }
    if (!Extras.formatID(this.tupvId)) {
      return false;
    }
    return true;
  }

  sendOTP() {
    if (!this.timerActive) {
      Extras.load = true;
      this.emailService.studentForgetPasswordEmail(this.tupvId).subscribe({
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
      this.cookieService.set('timer', this.timer.toString());
      this.cookieService.set('timerActive', 'true');
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.stopTimer();
      }
    }, 1000);

  }

  stopTimer() {
    this.timer = 60;
    this.timerActive = false;
    this.cookieService.set('timer', '10');
    this.cookieService.set('timerActive', 'false');
    clearInterval(this.timerInterval); // Clear the interval
  }

}
