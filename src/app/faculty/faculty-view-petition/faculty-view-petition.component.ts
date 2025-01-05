import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FacultyService } from '../../services/faculty.service';
import { CalendarComponent } from '../../common/calendar/calendar.component';
@Component({
  selector: 'app-faculty-view-petition',
  imports: [CommonModule, FormsModule, HttpClientTestingModule, CalendarComponent],
  templateUrl: './faculty-view-petition.component.html',
  styleUrl: './faculty-view-petition.component.css'
})
export class FacultyViewPetitionComponent {
  isCalendarOpen: boolean = false;
  isView: boolean = false;
  program: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  subjectUnits: string = '';
  fullName: string = '';
  message: string = '';
  reasons: string = '';
  classId: string = '';
  petitionId: string = '';
  studentId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
  successText: string = '';
  petitionList: any[] = [];
  openModal: boolean = false;
  constructor(private facultyService: FacultyService, private renderer: Renderer2, private cookieService: CookieService, private cdr: ChangeDetectorRef) { }
  extras = Extras;
  subject = Subjects;

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

  updateStudentPetition(classId: string, petitionId: string, status: string, message: string, reasons: string, studentId: string) {
    const tokenId = this.cookieService.get('facultyTokenId') ?? '';
    const notedBy = this.cookieService.get('facultyTokenId') ?? '';
    Extras.load = true;
    if (status == 'denied' && (!message || !reasons)) {
      Extras.load = false;
      Extras.isError('All fields are required');
      return;
    }

    this.facultyService.updateStudentService(tokenId, classId, petitionId, status, message, reasons, studentId, notedBy).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.reasons = '';
        this.message = '';
        this.studentId = '';
        this.petitionId = '';
        Extras.isError('Notification was sent to student.');
        this.fetchPetition(classId);
        this.fetchClass();
      }
    });
  }

  saveUnits(units: string) {
    this.cookieService.set('units', units)
  }


  fetchClass() {
    Extras.load = true;
    const tokenId = this.cookieService.get('facultyTokenId') ?? '';
    this.facultyService.getClass(tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success && this.cookieService.get('facultyType') == 'Registrar') {
        Extras.classList = response.data
      }
      if (response.success && this.cookieService.get('facultyType') != 'Registrar') {
        Extras.classList = response.data.filter((listOfClass: any) => listOfClass.program === this.program && listOfClass.status == 'pending' || listOfClass.status == 'approved');
      }
    });
  }


  fetchPetition(classId: string) {
    Extras.load = true;
    const tokenId = this.cookieService.get('facultyTokenId') ?? '';
    this.facultyService.getPetitionPending(tokenId, classId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        Extras.facultyClassList = response.data;
      }
      else {
        Extras.facultyClassList = []
      }
    });
  }

  deniedStudent(status: string) {
    return Extras.facultyClassList.filter(petition => petition.status === status)
  }

  loadFacultyData() {
    this.fullName = this.cookieService.get('firstName') + ' ' + this.cookieService.get('lastName');
    this.program = this.cookieService.get('facultyProgram');
    this.program = this.cookieService.get('facultyProgram');
  }



  ngOnInit(): void {

    if (this.cookieService.get('isSuccesful') == 'true') {
      this.isSuccesful = true;
    }
    this.successText = this.cookieService.get('successText') ?? '';
    this.loadFacultyData();
    this.fetchClass();
    Extras.searchText = '';
    Extras.isFilterOn = false;
  }
}