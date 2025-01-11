
import { CommonModule } from '@angular/common';
import { Component, OnInit, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/libraries/environment';
import { StudentService } from '../../services/student.service';
import { Route, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { FacultyService } from '../../services/faculty.service';

@Component({
  selector: 'app-faculty-profile',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-profile.component.html',
  styleUrl: './faculty-profile.component.css'
})
export class FacultyProfileComponent implements OnInit {
  tupvId: string = '';
  fullName: string = '';
  email: string = '';
  program: string = '';
  facultyType: string = '';
  dateCreated: string = '';
  reportList: any[] = [];
  password: boolean = false;
  passwordText: string = 'Password';
  isEditablePassword: boolean = false;
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

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private facultyService: FacultyService,
    private encryptData: EncryptData
  ) { }

  ngOnInit(): void {
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.tupvId = data.tupvId;
    this.fullName = data.firstName + ' ' + data.lastName;
    this.email = data.email;
    this.facultyType = data.facultyType;
    this.program = data.program;
    this.dateCreated = data.dateCreated;
  }

  saveEmail() {
    const data = this.encryptData.decryptData('faculty') ?? ''
    if (!Extras.formatFacultyEmail(this.email)) {
      this.email = data.email;
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
    const data = this.encryptData.decryptData('faculty') ?? ''
    if (this.newPassword.length > 0 && this.confirmPassword.length > 0 && this.currentPassword.length > 0) {
      // password validation checking if password is strong enough
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

      // password validation checking if email is valid and doesnt resubmit the existing one
      if (this.email == data.email) {
        Extras.load = false;
        return;
      }
      if (!this.saveEmail()) {
        Extras.isError("Invalid Email Format!");
        Extras.load = false;
        return;
      }
    }

    const tokenId = data.tokenId;
    const facultyId = data.facultyId;
    this.facultyService.updateFacultyProfile(facultyId, tokenId, this.email, this.currentPassword, this.newPassword).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.isLoggedIn = true;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        data.email = this.email;
        this.encryptData.encryptAndStoreData('student', data)
        this.isEditableEmail = false;
        this.isEditablePassword = false;
      } else {
        Extras.isError(response.message);
      }
    });

  }


  logout() {
    this.encryptData.logoutDelete('faculty');
    this.router.navigate(['/faculty/login']);
  }
}
