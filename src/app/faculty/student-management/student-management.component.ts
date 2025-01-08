import { Component, OnInit } from '@angular/core';
import { restrictService } from '../../common/libraries/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-management',
  imports: [CommonModule],
  templateUrl: './student-management.component.html',
  styleUrl: './student-management.component.css'
})
export class StudentManagementComponent implements OnInit {
  constructor(private restrict: restrictService){}
  ngOnInit(): void {
    this.restrict.isAdmin();
  }
}
