
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
import { EncryptData } from '../../common/libraries/encrypt-data';
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
    private notificationService: NotificationService, private encryptData: EncryptData,
    private cookieService: CookieService, private renderer: Renderer2) { }
  isLocate: boolean = false;
  dataViewer = dataViewer;
  isFilterOn: boolean = false;
  status: string = 'unread';
  extras = Extras
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

  updateMessage(notificationId: string, status: string) {
    const data = this.encryptData.decryptData('student') ?? '';
    this.studentService.updateStudentMessage(data.tokenId.toString(), data.studentId.toString(), notificationId, status).subscribe({
      next: (response: any) => {
        Extras.load = false;
        if (response.success) {
          this.notificationService.fetchNotification();
        }
      },
    });
  }


  ngOnInit() {
    dataViewer.searchText = '';
    dataViewer.isFilterOn = false;
    this.notificationService.fetchNotification();
  }
}