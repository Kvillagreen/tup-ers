import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/environments/environment';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
@Component({
  selector: 'app-receive-petition',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientTestingModule],
  templateUrl: './receive-petition.component.html',
  styleUrl: './receive-petition.component.css'
})
export class ReceivePetitionComponent implements OnInit, AfterViewInit {
  constructor(private studentService: StudentService, private cookieService: CookieService, private renderer: Renderer2) { }
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;
  isFilterOn: boolean = false;

  @ViewChild('filterDownView') filterDownView!: ElementRef;
  
  fetchTrackPetition() {
    const tokenId = this.cookieService.get('tokenId') ?? '';
    const studentId = this.cookieService.get('studentId') ?? '';
    this.studentService.trackPetition(tokenId, studentId).subscribe((response: any) => {
      Extras.receiveList = response.data.filter((listOfTrack: any) => listOfTrack.status === 'approved');
      console.log(Extras.receiveList)
    });
  }

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


  ngOnInit() {
    this.fetchTrackPetition();
    Extras.searchText = '';
    Extras.isFilterOn = false;
  }
}