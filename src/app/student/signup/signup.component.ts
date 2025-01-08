import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
import { Extras, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  constructor(public router: Router, private studentService: StudentService) { } 
  programList: string[] = Object.keys(Subjects.programs);
  firstName: string = '';
  lastName: string = '';
  password: string = '';
  passwordConfirm: string = '';
  tupvId: string = '';
  email: string = '';
  program: string = '';
  tokenId: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  extras = Extras;

  ngOnInit(): void {
    
    Extras.errorMessage='';
  }

  onSubmit() {
    Extras.load = true;

    const emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.firstName || !this.lastName || !this.password || !this.passwordConfirm || !this.tupvId || !this.email || !this.program) {
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

    if (!emailPattern.test(this.email)) {
      Extras.isError("Invalid Email Format!");
      Extras.load = false;
      return;
    }

    if (!Extras.formatID(this.tupvId)) {
      Extras.isError("Please provide valid TUPV ID");
      Extras.load = false;
      return;
    }

    this.studentService.register(this.firstName, this.lastName, this.tupvId, this.email, this.password, this.program).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success && response.tokenId) {
          Extras.isError("Registration completed, you can now login your account.");
        } else {
          Extras.isError(response.message);
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.isError("Error in parsing");
      },
    });


  }
}
