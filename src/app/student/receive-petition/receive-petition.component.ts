import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, Injectable } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/libraries/environment';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-receive-petition',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './receive-petition.component.html',
  styleUrl: './receive-petition.component.css'
})
export class ReceivePetitionComponent implements OnInit, AfterViewInit {
  constructor(private studentService: StudentService, private encryptData: EncryptData,
    private cookieService: CookieService, private renderer: Renderer2) { }
  private clickListener: (() => void) | undefined = undefined;
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;
  isFilterOn: boolean = false;
  dataViewer = dataViewer;
  @ViewChild('filterDownView') filterDownView!: ElementRef;

  fetchTrackPetition() {
    const data = this.encryptData.decryptData('student') ?? ''
    const tokenId = data.tokenId;
    const studentId = data.studentId;
    this.studentService.trackPetition(tokenId, studentId).subscribe((response: any) => {
      if (response.data && response.success) {
        dataViewer.receiveList = response.data.filter((listOfTrack: any) => listOfTrack.status === 'approved');
      }
    });
  }



  ngAfterViewInit() {
    this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
      if (
        this.filterDownView?.nativeElement &&
        !this.filterDownView.nativeElement.contains(event.target) &&
        dataViewer.isFilterOn
      ) {
        dataViewer.isFilterOn = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }

  downloadForm(petitionId: string) {
    const data = this.encryptData.decryptData('student') ?? ''
    const tokenId = data.tokenId;
    const firstName = data.firstName;
    const lastName = data.lastName;
    this.studentService.downloadForm(petitionId, tokenId, firstName, lastName)
  }

  ngOnInit() {
    this.fetchTrackPetition();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}