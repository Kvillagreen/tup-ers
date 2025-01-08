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
  selector: 'app-faculty-view-petition',
  imports: [CommonModule, FormsModule, HttpClientTestingModule, CalendarComponent],
  templateUrl: './faculty-view-petition.component.html',
  styleUrl: './faculty-view-petition.component.css'
})
export class FacultyViewPetitionComponent {
  isCalendarOpen: boolean = false;
  isView: boolean = false;
  facultyProgram: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  subjectUnits: string = '';
  modalfacultyProgram: string = '';
  modalsubjectCode: string = '';
  modalsubjectName: string = '';
  modalsubjectUnits: string = '';
  modalclassId: string = '';
  fullName: string = '';
  message: string = '';
  reasons: string = '';
  classId: string = '';
  petitionId: string = '';
  studentId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
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

  updateStudentPetition(petitionId: string, status: string, message: string, reasons: string, studentId: string) {
    const tokenId = this.data.tokenId ?? '';
    const notedBy = Extras.toTitleCaseSafe(this.data.facultyType + ' ' + this.data.program);
    Extras.load = true;
    if (status == 'denied' && (!message || !reasons)) {
      Extras.load = false;
      Extras.isError('All fields are required');
      return;
    }

    this.facultyService.updateStudentPetition(tokenId, this.classId, petitionId, status, message, reasons, studentId, notedBy).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.reasons = '';
        this.message = '';
        this.studentId = '';
        this.petitionId = '';
        Extras.isError('Notification was sent to student.');
        this.fetchPetition(this.classId);
        this.fetchDeniedPetition();
        this.fetchClass();
      }
    });
  }


  fetchClass() {
    Extras.load = true;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getClass(tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success && this.restrictService.isAdminViewable()) {
        dataViewer.classList = response.data
      }
      if (response.success && !this.restrictService.isAdminViewable()) {
        dataViewer.classList = response.data.filter((listOfClass: any) => listOfClass.program === this.facultyProgram && listOfClass.status == 'pending' || listOfClass.status == 'approved');
      }
    });
  }


  fetchPetition(classId: string) {
    Extras.load = true;
    this.classId = classId;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getPetitionPending(tokenId, classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
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

  saveTotalHours() {
    if (Number(this.totalHours) == 0) {
      this.data.totalHours = '0';
      this.encryptData.encryptAndStoreData('faculty', this.data)
      return;
    }
    if (!Number(this.totalHours)) {
      Extras.isError('Total Hours is invalid.')
      return;
    }
    this.data.totalHours = this.totalHours;
    this.encryptData.encryptAndStoreData('faculty', this.data)
  }

  checkNumberOfHours() {
    return Number(this.data.totalHours ?? '0')
  }

  ngOnInit(): void {
    this.data = this.encryptData.decryptData('faculty');
    this.data.totalHours = '';
    if (this.data.isSuccesful == 'true') {
      this.isSuccesful = true;
    }
    this.successText = this.data.successText ?? '';
    this.loadFacultyData();
    this.fetchClass();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}