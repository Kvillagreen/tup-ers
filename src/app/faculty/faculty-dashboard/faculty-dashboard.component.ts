
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { Extras } from '../../common/libraries/environment';
import { FacultyService } from '../../services/faculty.service';
import { Router } from '@angular/router';
import e from 'cors';
@Component({
  selector: 'app-faculty-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './faculty-dashboard.component.html',
  styleUrl: './faculty-dashboard.component.css'
})
export class FacultyDashboardComponent implements OnInit {
  currentDate: Date = new Date();
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];
  selectedDateSchedule: any[] = [];
  scheduleData: any[] = []; // Store fetched schedule data
  clickDate: any;
  facultyProgram: string = '';
  facultyType: string = '';
  fullName: string = '';
  data: any;
  extras = Extras;
  constructor(private encryptData: EncryptData, private facultyService: FacultyService, private router: Router) { }


  formatMonthAndYear(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  loadFacultyData() {
    this.fullName = this.data.firstName + ' ' + this.data.lastName;
    this.facultyProgram = this.data.program;
    this.facultyType = this.data.facultyType;
  }
  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

    // Add empty slots before the first day
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ day: null, isScheduled: false });
    }

    // Fill the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentDate.getFullYear()}-${this.padZero(this.currentDate.getMonth() + 1)}-${this.padZero(day)}`;
      const isScheduled = this.isDateScheduled(dateStr);
      this.calendarDays.push({ day, dateStr, isScheduled });
    }
  }

  // ➡️ Helper for zero padding (e.g., "01" instead of "1")
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  // 🔍 Check if a date has a schedule
  isDateScheduled(dateStr: string): boolean {
    return this.scheduleData.some(item =>
      item.schedule.some((s: any) => s.date === dateStr)
    );
  }

  // ⬅️ Navigate to the previous month
  prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.selectedDateSchedule = [];
  }

  // ➡️ Navigate to the next month
  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.selectedDateSchedule = [];
  }
  // 📌 Select a day and show its schedule
  selectDay(dayObj: any): void {
    this.clickDate = dayObj.dateStr;
    if (dayObj && dayObj.isScheduled) {
      this.selectedDateSchedule = this.scheduleData.filter(item =>
        item.schedule.some((s: any) => s.date === dayObj.dateStr)
      );
    } else {
      this.selectedDateSchedule = [];
    }
  }

  // 🔄 Fetch the student's schedule from the backend
  fetchSchedule(): void {
    const data = this.encryptData.decryptData('faculty') ?? '';
    Extras.load = true;
    if(data.facultyType == 'Registrar' || this.facultyType == 'ADAA'){
      this.facultyService.fetchScheduleRegistrar(data.tokenId).subscribe(
        (response: any) => {
          Extras.load = false;
          if (response.success && response.data) {
            this.scheduleData = response.data;  // ✅ Correctly store fetched data
            this.generateCalendar();            // ✅ Refresh calendar with new data
          } else {
            console.error('Failed to fetch schedule');
          }
        },
        (error) => {
          Extras.load = false;
          console.error('Error fetching schedule:', error);
        }
      );
    }
    else{
      this.facultyService.fetchSchedule(data.tokenId, data.facultyId).subscribe(
        (response: any) => {
          Extras.load = false;
  
          if (response.success && response.data) {
            this.scheduleData = response.data;  // ✅ Correctly store fetched data
            this.generateCalendar();            // ✅ Refresh calendar with new data
          } else {
            console.error('Failed to fetch schedule');
          }
        },
        (error) => {
          Extras.load = false;
          console.error('Error fetching schedule:', error);
        }
      );
    }
    
  }

  ngOnInit(): void {
    this.data = this.encryptData.decryptData('faculty');
    this.loadFacultyData();
    if (this.facultyType == 'Faculty Staff' || this.facultyType == 'Registrar' || this.facultyType == 'ADAA') {
      this.generateCalendar();
      this.fetchSchedule();
    }
    else {
      this.router.navigate(['/faculty/view-petition'])
    }

  }

  convertTimeTo12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  }
}
