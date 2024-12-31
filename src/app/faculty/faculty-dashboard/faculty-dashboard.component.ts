import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
@Component({
  selector: 'app-faculty-dashboard',
  imports: [],
  templateUrl: './faculty-dashboard.component.html',
  styleUrl: './faculty-dashboard.component.css'
})
export class FacultyDashboardComponent {
  constructor(private emailService: EmailService) { }

}
