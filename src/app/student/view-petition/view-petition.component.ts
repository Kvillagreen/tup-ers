import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { EmailService } from '../../services/email.service';
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
  dataViewer = dataViewer;
  program: string = '';
  subjectCode: string = '';
  subjectName: string = '';
  subjectUnits: string = '';
  tupvId: string = '';
  fullName: string = '';
  isFail: string = '';
  faculty: string = '';
  isFourthYear: string = '';
  programList: string[] = Object.keys(Subjects.programs);
  programName: string = '';
  studentId: string = '';
  classId: string = '';
  yearSection: string = "";
  overLoad: string = "";
  isSuccesful: boolean = false;
  type: string = "";
  isNotTyped: boolean = false;
  successText: string = '';
  term: string = 'Term';
  schoolYear: string = 'School Year';
  reasons: string = '';
  years: number[] = [];
  constructor(private studentService: StudentService, private encryptData: EncryptData,
    private renderer: Renderer2, private cdr: ChangeDetectorRef, private emailService:EmailService) {
    this.extras = Extras
  }
  extras = Extras;
  subject = Subjects;

  @ViewChild('filterDownView') filterDownView!: ElementRef;

  private clickListener: (() => void) | undefined = undefined;

  userType: string = '';  // Store the current user type

  subjectCodeChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.subjectCode = input
  }
  subjectNameChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.subjectName = input
  }

  subjectUnitshange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;

    this.subjectUnits = input

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

  fetchClass() {
    const data = this.encryptData.decryptData('student') ?? ''
    this.studentService.getClass(data.tokenId).subscribe((response: any) => {
      if (response.data && response.success) {
        dataViewer.classList = response.data.filter((listOfClass: any) => listOfClass.program === this.program && listOfClass.status == 'pending' || listOfClass.status == 'approved');
      }
    });
  }


  formatYear() {
    if (this.schoolYear) {
      const date = new Date(this.schoolYear);
      this.schoolYear = date.getFullYear().toString(); // Extract only the year
    }
  }
  loadStudentData() {
    const data = this.encryptData.decryptData('student') ?? ''
    this.tupvId = data.tupvId;
    this.fullName = `${data.firstName}` + ' ' + `${data.lastName}`;
    this.program = data.program;
  }

  changeSuccesful() {
    const data = this.encryptData.decryptData('student') ?? ''
    this.isSuccesful = false;
    this.successText = '';
    data.isSuccesful = this.isSuccesful
    data.successText = this.successText
    this.encryptData.encryptAndStoreData('student', data)
  }

  submitPetitionApplication() {
    this.yearSection = Extras.toUpperCaseSafe(this.yearSection)
    this.overLoad = Extras.toUpperCaseSafe(this.overLoad)
    this.faculty = Extras.toTitleCaseSafe(this.faculty);
    if (this.isFourthYear == "" || this.isFourthYear == "no") {
      this.overLoad = 'no';
    }
    let data = this.encryptData.decryptData('student') ?? ''
    Extras.load = true;
    this.studentService.classChecker(data.studentId, data.tokenId, this.classId).subscribe({
      next: (response: any) => {
        Extras.load = false;
        console.log(response)
        if (response.duplicate) {
          this.isSuccesful = true;
          this.successText = 'You have transferred into other program, go to track petition for details. petition was not created.';
          this.isApply = false;
        } else {
          this.studentService.petitionApplicatipon(data.studentId, this.classId, this.overLoad, this.faculty, this.yearSection).subscribe({
            next: (response: any) => {
              Extras.load = false;
              if (response.success) {
                this.isSuccesful = true;
                this.successText = 'You have successfully applied your petition';
                this.isApply = false;
                this.reasons = ''
                this.fetchClass();
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
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.errorMessage = "Error in parsing";
      },
    });
  }

  submitCreatePetition() {
    let data = this.encryptData.decryptData('student') ?? ''
    Extras.load = true;
    this.subjectCode = this.subjectCode.toLocaleUpperCase();
    this.subjectName = this.subjectName.toLocaleUpperCase();
    this.yearSection = Extras.toUpperCaseSafe(this.yearSection)
    this.overLoad = Extras.toUpperCaseSafe(this.overLoad)

    if (this.term == "Term" || this.schoolYear == 'School Year') {
      Extras.isError('All fields are required');
      return;
    }
    this.faculty = Extras.toTitleCaseSafe(this.faculty);
    this.studentService.classChecker(data.studentId, data.tokenId, this.classId).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.duplicate) {
          this.isSuccesful = true;
          this.successText = 'You have transferred into other program, go to track petition for details. petition was not created.';
          this.isAddPetition = false;
        }
        else {
          if (!Number(this.subjectUnits)) {
            Extras.load = false
            Extras.isError('Units must be a valid units');
            return;
          }

          if (this.isFourthYear == "" || this.isFourthYear == "no") {
            this.overLoad = "no";
          }
          this.studentService.petitionCreation(data.studentId, this.subjectCode, this.subjectName, this.subjectUnits.toString(), this.programName, this.overLoad, this.yearSection, this.faculty, this.reasons, this.schoolYear, this.term).subscribe({
            next: (response: any) => {
              if (response.success) {
                
                this.emailService.emailNotification(this.classId, this.subjectName, this.subjectCode, this.program, data.tokenId).subscribe({
                  next:(data:any)=>{
                    console.log(this.subjectName)
                    if (data.success){
                      
                   Extras.load=false
                    }
                  }
                })
                this.isSuccesful = true;
                this.successText = 'You have successfully submitted your petition';
                this.isAddPetition = false;
                this.faculty = ''
                this.yearSection = ''
                this.overLoad = ''
                this.schoolYear = 'School Year'
                this.term = "Term"
                this.reasons = ''
                this.fetchClass();
              } else {
                Extras.isError(response.message.toString());
              }
            },
            error: (error: any) => {
              Extras.load = false;
              console.log(error)
              Extras.errorMessage = "Error in parsing";
            },
          });

        }
      },
      error: (error: any) => {
        Extras.load = false;
        Extras.errorMessage = "Error in parsing";
        console.log(error)
      },

    });
  }


  saveData() {
    this.subjectName = Subjects.getSubjectsName(this.program, this.subjectCode);
    this.subjectUnits = Subjects.getSubjectsUnits(this.program, this.subjectCode).toString();
  }

  ngOnInit(): void {
    const data = this.encryptData.decryptData('student') ?? ''
    this.isSuccesful = data.isSuccesful;
    this.successText = data.successText;
    this.fetchClass();
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2012; i--) { // Generates years from current year down to 1900
      this.years.push(i);
    }
    this.loadStudentData();
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}