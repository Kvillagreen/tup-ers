
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { CookieService } from 'ngx-cookie-service';
import { Extras } from '../../common/libraries/environment';
import { dataViewer } from '../../common/libraries/data-viewer';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NotificationService } from '../../common/libraries/environment';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientTestingModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  constructor(private studentService: StudentService, 
    private notificationService: NotificationService, private cookieService: CookieService, private renderer: Renderer2) { }
  isLocate: boolean = false;
  dataViewer = dataViewer;
  isFilterOn: boolean = false;
  status: string = 'unread';
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


  ngOnInit() {
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
    this.notificationService.fetchNotification();
  }
}