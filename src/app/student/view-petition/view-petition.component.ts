import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
@Component({
  selector: 'app-view-petition',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './view-petition.component.html',
  styleUrl: './view-petition.component.css'
})
export class ViewPetitionComponent implements OnInit, AfterViewInit {
  isApply: boolean = false;
  isAddPetition: boolean = false;
  program: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  subjectUnits: string = '';
  tupvId: string = '';
  fullName: string = '';
  isFail: string = '';
  isFourthYear: string = '';
  studentId: string = '';
  classId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
  successText: string = '';
  constructor(private studentService: StudentService, private renderer: Renderer2, private cookieService: CookieService, private cdr: ChangeDetectorRef) { }
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

  fetchClass() {
    const tokenId = this.cookieService.get('tokenId') ?? '';
    this.studentService.getClass(tokenId).subscribe((response: any) => {
      Extras.classList = response.data.filter((listOfClass: any) => listOfClass.program === this.program && listOfClass.status == 'pending' || listOfClass.status == 'approved');
    });
  }

  loadStudentData() {
    this.fullName = this.cookieService.get('firstName') + ' ' + this.cookieService.get('lastName');
    this.tupvId = this.cookieService.get('tupvId');
    this.program = this.cookieService.get('program');
  }

  changeSuccesful() {

    this.isSuccesful = false;
    this.cookieService.set('isSuccesful', '');
    this.successText = '';
  }

  submitPetitionApplication() {
    Extras.load = true;
    const studentId = this.cookieService.get('studentId');
    this.studentService.petitionApplicatipon(studentId, this.classId).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success) {
          this.isSuccesful = true;
          this.cookieService.set('isSuccesful', 'true');
          this.successText = 'You have successfully applied your petition';
          this.cookieService.set('successText', this.successText);
          window.location.reload();
        } else {
          Extras.isError(response.message.toString());
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.errorMessage = "Error in parsing";
      },
    });
  }

  submitCreatePetition() {
    Extras.load = true;
    const studentId = this.cookieService.get('studentId');
    const program = this.cookieService.get('program');
    this.studentService.petitionCreation(studentId, this.subjectCode, this.subjectName, this.subjectUnits, program).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success) {
          this.isSuccesful = true;
          this.cookieService.set('isSuccesful', 'true');
          this.successText = 'You have successfully submitted your petition';
          this.cookieService.set('successText', this.successText);
          window.location.reload();
        } else {
          Extras.isError(response.message.toString());
        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.errorMessage = "Error in parsing";
      },
    });
  }

  saveData() {
    this.subjectName = Subjects.getSubjectsName(this.program, this.subjectCode);
    this.subjectUnits = Subjects.getSubjectsUnits(this.program, this.subjectCode).toString();
  }

  ngOnInit(): void {

    if (this.cookieService.get('isSuccesful') == 'true') {
      this.isSuccesful = true;
    }
    this.successText = this.cookieService.get('successText') ?? '';
    this.fetchClass();
    this.loadStudentData();
    Extras.searchText = '';
    Extras.isFilterOn = false;
  }
}