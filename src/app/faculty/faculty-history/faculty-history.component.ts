
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, restrictService, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FacultyService } from '../../services/faculty.service';
import { CalendarComponent } from '../../common/calendar/calendar.component';
import { Calendar } from '../../common/libraries/environment';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
@Component({
  selector: 'app-faculty-history',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-history.component.html',
  styleUrl: './faculty-history.component.css'
})
export class FacultyHistoryComponent {
  isView: boolean = false;
  facultyProgram: string = '';
  subjectName: string = '';
  modalfacultyProgram: string = '';
  modalsubjectCode: string = '';
  modalsubjectName: string = '';
  modalsubjectUnits: string = '';
  modalclassId: string = '';
  modalStatus: string = '';
  fullName: string = '';
  classId: string = '';
  successText: string = '';
  petitionListDenied: any[] = [];
  totalHours: string = '';
  openModal: boolean = false;
  facultyType: string = '';
  data: any;
  dataViewer = dataViewer;
  constructor(private facultyService: FacultyService,
    private renderer: Renderer2, private cookieService: CookieService, private restrictService: restrictService,
    private encryptData: EncryptData
  ) { }
  extras = Extras;
  subject = Subjects;
  calendar = Calendar;

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


  fetchClass() {
    Extras.load = true;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getClass(tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success && response.data) {
        if (this.facultyType == 'Admin') {
          dataViewer.facultyClassHistoryList = response.data.filter((listOfClass: any) => listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
        if (this.facultyType == 'Program Head') {
          dataViewer.facultyClassHistoryList = response.data.filter((listOfClass: any) => listOfClass.program === this.facultyProgram && listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
        // making petition still available if Program Head approved  after approval
        if (this.facultyType == 'Faculty Staff') {
          dataViewer.classList = response.data.filter((listOfClass: any) => ((listOfClass.location != 'Program Head' && listOfClass.schedule == '[[]]') || (listOfClass.location == 'Program Head' && listOfClass.schedule != '[[]]')) && listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
        // making petition still available College Dean after approval
        if (this.facultyType == 'College Dean') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location != 'Faculty Staff' && listOfClass.location != 'Program Head')
            && listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
        // making petition still available Registrar after approval
        if (this.facultyType == 'Registrar') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location != 'Faculty Staff' && listOfClass.location != 'Program Head' && listOfClass.location != 'College Dean')
            && listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
        // making petition still available ADAA after approval
        if (this.facultyType == 'ADAA') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location == 'Students: Approved' || listOfClass.location == 'ADAA')
            && listOfClass.status == 'denied' || listOfClass.status == 'finished');
        }
      }
    });
  }


  fetchPetition(classId: string) {
    Extras.load = true;
    this.classId = classId;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getPetitionPending(tokenId, classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success && response.data) {
        dataViewer.facultyClassList = response.data;
      }
      else {
        dataViewer.facultyClassList = []
      }
    });
  }

  fetchDeniedPetition() {
    Extras.load = true;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getPetitionDenied(tokenId, this.classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.petitionListDenied = response.data;
        this.petitionListDenied = response.data.filter((petition: any) =>
          petition.status.toString() === "denied" &&
          petition.class_data?.subject_name.toString() === this.modalsubjectName.toString() &&
          petition.class_data?.subject_code.toString() === this.modalsubjectCode.toString() &&
          petition.class_data?.units.toString() === this.modalsubjectUnits.toString() &&
          petition.class_data?.program.toString() === this.modalfacultyProgram.toString()
        );
      } else {
        this.petitionListDenied = []; // Clear list if the response is not successful
      }
    });
  }




  deniedStudent(status: string) {
    return this.petitionListDenied.filter(petition => petition.status === status
      && petition.class_data.subject_name == this.modalsubjectName &&
      petition.class_data.subject_code === this.modalsubjectCode &&
      petition.class_data.units === this.modalsubjectUnits &&
      petition.class_data.program === this.modalfacultyProgram)
  }

  loadFacultyData() {
    this.fullName = this.data.firstName + ' ' + this.data.lastName;
    this.facultyProgram = this.data.program;
    this.facultyType = this.data.facultyType;
  }

  ngOnInit(): void {
    this.data = this.encryptData.decryptData('faculty');
    this.data.totalHours = '';
    this.successText = this.data.successText ?? '';
    this.loadFacultyData();
    this.fetchClass();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}