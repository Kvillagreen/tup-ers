import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';
import { Extras } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
@Component({
  selector: 'app-track-petition',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './track-petition.component.html',
  styleUrl: './track-petition.component.css'
})
export class TrackPetitionComponent implements OnInit, AfterViewInit {
  constructor(private studentService: StudentService,
    private encryptData: EncryptData,
    private renderer: Renderer2) { }
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;
  petitionId: string = '';
  dataViewer = dataViewer;
  @ViewChild('filterDownView') filterDownView!: ElementRef;

  private clickListener: (() => void) | undefined = undefined;


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



  fetchTrackPetition() {
    const data = this.encryptData.decryptData('student') ?? ''
    const tokenId = data.tokenId;
    const studentId = data.studentId;
    this.studentService.receivePetition(tokenId, studentId).subscribe((response: any) => {
      dataViewer.trackList = response.data;
    });
  }



  removePetition(petitionId: string) {
    Extras.load = true
    this.studentService.removePetition(petitionId).subscribe((response: any) => {
      Extras.load=false;
      if (response.success){
        this.isLocate= false;
        this.fetchTrackPetition()
      }
    });
  }



  ngOnInit() {
    this.fetchTrackPetition();
    dataViewer.searchText = '';
    dataViewer.pageIndex = 0;
    dataViewer.isFilterOn = false;
  }
}
