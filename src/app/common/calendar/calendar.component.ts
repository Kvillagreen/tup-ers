import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacultyService } from '../../services/faculty.service';
import { CookieService } from 'ngx-cookie-service';
import { Calendar, Extras } from '../environments/environment';
import { FormsModule } from '@angular/forms';

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
  calendarDays: { date: number | null; clicked: boolean | false }[] = [];

  events: any[] = [];  // Initialize the events array

  constructor(private facultyService: FacultyService, private cookieService: CookieService) {
    this.generateCalendarDays();
  }


  dayIsClicked(day: string, click: boolean) {
    const realDate = this.convertToRealDate(day.toString());


    if (click == false) {

      const calendarEntry = {
        date: realDate.toString(),
        fromTime: this.fromTime as string, // Ensure it's treated as a string
        toTime: this.toTime as string, // Ensure it's treated as a string
      };


      Calendar.addCalendarList(calendarEntry);
      this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList))

      if (this.numberOfHours == this.numberOfHoursUnits) {
        Calendar.addCalendarList(calendarEntry);
        this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList))
        Extras.isError('Number of Hours is alread filled ');
        return;
      }
      if (this.numberOfHours > this.numberOfHoursUnits) {
        Calendar.addCalendarList(calendarEntry);
        this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList))
        Extras.isError('Number of Hours is invalid');
        return;
      }

      if (!this.toTime && !this.fromTime) {
        Extras.isError('All time must not be empty.');
        return;
      }
      if (this.toTime == this.fromTime) {
        Extras.isError('Both time must not be the same');
        return;
      }
      if (this.toTime < this.fromTime) {
        Extras.isError('Please input valid time.');
        return;
      }

      this.tempfromTime = this.fromTime;
      this.temptoTime = this.toTime;
      this.fromTime = '';
      this.toTime = '';
      const dayNumber = parseInt(day, 10);
      this.calendarDays = this.calendarDays.map((d) =>
        d.date === dayNumber ? { ...d, clicked: true } : d
      );
    }
    else {
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
    Calendar.isTime = false;
    this.numberOfHours = Number(Calendar.getTotalTimeInHours(Calendar.calendarList))
  }

  convertToRealDate(day: string) {
    const dayNumber = parseInt(day, 10); // Convert day string to number
    if (isNaN(dayNumber)) {
      console.error("Invalid day input");
      return "";
    }

    // Construct a new date
    const realDate = new Date(this.currentYear, this.currentMonth, dayNumber);

    // Format the date as YYYY-MM-DD
    const formattedDate = realDate.toISOString().split("T")[0];

    return formattedDate;
  }



  generateCalendarDays(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.calendarDays = [];

    // Add placeholders for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ date: null, clicked: false });
    }

    // Add days of the month with corresponding events
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.currentYear, this.currentMonth, i);
      const dayEvents = this.events.filter(
        (event) => currentDate >= event.startDate && currentDate <= event.endDate
      );
      this.calendarDays.push({ date: i, clicked: false });
    }
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

  ngOnInit(): void {
    this.numberOfHoursUnits = Number(this.cookieService.get('units')) * 13
  }
}