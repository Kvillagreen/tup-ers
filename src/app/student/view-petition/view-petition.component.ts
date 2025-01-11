import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
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
  isFourthYear: string = '';
  studentId: string = '';
  classId: string = '';
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
  successText: string = '';
  constructor(private studentService: StudentService, private encryptData: EncryptData,
    private renderer: Renderer2, private cdr: ChangeDetectorRef) {
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
          this.studentService.petitionApplicatipon(data.studentId, this.classId).subscribe({
            next: (response: any) => {
              Extras.load = false;
              if (response.success) {
                this.isSuccesful = true;
                this.successText = 'You have successfully applied your petition';
                this.isApply = false;
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
          this.studentService.petitionCreation(data.studentId, this.subjectCode, this.subjectName, this.subjectUnits.toString(), data.program).subscribe({
            next: (response: any) => {
              Extras.load = false;
              if (response.success) {
                this.isSuccesful = true;
                this.successText = 'You have successfully submitted your petition';
                this.isAddPetition = false;
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


  saveData() {
    this.subjectName = Subjects.getSubjectsName(this.program, this.subjectCode);
    this.subjectUnits = Subjects.getSubjectsUnits(this.program, this.subjectCode).toString();
  }

  ngOnInit(): void {
    const data = this.encryptData.decryptData('student') ?? ''
    this.isSuccesful = data.isSuccesful;
    this.successText = data.successText;
    this.fetchClass();
    this.loadStudentData();
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}