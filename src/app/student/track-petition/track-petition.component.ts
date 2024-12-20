import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-track-petition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-petition.component.html',
  styleUrl: './track-petition.component.css'
})
export class TrackPetitionComponent {
  isLocate: boolean = false;
}
