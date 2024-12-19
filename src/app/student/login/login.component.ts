import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../common/navbar/navbar.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  constructor(public router: Router) {

  }
  ngOnInit(): void {

  }
}
