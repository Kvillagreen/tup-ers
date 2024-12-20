import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../services/student.service';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  constructor(public router: Router, private studentService: StudentService) { }
  programList: string[] = ['BSME',
    'COAC',
    'BET-CHEMTECH',
    'BET-ELECTRICAL',
    'BET-ELECTRONICS',
    'BET-MECHATRONICS',
    'BET-MANUFACTURING'];
  firstName: string = '';
  lastName: string = '';
  password: string = '';
  passwordConfirm: string = '';
  tupvId: string = '';
  email: string = '';
  program: string = '';
  tokenId: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  load: boolean = false;
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
    this.load = true;
    this.errorMessage = '';

    const emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!this.firstName || !this.lastName || !this.password || !this.passwordConfirm || !this.tupvId || !this.email || !this.program) {
      this.isError("All fields are required");
      this.load = false;
      return;
    }
    if (this.password != this.passwordConfirm) {
      this.isError("Passwords must be the same");
      this.load = false;
      return;
    }

    if (this.password.length < 8) {
      this.isError("Passwords must be 8 characters long");
      this.load = false;
      return;
    }

    if (!emailPattern.test(this.email)) {
      this.isError("Invalid Email Format!");
      this.load = false;
      return;
    }

    if (!this.formatID(this.tupvId)) {
      this.isError("Please provide valid TUPV ID");
      this.load = false;
      return;
    }

    this.studentService.register(this.firstName, this.lastName, this.tupvId, this.email, this.password, this.program).subscribe({
      next: (response: any) => {
        this.load = false;
        if (response.success && response.tokenId) {
          this.errorMessage = "Registration completed, you can now login your account.";
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.load = false;
        this.isError("Error in parsing");
      },
    });


  }
}
