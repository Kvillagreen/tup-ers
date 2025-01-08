import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { privateData } from '../common/libraries/private-data';
@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient, private privateData: privateData) { }

  apiUrl = this.privateData.studentUrl;

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

  receivePetition(tokenId: string, studentId: string) {
    const credentials = { tokenId, studentId }
    return this.http.post<any[]>(`${this.apiUrl}/fetch-receive-petition.php`, credentials);
  }

  petitionCreation(studentId: string, subjectCode: string, subjectName: string, subjectUnits: string, program: string) {
    const credentials = { studentId, subjectCode, subjectName, subjectUnits, program }
    return this.http.post<any[]>(`${this.apiUrl}/petition-creation.php`, credentials);
  }

  petitionApplicatipon(studentId: string, classId: string) {
    const credentials = { studentId, classId }
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

  register(firstName: string, lastName: string, tupvId: string, email: string, password: string, program: string) {
    const credentials = { firstName, lastName, tupvId, email, password, program }
    return this.http.post<any[]>(`${this.apiUrl}/student-registration.php`, credentials);
  }
}



