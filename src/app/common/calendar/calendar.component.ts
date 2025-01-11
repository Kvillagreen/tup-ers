import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacultyService } from '../../services/faculty.service';
import { CookieService } from 'ngx-cookie-service';
import { Calendar, Extras } from '../libraries/environment';
import { FormsModule } from '@angular/forms';
import { FacultyViewPetitionComponent } from '../../faculty/faculty-view-petition/faculty-view-petition.component';
import { isThisMonth } from 'date-fns';
import { EncryptData } from '../libraries/encrypt-data';
@Component({
  standalone: true,
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  calendar = Calendar
  extras = Extras
  view = FacultyViewPetitionComponent
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  realDate: String = '';
  fromTime: String = '';
  toTime: String = '';
  tempfromTime: String = '';
  temptoTime: String = '';
  numberOfHoursUnits: number = 0;
  numberOfHours: number = 0;
  clickDate: boolean = false;
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  data: any = this.encryptData.decryptData('faculty');
  calendarDays: { realDate: Date; date: number | null; clicked: boolean | false }[] = [];
  calendarData: { [key: string]: { realDate: Date; date: number | null; clicked: boolean }[] } = {};
  tempData: any[] = [];
  constructor(private facultyService: FacultyService, private encryptData: EncryptData,
    private cookieService: CookieService, private facultyView: FacultyViewPetitionComponent) {
    this.generateCalendarDays();
  }

  checkClick() {
    if (!this.totalHours() || this.totalHours() == 0) {
      Extras.isError('Total hours must not empty');
      return;
    }
    Calendar.isTime = !Calendar.isTime;
  }

  dayIsClicked(day: string, click: boolean): void {
    const realDate = this.convertToRealDate(day.toString());

    if (click === false) {
      const calendarEntry = {
        date: realDate.toString(),
        fromTime: this.fromTime as string, // Ensure it's treated as a string
        toTime: this.toTime as string, // Ensure it's treated as a string
      };


      if (!this.toTime && !this.fromTime) {
        Extras.isError('All time must not be empty.');
        return;
      }

      if (this.toTime === this.fromTime) {
        Extras.isError('Both time must not be the same');
        return;
      }

      if (this.toTime < this.fromTime) {
        Extras.isError('Please input valid time.');
        return;
      }

      // Add the clicked entry
      Calendar.addCalendarList(calendarEntry);
      this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList));
      if (this.numberOfHours > this.totalHours()) {
        Calendar.addCalendarList(calendarEntry);
        this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList));
        Extras.isError('Number of Hours is invalid');
        return;
      }
      // Store the temporary times and reset them
      this.tempfromTime = this.fromTime;
      this.temptoTime = this.toTime;
      this.fromTime = '';
      this.toTime = '';

      // Mark the day as clicked
      const dayNumber = parseInt(day, 10);
      this.calendarDays = this.calendarDays.map((d) =>
        d.date === dayNumber ? { ...d, clicked: true } : d
      );

    } else {
      // Mark the day as not clicked
      const calendarEntry = {
        date: realDate.toString(),
        fromTime: this.tempfromTime as string, // Ensure it's treated as a string
        toTime: this.temptoTime as string, // Ensure it's treated as a string
      };

      Calendar.addCalendarList(calendarEntry);
      const dayNumber = parseInt(day, 10);
      this.calendarDays = this.calendarDays.map((d) =>
        d.date === dayNumber ? { ...d, clicked: false } : d
      );
    }

    const monthKey = `${this.currentYear}-${this.currentMonth}`;
    this.calendarData[monthKey] = this.calendarDays
    Calendar.isTime = false;
    this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList));
  }

  convertToRealDate(day: string) {
    const dayNumber = parseInt(day, 10);
    if (isNaN(dayNumber)) {
      return "";
    }
    const realDate = new Date(this.currentYear, this.currentMonth, dayNumber);
    const formattedDate = realDate.toISOString().split("T")[0];

    return formattedDate;
  }



  generateCalendarDays(): void {
    const monthKey = `${this.currentYear}-${this.currentMonth}`; // Unique key for year and month
    if (this.calendarData[monthKey]) {
      this.calendarDays = this.calendarData[monthKey]; // Load existing data
      return;
    }

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const newCalendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      newCalendarDays.push({ realDate: new Date(), date: null, clicked: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const formattedDate = date.toISOString().split("T")[0];
      this.tempData = Calendar.calendarList;
      const match = this.tempData.find(item => item.date === formattedDate);

      // Check if the date is already clicked, then set the clicked state
      newCalendarDays.push({
        realDate: date,
        date: i,
        clicked: !!match,  // Set clicked state based on whether there's a matching entry
      });
    }

    this.calendarData[monthKey] = newCalendarDays;
    this.calendarDays = newCalendarDays;
  }



  // Navigate to the previous month
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }

    this.generateCalendarDays();
  }

  // Navigate to the next month
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendarDays();
  }

  totalHours() {
    this.data = this.encryptData.decryptData('faculty');
    this.numberOfHoursUnits = Number(this.data.totalHours)
    return this.numberOfHoursUnits;
  }

  ngOnInit(): void {
    this.tempData = Calendar.calendarList;
    this.numberOfHours = Calendar.getTotalTimeInHours(Calendar.calendarList)

  }
}