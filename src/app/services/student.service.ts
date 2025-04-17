import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { privateData } from '../common/libraries/private-data';
@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient, private privateData: privateData) { }

  apiUrl = this.privateData.studentUrl;
  apiPrintableUrl = this.privateData.printableUrl;

  getClass(tokenId: string) {
    const credentials = { tokenId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-class.php`, credentials);
  }

  getHistoryClass(tokenId: string) {
    const credentials = { tokenId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-class-history.php`, credentials);
  }

  trackPetition(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-track-petition.php`, credentials);
  }

  fetchNotification(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-notification.php`, credentials);
  }

  otpVerification(tupvId: string) {
    const credentials = { tupvId }
    return this.http.post<any[]>(`${this.apiUrl}/otp-verification.php`, credentials);
  }

  getStudentsReport(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-students-report.php`, credentials);
  }

  removePetition(petitionId: string) {
    const credentials = { petitionId }
    return this.http.post<any[]>(`${this.apiUrl}/petition-deletion.php`, credentials);
  }


  receivePetition(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-receive-petition.php`, credentials);
  }


  petitionCreation(studentId: string, subjectCode: string, subjectName: string, subjectUnits: string, program: string, overLoad: string, yearSection: string, faculty: string, reasons:string, schoolYear:string, term:string) {
    const credentials = { studentId, subjectCode, subjectName, subjectUnits, program, overLoad, yearSection, faculty, reasons, schoolYear, term}
    return this.http.post<any[]>(`${this.apiUrl}/petition-creation.php`, credentials);
  }

  petitionApplicatipon(studentId: string, classId: string, overLoad: string, faculty: string, yearSection: string) {
    const credentials = { studentId, classId, overLoad, faculty, yearSection}
    return this.http.post<any[]>(`${this.apiUrl}/petition-application.php`, credentials);
  }

  tokenIdValidator(tupvId: string, tokenId: string) {
    const credentials = { tupvId, tokenId }
    return this.http.post<any[]>(`${this.apiUrl}/tokenId-validation.php`, credentials);
  }

  login(tupvId: string, password: string) {
    const credentials = { tupvId, password }
    return this.http.post<any[]>(`${this.apiUrl}/student-authentication.php`, credentials);
  }

  updateStudentsProfile(tupvId: string, studentId: string, tokenId: string, email: string, currentPassword: string, newPassword: string) {
    const credentials = { tupvId, studentId, tokenId, email, currentPassword, newPassword }
    return this.http.post<any[]>(`${this.apiUrl}/update-students-profile.php`, credentials);
  }


  classChecker(studentId: string, tokenId: string, classId: string) {
    const credentials = { studentId, tokenId, classId }
    return this.http.post<any[]>(`${this.apiUrl}/class-checker.php`, credentials);
  }

  updateStudentMessage(tokenId: string, studentId: string, notificationId: string, status: string) {
    const credentials = { tokenId, studentId, notificationId, status }
    return this.http.post<any[]>(`${this.apiUrl}/update-students-message.php`, credentials);
  }

  register(firstName: string, lastName: string, tupvId: string, email: string, password: string, program: string) {
    const credentials = { firstName, lastName, tupvId, email, password, program }
    return this.http.post<any[]>(`${this.apiUrl}/student-registration.php`, credentials);
  }

  fetchCalendar(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-schedule.php`, credentials);
  }

  downloadForm(petitionId: string, tokenId: string, firstName: string, lastName: string, capacity: number, studentId: string, type: string): void {
    const requestData = { petitionId, tokenId, capacity, studentId };

    if (capacity > 9 || type == "special class") {
      this.http.post(this.apiPrintableUrl + '/petition-specialclass.php', requestData, { responseType: 'blob' }).subscribe(
        (response: Blob) => {
          // Create a Blob and trigger download
          const blob = new Blob([response], { type: 'application/pdf' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${firstName}_${lastName}_petition_special_class.pdf`; // Adjust the file extension as needed
          a.click();
          window.URL.revokeObjectURL(downloadUrl); // Clean up URL reference
        },
        (error) => {
        }
      );
    }

    else {
      this.http.post(this.apiPrintableUrl + '/petition-tutorial.php', requestData, { responseType: 'blob' }).subscribe(
        (response: Blob) => {
          // Create a Blob and trigger download
          const blob = new Blob([response], { type: 'application/pdf' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `${firstName}_${lastName}_petition_tutorial_class.pdf`; // Adjust the file extension as needed
          a.click();
          window.URL.revokeObjectURL(downloadUrl); // Clean up URL reference
        },
        (error) => {
        }
      );
    }
  }
}



