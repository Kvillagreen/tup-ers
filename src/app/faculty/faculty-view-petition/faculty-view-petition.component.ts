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
  facultyType: string = '';
  fullName: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  subjectUnits: string = '';
  modalfacultyProgram: string = '';
  modalsubjectCode: string = '';
  modalsubjectName: string = '';
  modalsubjectUnits: string = '';
  modalclassId: string = '';
  modalStatus: string = '';
  message: string = '';
  reasons: string = '';
  classId: string = '';
  petitionId: string = '';
  studentId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
  successText: string = '';
  petitionListDenied: any[] = [];
  departmentList: any[] = [];
  totalHours: string = '';
  openModal: boolean = false;
  data: any;
  classLocation: string = '';
  classSchedule: any;
  dataViewer = dataViewer;
  toApprove: string = '';
  constructor(private facultyService: FacultyService,
    private renderer: Renderer2, private cookieService: CookieService, private restrictService: restrictService,
    private encryptData: EncryptData
  ) { }
  extras = Extras;
  subject = Subjects;
  calendar = Calendar;

  // transfer student to other department in faculty head page only,
  // add block button to block class
  // add history page for all the staff
  // finish the dashboard page calendar of classes
  // create a draft of form

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

  classStatusChange(event: any) {
    Extras.load = true;
    const data = this.encryptData.decryptData('faculty') ?? ''
    const status = event.target.value;
    console.log(this.modalclassId)
    this.facultyService.updateClassStatus(data.tokenId, this.modalclassId, status).subscribe((response: any) => {
      Extras.load = false;
      console.log(response)
      if (response.success) {
        this.isView = false;
        this.fetchClass()
      }
    });
  }

  fetchDepartment(classId: string) {
    const tokenId = this.data.tokenId ?? '';
    console.log(classId)
    this.facultyService.fetchDepartment(classId, tokenId).subscribe((response: any) => {
      Extras.load = false;
      console.log(response)
      if (response.success) {
        this.departmentList = response.data
      }
    });
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


  //transfer to other program if faculty head wants to 

  statusChange(status: any, petitionId: string) {
    Extras.load = true;
    const data = this.encryptData.decryptData('faculty') ?? ''
    const classId = status.target.value;
    this.facultyService.transferFaculty(data.tokenId, classId, petitionId).subscribe((response: any) => {
      Extras.load = false;
      console.log(response)
      if (response.success) {
        this.fetchClass()
        this.fetchPetition(this.classId);
      }
    });
  }


  fetchClass() {
    Extras.load = true;
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.getClass(tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        if (this.facultyType == 'Admin') {
          dataViewer.classList = response.data.filter((listOfClass: any) => listOfClass.status == 'pending' || listOfClass.status == 'approved');
        }
        if (this.facultyType == 'Program Head') {
          dataViewer.classList = response.data.filter((listOfClass: any) => listOfClass.program === this.facultyProgram && listOfClass.status == 'pending' || listOfClass.status == 'approved');
        }
        // making petition still available if Program Head approved  after approval
        if (this.facultyType == 'Faculty Staff') {
          dataViewer.classList = response.data.filter((listOfClass: any) => ((listOfClass.location != 'Program Head' && listOfClass.schedule == '[[]]') || (listOfClass.location == 'Program Head' && listOfClass.schedule != '[[]]')) && listOfClass.status == 'pending' || listOfClass.status == 'approved');
        }
        // making petition still available College Dean after approval
        if (this.facultyType == 'College Dean') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location != 'Faculty Staff' && listOfClass.location != 'Program Head')
            && listOfClass.status == 'pending' ||
            listOfClass.status == 'approved');
        }
        // making petition still available Registrar after approval
        if (this.facultyType == 'Registrar') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location != 'Faculty Staff' && listOfClass.location != 'Program Head' && listOfClass.location != 'College Dean')
            && listOfClass.status == 'pending' ||
            listOfClass.status == 'approved');
        }
        // making petition still available ADAA after approval
        if (this.facultyType == 'ADAA') {
          dataViewer.classList = response.data.filter((listOfClass: any) =>
            (listOfClass.location == 'Students: Approved' || listOfClass.location == 'ADAA')
            && listOfClass.status == 'pending' ||
            listOfClass.status == 'approved');
        }
      }
    });
  }

  generalApproval() {
    // from faculty head going faculty staff
    if (this.classSchedule == '[[]]') {
      if (this.facultyType == 'Program Head') {
        this.approval('Faculty Staff');
      }
      // from Faculty Staff going Faculty Head
      // Include the faculty_id to class 
      if (this.facultyType == 'Faculty Staff') {
        const tokenId = this.data.tokenId ?? '';
        const facultyId = this.data.facultyId ?? '';
        this.facultyService.addSchedule(tokenId, this.toApprove, this.calendar.calendarList, facultyId).subscribe((response: any) => {
          Extras.load = false;
          if (response.success) {
            this.approval('Program Head')
            this.fetchClass();
            this.isCalendarOpen = false;
            this.openModal = false;
            this.isView = false;
          }
          else {
            return;
          }
        });
      }
    }
    else {
      // from faculty head going faculty staff
      if (this.facultyType == 'Program Head') {
        this.approval('College Dean');
      }
      // from College Dean going Registrar
      if (this.facultyType == 'College Dean') {
        this.approval('Registrar');
      }
      // from Registrar going ADAA
      if (this.facultyType == 'Registrar') {
        this.approval('ADAA');
      }
      // from ADAA going back to student
      if (this.facultyType == 'ADAA') {
        const tokenId = this.data.tokenId ?? '';
        this.facultyService.finalApprovalPetition(tokenId, this.toApprove).subscribe((response: any) => {
          Extras.load = false;
          if (response.success) {
            this.approval('Students: Approved');
            this.fetchClass();
            this.isView = false;
          }
          else {
            return;
          }
        });
      }
    }
  }

  approval(faculty: string) {
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.generalPetitionApproval(tokenId, this.toApprove, faculty).subscribe((response: any) => {
      if (response.success) {
        this.facultyService.updateTrackerPetitioon(tokenId, this.toApprove, faculty).subscribe((response: any) => {
          Extras.load = false;
          if (response.success) {
            this.toApprove = '';
            this.classLocation = faculty;
            this.fetchClass();
          }
          else {
            return;
          }
        });
      }
      else {
        return;
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