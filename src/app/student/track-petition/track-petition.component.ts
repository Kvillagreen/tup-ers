import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras } from '../../common/environments/environment';

@Component({
  selector: 'app-track-petition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track-petition.component.html',
  styleUrl: './track-petition.component.css'
})
export class TrackPetitionComponent implements OnInit, AfterViewInit {
  constructor(private studentService: StudentService, private cookieService: CookieService, private renderer: Renderer2) { }
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;

  @ViewChild('filterDownView') filterDownView!: ElementRef;

  private clickListener: (() => void) | undefined = undefined;


  ngAfterViewInit() {
    this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (
        this.filterDownView?.nativeElement &&
        !this.filterDownView.nativeElement.contains(event.target) &&
        Extras.isFilterOn
      ) {
        Extras.isFilterOn = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }

  fetchTrackPetition() {
    const tokenId = this.cookieService.get('tokenId') ?? '';
    const studentId = this.cookieService.get('studentId') ?? '';
    this.studentService.receivePetition(tokenId, studentId).subscribe((response: any) => {
      Extras.trackList = response.data;
    });
  }


  ngOnInit() {
    this.fetchTrackPetition();
    Extras.searchText = '';
    Extras.isFilterOn = false;
  }
}
