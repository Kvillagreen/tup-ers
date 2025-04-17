import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncryptData } from '../../common/libraries/encrypt-data';
import { Extras } from '../../common/libraries/environment';
import { StudentService } from '../../services/student.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentDate: Date = new Date();
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];
  selectedDateSchedule: any[] = [];
  scheduleData: any[] = []; // Store fetched schedule data
  clickDate: any;
  extras = Extras
  constructor(private encryptData: EncryptData, private studentService: StudentService) { }

  ngOnInit(): void {
    this.generateCalendar();
    this.fetchSchedule();
  }

  formatMonthAndYear(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ day: null, isScheduled: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${this.currentDate.getFullYear()}-${this.padZero(this.currentDate.getMonth() + 1)}-${this.padZero(day)}`;
      const isScheduled = this.isDateScheduled(dateStr);
      this.calendarDays.push({ day, dateStr, isScheduled });
    }
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  isDateScheduled(dateStr: string): boolean {
    return this.scheduleData.some(item =>
      item.schedule.some((s: any) => s.date === dateStr)
    );
  }

  prevMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.selectedDateSchedule = [];
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.selectedDateSchedule = [];
  }
  
  selectDay(dayObj: any): void {
    this.clickDate = dayObj.dateStr;
    if (dayObj && dayObj.isScheduled) {
      this.selectedDateSchedule = this.scheduleData.filter(item =>
        item.schedule.some((s: any) => s.date === dayObj.dateStr)
      );
      console.log(this.selectedDateSchedule)
    } else {
      this.selectedDateSchedule = [];
    }
  }

  fetchSchedule(): void {
    const data = this.encryptData.decryptData('student') ?? '';
    Extras.load = true;
    this.studentService.fetchCalendar(data.tokenId, data.studentId).subscribe(
      (response: any) => {
        Extras.load = false;
        if (response.success && response.data ) {
          this.scheduleData = response.data;
          console.log(response.data)
          this.generateCalendar();
        } else {
          this.scheduleData = []
        }
      },
      (error) => {
        Extras.load = false;
        console.error('Error fetching schedule:', error);
      }
    );
  }

  convertTimeTo12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  }
}
