import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, restrictService, SharedService, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FacultyService } from '../../services/faculty.service';
import { CalendarComponent } from '../../common/calendar/calendar.component';
import { Calendar } from '../../common/libraries/environment';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { EmailService } from '../../services/email.service';
import { FacultyDashboardComponent } from '../faculty-dashboard/faculty-dashboard.component';
@Component({
  selector: 'app-faculty-view-petition',
  imports: [CommonModule, FormsModule, HttpClientTestingModule, CalendarComponent, FacultyDashboardComponent],
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
  facultyName: string = "";
  studentId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
  classSession: string = '';
  successText: string = '';
  selectedFaculty: string = '';
  selectionList: any[] = [];
  petitionListDenied: any[] = [];
  departmentList: any[] = [];
  totalHours: string = '';
  seeSched: boolean = false;
  openModal: boolean = false;
  modalType: string = "";
  data: any;
  classLocation: string = '';
  classSchedule: any;
  dataViewer = dataViewer;
  approvalWarn: boolean = false;
  toApprove: string = '';
  classStatus: string = '';
  warning: boolean = false;
  write: boolean = false;
  constructor(private facultyService: FacultyService, private emailService: EmailService,
    private renderer: Renderer2, private cookieService: CookieService, private restrictService: restrictService,
    private encryptData: EncryptData, private sharedService: SharedService
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

  setClassId() {
    this.sharedService.classId = this.toApprove;
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




  duplicatePetition(classId: string) {
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.facultyService.duplicatePetition(data.tokenId, classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.isView = false;
        this.fetchClass()
      }
    });
  }


  deleteClass(classId: string) {
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.facultyService.deleteClass(data.tokenId, classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.isView = false;
        this.fetchClass()
        this.warning = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
  selectedFacultyId(event: any) {
    this.selectedFaculty = event.target.value
  }

  classStatusChange(event: any) {
    const status = event.target.value;
    if (status == 'denied') {
      this.classStatus = 'denied';
      this.openModal = true;
      return;
    }
    else {
      Extras.load = true;
      const data = this.encryptData.decryptData('faculty') ?? ''
      this.facultyService.updateClassStatus(data.tokenId, this.modalclassId, status).subscribe((response: any) => {
        Extras.load = false;
        if (response.success) {
          this.isView = false;
          this.fetchClass()
        }
      });
    }
  }

  classTypeChange(event: any) {
    const type = event.target.value;
    Extras.load = true;
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.facultyService.updateClassType(data.tokenId, this.modalclassId, type).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.isView = false;
        this.fetchClass()
      }
    });
  }

  fetchSelection() {
    const tokenId = this.data.tokenId ?? '';
    const program = this.data.program ?? '';
    this.facultyService.fetchFacultySelection(tokenId, program).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.selectionList = response.data;
      }
    })
  }

  fetchDepartment(classId: string) {
    const tokenId = this.data.tokenId ?? '';
    this.facultyService.fetchDepartment(classId, tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response) {
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

  updateClassPetition(status: string, message: string, reasons: string) {
    const tokenId = this.data.tokenId ?? '';
    const notedBy = Extras.toTitleCaseSafe(this.data.facultyType + ' ' + this.data.program);
    Extras.load = true;
    if (status == 'denied' && (!message || !reasons)) {
      Extras.load = false;
      Extras.isError('All fields are required');
      return;
    }



    this.facultyService.updateClassPetition(tokenId, this.classId, status, message, reasons, notedBy).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.reasons = '';
        this.message = '';
        this.studentId = '';
        this.petitionId = '';
        this.openModal = false;
        this.isView = false;
        this.classStatus = '';
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
      if (response.success) {
        this.fetchClass()
        this.fetchPetition(this.classId);
      }
    });
  }


  fetchClass() {
    Extras.load = true;
    const tokenId = this.data.tokenId ?? '';
    const id = this.data.facultyId ?? '';
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
          dataViewer.classList = response.data.filter((listOfClass: any) => (listOfClass.faculty_id == id) && (listOfClass.status == 'pending') || (listOfClass.faculty_id == id) && (listOfClass.status == 'approved'));
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

  approvalHead(details: string) {
    Extras.load = true;
    const email = this.data.email ?? '';
    const tokenId = this.data.tokenId ?? '';

    this.emailService.petitionApprovalHead(email, details, this.toApprove, tokenId, this.classSession, this.selectedFaculty).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.selectedFaculty = '';
        this.approvalWarn = true;
      }
    })
  }

  approvalRegistar(details: string) {
    Extras.load = true;
    const email = this.data.email ?? '';
    const tokenId = this.data.tokenId ?? '';

    this.emailService.petitionApprovalRegistrar(email, details, this.toApprove, tokenId, this.classSession).subscribe((response: any) => {
      Extras.load = false
      if (response.success) {
        this.selectedFaculty = '';
        this.approvalWarn = true;
      }
    });
  }

  approvalGeneral(details: string) {
    Extras.load = true;
    const email = this.data.email ?? '';
    const tokenId = this.data.tokenId ?? '';

    this.emailService.petitionApprovalGeneral(email, details, this.toApprove, tokenId, this.classSession).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.approvalWarn = true;
      }
      else {
        return;
      }
    });
  }

  generalApproval() {
    // from faculty head going faculty staff
    if (this.classSchedule == '[[]]') {
      if (this.facultyType == 'Program Head') {
        //this.approval('Faculty Staff');
        this.approvalHead('Faculty Staff');
      }
      // from Faculty Staff going Faculty Head
      // Include the faculty_id to class 
      if (this.facultyType == 'Faculty Staff') {
        Extras.load = true;
        const tokenId = this.data.tokenId ?? '';
        const email = this.data.email ?? '';
        const facultyId = this.data.facultyId ?? '';
        this.emailService.petitionApprovalStaff(email, 'Program Head', this.toApprove, tokenId, this.classSession, this.calendar.calendarList, facultyId).subscribe((response: any) => {
          Extras.load = false;
          if (response.success) {
            this.isCalendarOpen = false;
            this.openModal = false;
            this.isView = false;
            this.data.totalHours = 'exit';
            this.data.calendarDays = '';
            this.data.calendarList = '';
            this.encryptData.encryptAndStoreData('faculty',this.data)
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
        this.approvalGeneral('College Dean');
      }
      if (this.facultyType == 'Faculty Staff') {
        Extras.load = true;
        const tokenId = this.data.tokenId ?? '';
        const email = this.data.email ?? '';
        const facultyId = this.data.facultyId ?? '';
        this.facultyService.updateClassSchedule(tokenId, this.toApprove, this.calendar.calendarList, facultyId).subscribe((response: any) => {
          Extras.load = false;
          if (response.success) {
            this.isCalendarOpen = false;
            this.openModal = false;
            this.isView = false;
          }
          else {
            return;
          }
        });
      }
      // from College Dean going Registrar
      if (this.facultyType == 'College Dean') {
        this.approvalGeneral('Registrar');
      }
      // from Registrar going ADAA
      if (this.facultyType == 'Registrar') {
        this.approvalGeneral('ADAA');
      }
      // from ADAA going back to student
      if (this.facultyType == 'ADAA') {
        this.approvalRegistar('Students: Approved');
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
  closeModal() {
    this.data.totalHours = 'exit';
    this.data.calendarDays = '';
    this.data.calendarList = '';
    this.encryptData.encryptAndStoreData('faculty',this.data)
    
  }
  saveTotalHours() {
    if (Number(this.totalHours) == 0) {
      Extras.isError('Total Hours is invalid.')
      return;
    }
    if (this.totalHours == 'exit') {
      this.data.totalHours = '';
      this.encryptData.encryptAndStoreData('faculty', this.data)
      this.totalHours = ''
    }
    if (!Number(this.totalHours)) {
      Extras.isError('Total Hours is invalid.')
      return;
    }
    this.data.totalHours = this.totalHours;
    this.encryptData.encryptAndStoreData('faculty', this.data)
  }


  checkNumberOfHours() {
    return Number(this.data.totalHours ?? null)
  }


  ngOnInit(): void {
    this.data = this.encryptData.decryptData('faculty');
    this.data.totalHours = '';
    if (this.data.isSuccesful == 'true') {
      this.isSuccesful = true;
    }
    this.totalHours = this.data.totalHours ?? 'exit';
    this.fetchSelection();
    this.successText = this.data.successText ?? '';
    this.loadFacultyData();
    this.fetchClass();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}