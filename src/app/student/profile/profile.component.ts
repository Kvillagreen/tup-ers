import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/environments/environment';
import { StudentService } from '../../services/student.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  tupvId: string = '';
  fullName: string = '';
  email: string = '';
  program: string = '';
  dateCreated: string = '';
  reportList: any[] = [];
  passwordError: string = '';
  passwordStrength: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isEditableEmail: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  extras = Extras;
  strengthScore: number = 1;
  isLoggedIn: boolean = false;
  constructor(private cookieService: CookieService, private router: Router, private studentService: StudentService) { }
  ngOnInit(): void {
    this.tupvId = this.cookieService.get('tupvId');
    this.fullName = this.cookieService.get('firstName') + ' ' + this.cookieService.get('lastName');
    this.email = this.cookieService.get('email');
    this.program = this.cookieService.get('program');
    this.dateCreated = this.cookieService.get('dateCreated');
    this.fetchTrackPetition();
  }

  saveEmail() {
    const emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.email)) {
      console.log(emailPattern.test(this.email))
      this.email = this.cookieService.get('email');
      Extras.isError("Invalid Email Format!");
      return false;
    }
    else {
      return true
    }
  }

  passworChecker(): boolean {
    if (this.newPassword.length <= 2 || this.confirmPassword.length <= 2) {
      this.passwordError = '';
      return true;
    }

    if (this.newPassword !== this.confirmPassword && this.confirmPassword) {
      this.passwordError = 'Password is not the same!';
      return false;
    }
    else {
      this.passwordError = '';
      return true
    }
  }

  strengthChecker(password: string): number {
    // Define strength criteria
    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCharacterCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strengthScore = 0;
    // Calculate score based on criteria
    if (lengthCriteria) strengthScore++;
    if (uppercaseCriteria) strengthScore++;
    if (lowercaseCriteria) strengthScore++;
    if (numberCriteria) strengthScore++;
    if (specialCharacterCriteria) strengthScore++;
    // Determine password strength based on the score
    return strengthScore;

  }

  updateAccountDetails() {
    Extras.load = true;
    if (this.newPassword.length > 0 || this.confirmPassword.length > 0) {
      if (this.newPassword.length < 8 || this.confirmPassword.length < 8) {
        Extras.isError("Passwords must be 8 characters long.");
        Extras.load = false;
        return;
      }

      if (this.newPassword == this.currentPassword) {
        Extras.isError("Current, and new password must not be the same.");
        Extras.load = false;
        return;
      }
      if (!this.saveEmail()) {
        Extras.isError("Invalid Email Format!");
        Extras.load = false;
        return;
      }
    }
    else {
      if (this.email == this.cookieService.get('email')) {
        Extras.isError("Current and new email must not be the same");
        Extras.load = false;
        return;
      }
      if (!this.saveEmail()) {
        Extras.isError("Invalid Email Format!");
        Extras.load = false;
        return;
      }
    }
    const tokenId = this.cookieService.get('tokenId');
    const studentId = this.cookieService.get('studentId');
    const tupvId = this.cookieService.get('tupvId');
    this.studentService.updateStudentsProfile(tupvId, studentId, tokenId, this.email, this.currentPassword, this.newPassword).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.isLoggedIn = true;
        this.cookieService.set('email', this.email, 1 / 24);
      } else {
        Extras.isError(response.message);
      }
    });
  }

  logout() {
    ['tupvId', 'firstName', 'lastName', 'email', 'studentId', 'program', 'tokenId', 'dateCreated', 'isLoggedIn']
      .forEach((key) => this.cookieService.set(key, '', 7));
    this.router.navigate(['/login']);
  }

  fetchTrackPetition() {
    const tokenId = this.cookieService.get('tokenId') ?? '';
    const studentId = this.cookieService.get('studentId') ?? '';
    this.studentService.getStudentsReport(tokenId, studentId).subscribe((response: any) => {
      this.reportList = response.data;
    });
  }
}
