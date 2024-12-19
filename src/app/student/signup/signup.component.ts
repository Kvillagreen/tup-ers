import { Component } from '@angular/core';
import {NavbarComponent} from '../../common/navbar/navbar.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
constructor(public router: Router){}
}
