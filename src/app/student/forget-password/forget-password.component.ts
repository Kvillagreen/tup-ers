import { Component, OnInit } from '@angular/core';
import { Extras } from '../../common/environments/environment';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent implements OnInit {
  showPassword: boolean = false;
  tupvId: string = '';
  extras = Extras
  otp: string = ''; // OTP input value
  timer: number = 0; // Timer value
  timerActive: boolean = false; // Flag to check if timer is active
  timerInterval: any; // Holds the interval ID
  otpSent: boolean = false; // Flag to check if OTP is sent
  validOtpCode: string = '0';
  constructor(public router: Router, private emailService: EmailService, private cookieService: CookieService) { }

  ngOnInit(): void {
    this.validOtpCode = this.cookieService.get('validOtpCode');
    console.log(this.validOtpCode)
  }
  onSubmit() {
    Extras.load = true;
    console.log('click')
    if (!this.otp) {
      Extras.isError("OTP must not be empty");
      Extras.load = false;
      return;
    }
    if (this.otp.length != 6) {
      Extras.isError("OTP must be 6 digits only");
      Extras.load = false;
      return;
    }

    if (this.cookieService.get('validOtpCode') == this.otp.toString()) {
      Extras.isError("Temporary password was sent to your email");
      Extras.load = false;
      this.cookieService.set('otpCode','');
      return;
    } else {
      Extras.isError("Invalid OTP");
      Extras.load = false;
      return;
    }
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
      console.log('sent')
      this.emailService.studentForgetPasswordEmail(this.tupvId).subscribe({
        next: (response: any) => {
          console.log(response);
          Extras.load = false;
          if (response.success && response.otpCode) {
            this.validOtpCode = response.otpCode;
            this.cookieService.set('validOtpCode', this.validOtpCode.toString(), 3 / (24 * 60))
          } else {
            Extras.isError(response.message)
          }
        },
        error: (error: any) => {
          console.log(error)
          Extras.load = false;
          Extras.isError(error.message)
        },
      });
    }
    this.timer = 60; // Set the timer to 60 seconds
    this.timerActive = true;
    this.otpSent = true;
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        this.stopTimer();
      }
    }, 1000);

  }

  // Function to stop the timer
  stopTimer() {
    this.timerActive = false;
    clearInterval(this.timerInterval); // Clear the interval
  }

  // Function to disable the OTP input if the timer is active
  getOtpButtonText() {
    return this.timerActive ? `Resend OTP in ${this.timer}s` : 'Send OTP';
  }
}
