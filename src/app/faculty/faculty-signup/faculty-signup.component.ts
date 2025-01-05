import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { Extras, Subjects } from '../../common/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FacultyService } from '../../services/faculty.service';
@Component({
  selector: 'app-faculty-signup',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-signup.component.html',
  styleUrl: './faculty-signup.component.css'
})
export class FacultySignupComponent implements OnInit {

  constructor(public router: Router, private facultyService: FacultyService) { }
  facultyList: string[] = Subjects.faculty.roles;
  programList: string[] = Object.keys(Subjects.programs);
  firstName: string = '';
  lastName: string = '';
  password: string = '';
  passwordConfirm: string = '';
  email: string = '';
  program: string = '';
  faculty: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  extras = Extras;
  subjects = Subjects;


  ngOnInit(): void {
  }
  clearData() {
    this.firstName = "";
    this.lastName = "";
    this.email = "";
    this.password = "";
    this.passwordConfirm = "";
    this.faculty = "";
    this.program = "";
  }
  onSubmit() {
    Extras.load = true;
    if (this.faculty == 'Faculty Staff' || this.faculty == 'Program Head') {
      this.program = this.program
    } else {
      this.program = "STAFF";
    }
    
    if (!this.firstName || !this.lastName || !this.password || !this.passwordConfirm || !this.email || !this.program) {
      Extras.isError("All fields are required");
      Extras.load = false;
      return;
    }
    if (this.password != this.passwordConfirm) {
      Extras.isError("Passwords must be the same");
      Extras.load = false;
      return;
    }

    if (this.password.length < 8) {
      Extras.isError("Passwords must be 8 characters long");
      Extras.load = false;
      return;
    }

    if (!Extras.formatFacultyEmail(this.email)) {
      Extras.isError("Invalid Email Format!");
      Extras.load = false;
      return;
    }


    this.facultyService.register(this.firstName, this.lastName, this.email, this.password, this.faculty, this.program).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success ) {
          this.clearData();
          Extras.isError("Registration completed, you can now login your account.");
        } else {
          Extras.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.isError("Error in parsing");
      },
    });


  }

}
