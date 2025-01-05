import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Extras, Subjects } from '../../common/environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
  isSuccesful: boolean = false;
  isNotTyped: boolean = false;
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

  fetchClassHistory() {
    const tokenId = this.cookieService.get('tokenId') ?? '';
    this.studentService.getClass(tokenId).subscribe((response: any) => {
      Extras.classListHistory = response.data.filter((listOfClass: any) => listOfClass.program === this.program && listOfClass.status == 'approved' || listOfClass.status == 'denied');
    });
  }

  loadStudentData() {
    this.fullName = this.cookieService.get('firstName') + ' ' + this.cookieService.get('lastName');
    this.tupvId = this.cookieService.get('tupvId');
    this.program = this.cookieService.get('program');
  }
  ngOnInit(): void {

    if (this.cookieService.get('isSuccesful') == 'true') {
      this.isSuccesful = true;
    }
    this.fetchClassHistory();
    this.loadStudentData();
    Extras.searchText = '';
    Extras.isFilterOn = false;
  }
}