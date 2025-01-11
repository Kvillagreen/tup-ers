import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/libraries/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';

@Component({
  selector: 'app-history',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit, AfterViewInit {
  program: string = '';
  tupvId: string = '';
  fullName: string = '';
  studentId: string = '';
  classId: string = '';
  dataViewer = dataViewer;
  constructor(private studentService: StudentService, private encryptData: EncryptData, private renderer: Renderer2, private cookieService: CookieService, private cdr: ChangeDetectorRef) { }
  extras = Extras;
  subject = Subjects;

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

  fetchClassHistory() {
    const data = this.encryptData.decryptData('student') ?? ''
    const tokenId = data.tokenId;
    this.studentService.getClass(tokenId).subscribe((response: any) => {
      if (response.data && response.success) {
        dataViewer.classListHistory = response.data.filter((listOfClass: any) => listOfClass.program === this.program && listOfClass.status == 'finished' || listOfClass.status == 'denied');
      }
    });
  }

  loadStudentData() {
    const data = this.encryptData.decryptData('student') ?? ''
    this.tupvId = data.tupvId;
    this.fullName = `${data.firstName}` + ' ' + `${data.lastName}`;
    this.program = data.program;
  }

  ngOnInit(): void {
    this.fetchClassHistory();
    this.loadStudentData();
    dataViewer.searchText = '';
    dataViewer.pageIndex = 0;
    dataViewer.isFilterOn = false;
  }
}