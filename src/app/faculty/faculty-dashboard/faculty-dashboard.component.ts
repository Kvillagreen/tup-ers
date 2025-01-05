import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
@Component({
  selector: 'app-faculty-dashboard',
  imports: [HttpClientTestingModule],
  templateUrl: './faculty-dashboard.component.html',
  styleUrl: './faculty-dashboard.component.css'
})
export class FacultyDashboardComponent {
  constructor(private emailService: EmailService) { }

}
