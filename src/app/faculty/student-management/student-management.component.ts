
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras, restrictService } from '../../common/libraries/environment';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { dataViewer } from '../../common/libraries/data-viewer';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { FacultyService } from '../../services/faculty.service';
@Component({
  selector: 'app-student-management',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './student-management.component.html',
  styleUrl: './student-management.component.css'
})
export class StudentManagementComponent implements OnInit, AfterViewInit {
  constructor(private facultyService: FacultyService, private encryptData: EncryptData,
    private restrict: restrictService,
    private renderer: Renderer2) { }
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;
  isFilterOn: boolean = false;
  dataViewer = dataViewer;
  @ViewChild('filterDownView') filterDownView!: ElementRef;


  fetchStudent() {
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.facultyService.getStudentManagement(data.tokenId).subscribe((response: any) => {
      if (response.data && response.success) {
        dataViewer.studentManagement = response.data
      }
    });
  }
  private clickListener: (() => void) | undefined = undefined;

  statusChange(status: any, studentId: string) {
    Extras.load = true;
    const data = this.encryptData.decryptData('faculty') ?? ''
    const statusSelected = status.target.value;
    this.facultyService.updateStudent(statusSelected, studentId, data.tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.fetchStudent();
      }
    });
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


  ngOnInit() {
    this.restrict.isAdmin();
    this.fetchStudent();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}