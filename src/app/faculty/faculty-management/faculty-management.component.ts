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
  standalone: true,
  selector: 'app-faculty-management',
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './faculty-management.component.html',
  styleUrl: './faculty-management.component.css'
})

export class FacultyManagementComponent implements OnInit, AfterViewInit {
  constructor(private facultyService: FacultyService, private encryptData: EncryptData,
    private restrict: restrictService,
    private renderer: Renderer2) { }
  isLocate: boolean = false;
  petitionTracker: any[] = [];
  extras = Extras;
  isFilterOn: boolean = false;
  dataViewer = dataViewer;
  @ViewChild('filterDownView') filterDownView!: ElementRef;


  fetchFaculty() {
    const data = this.encryptData.decryptData('faculty') ?? ''
    this.facultyService.getFaculty(data.tokenId).subscribe((response: any) => {
      dataViewer.facultyManagement = response.data
    });
  }
  private clickListener: (() => void) | undefined = undefined;

  statusChange(status: any, facultyId: string) {
    Extras.load = true;
    const data = this.encryptData.decryptData('faculty') ?? ''
    const statusSelected = status.target.value;
    this.facultyService.updateFaculty(statusSelected, facultyId, data.tokenId).subscribe((response: any) => {
      Extras.load = false;
      if (response.success) {
        this.fetchFaculty();
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
    this.fetchFaculty();
    dataViewer.pageIndex = 0;
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
  }
}