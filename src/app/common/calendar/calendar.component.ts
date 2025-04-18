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
  categoryText: string = "";
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  data: any = this.encryptData.decryptData('faculty');
  calendarDays: { realDate: Date; date: number | null; clicked: boolean | false; category: string | null }[] = [];
  calendarData: { [key: string]: { realDate: Date; date: number | null; clicked: boolean; category: string | null }[] } = {};
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

  dayIsClicked(day: number, click: boolean, category: string): void {
    const realDate = this.convertToRealDate((day+1).toString());

    if (click === false) {
      const calendarEntry = {
        date: realDate.toString(),
        fromTime: this.fromTime as string, // Ensure it's treated as a string
        toTime: this.toTime as string,
        category: category as string // Ensure it's treated as a string
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
      if (!category) {
        Extras.isError('Category is required.');
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
      const dayNumber = parseInt(String(day), 10);
      this.calendarDays = this.calendarDays.map((d) =>
        d.date === dayNumber ? { ...d, clicked: true, category: category } : d
      );

      console.log(Calendar.calendarList);
    } else {
      // Mark the day as not clicked
      const calendarEntry = {
        date: realDate.toString(),
        fromTime: this.tempfromTime as string, // Ensure it's treated as a string
        toTime: this.temptoTime as string,
        category: this.categoryText, // Ensure it's treated as a string
      };

      Calendar.addCalendarList(calendarEntry);
      const dayNumber = parseInt(String(day), 10);
      this.calendarDays = this.calendarDays.map((d) =>
        d.date === dayNumber ? { ...d, clicked: false, category: '' } : d
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

  toInt(num:string){
    return parseInt(num)
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

    // Fill empty slots before the 1st day of the month
    for (let i = 0; i < firstDay; i++) {
      newCalendarDays.push({ realDate: new Date(), date: null, clicked: false, category: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const formattedDate = date.toISOString().split("T")[0];
      this.tempData = Calendar.calendarList;
      const match = this.tempData.find(item => item.date === formattedDate);

      newCalendarDays.push({
        realDate: date,
        date: i,
        clicked: !!match,
        category: match ? match.category ?? null : null, // Ensure category is always present
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