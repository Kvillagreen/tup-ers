import { Component } from '@angular/core';
import { Extras } from '../libraries/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  extras = Extras
}
