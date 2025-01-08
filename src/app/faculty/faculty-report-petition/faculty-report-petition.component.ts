import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Extras } from '../../common/libraries/environment';
import { StudentService } from '../../services/student.service';
import { CanvasJS } from '@canvasjs/angular-charts';
import { FormsModule } from '@angular/forms';
import { FacultyService } from '../../services/faculty.service';
import { Router } from '@angular/router';
import { restrictService } from '../../common/libraries/environment';
import { EncryptData } from '../../common/libraries/encrypt-data';

interface DataPoint {
  label: string; // Use string if class_id is a string, or change to number if it's numeric
  y: number;
}

@Component({
  standalone: true,
  selector: 'app-faculty-report-petition',
  imports: [CommonModule, CanvasJSAngularChartsModule, FormsModule],
  templateUrl: './faculty-report-petition.component.html',
  styleUrls: ['./faculty-report-petition.component.css']
})
export class FacultyReportPetitionComponent implements OnInit {
  extras = Extras;
  classList: any[] = [];
  programList: any[] = [];
  programReportList: any[] = [];
  studentList: any[] = [];
  program: string = '';
  counter: number = 0;
  data: any = this.encryptData.decryptData('faculty')
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  constructor(
    private restrict: restrictService,
    private facultyService: FacultyService,
    private router: Router,
    private encryptData: EncryptData) { }
  fetchStudent() {
    const tokenId = this.data.tokenId;
    this.facultyService.getStudent(tokenId).subscribe((response: any) => {
      if (response.success && response.data) {
        this.studentList = response.data;
      }
    });
  }

  filteredStudentsByClass(classId: number) {
    return this.studentList.filter(student => student.class_id === classId)
  }


  fetchClass(program: string) {
    Extras.load = true;
    const tokenId = this.data.tokenId;
    this.facultyService.getClass(tokenId).subscribe((response: any) => {
      if (response.success) {
        Extras.load = false;
        this.programList = response.data;
        this.programReportList = response.data;
        this.classList = response.data.filter((listOfClass: any) => listOfClass.program === program && listOfClass.status == 'pending' || listOfClass.status == 'approved');
        this.programList = this.programList.reduce((acc: any, item: any) => {
          const existingProgram = acc.find((entry: any) => entry.program === item.program);
          if (existingProgram) {
            existingProgram.capacity += parseInt(item.capacity, 10);
          } else {
            acc.push({
              program: item.program,
            });
          }
          return acc;
        }, []);
        this.programReportList = this.programReportList.reduce((acc: any, item: any) => {
          const existingProgram = acc.find((entry: any) => entry.program === item.program);
          if (existingProgram) {
            existingProgram.capacity += parseInt(item.capacity, 10);
          } else {
            if (item.program == program) {
              acc.push({
                program: item.program,
              });
            }
          }
          return acc;
        }, []);
      }
      this.chart.data[0].dataPoints = this.classList.map((item: any) => ({
        label: this.extras.toTitleCaseSafe(item.subject_name),
        y: parseInt(item.capacity, 10),
        color: "#6e1423",
      }));
      if (this.chartContainer) {
        const chart = new CanvasJS.Chart(this.chartContainer.nativeElement, this.chart);
        chart.render();
      }
    });

  }

  getSingleProgram(program: string): string {
    this.chart.title = {
      text: this.title(), fontSize: 22,
      fontColor: "white",
      padding: 10,
    };
    // Extract the first program if there are multiple, otherwise return the program as-is
    return program.includes(',') ? program.split(',')[0].trim() : program.trim();
  }
  functionVar(dataPoint: DataPoint): string {
    return `Subject Name: ${dataPoint.label}, No. of Students: ${dataPoint.y}`;
  }

  title() {
    return 'No. of Student Report for ' + this.program
  }


  chart = {
    animationEnabled: true,
    backgroundColor: "rgba(239, 68, 68)",  // Set the background color with opacity
    borderColor: "#c9184a",  // Border color (set to a red color here)
    borderThickness: 2,
    title: {
      text: 'No. of Student Report',
      fontSize: 22,
      fontColor: "white",
      padding: 10,
    },
    axisY: {
      gridColor: "rgba(239, 68, 68, 0.0)",
      title: 'No. of Students',
      titleFontColor: '#f4f4f9',
      titleFontWeight: 'bold',
      lineColor: '#f4f4f9',
      labelFontColor: '#fbfffe',
      labelFontWeight: 'bold',
      tickColor: '#f4f4f9',
      labelFontSize: 14,
      titleFontSize: 18
    },
    axisX: {
      gridColor: "rgba(239, 68, 68, 0.0)",
      title: 'Subject Name',
      titleFontColor: '#f4f4f9',
      titleFontWeight: 'bold',
      lineColor: '#f4f4f9',
      labelFontColor: '#fbfffe',
      labelFontWeight: 'bold',
      tickColor: '#f4f4f9',
      labelFontSize: 10,
      titleFontSize: 18
    },
    toolTip: {
      shared: true,
      content: (e: any) => this.functionVar(e.entries[0].dataPoint)
    },
    data: [
      {
        type: 'column',
        name: 'Subject Name and Program',
        dataPoints: [] as DataPoint[] // Explicitly define the type
      },
    ]
  };

  toggleDataSeries(e: any) {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }

  ngOnInit(): void {
    this.restrict.isAdmin();
    this.fetchClass('');
    this.fetchStudent();
  }
}
