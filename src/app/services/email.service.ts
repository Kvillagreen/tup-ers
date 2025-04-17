import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { privateData } from '../common/libraries/private-data';
import { Extras } from '../common/libraries/environment';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class EmailService {

  apiUrl: string = this.privateData.emailServiceUrl;

  constructor(private http: HttpClient, private cookieService: CookieService, private privateData: privateData) { }
  // students resend email
  studentForgetPasswordEmail(tupvId: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const otpCode = Extras.generateOtpCode();
    const credentials = { tupvId, otpCode, hostPassword, hostEmail }
    return this.http.post<any[]>(`${this.apiUrl}/students-reset-password-service.php`, credentials);
  }

  facultyForgetPasswordEmail(email: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const otpCode = Extras.generateOtpCode();
    const credentials = { email, otpCode, hostPassword, hostEmail }
    return this.http.post<any[]>(`${this.apiUrl}/faculty-reset-password-service.php`, credentials);
  }

    emailNotification(classId:string, subjectName:string, subjectCode:string, program:string, tokenId:string ){
          const email = this.privateData.hostEmail
              const pass = this.privateData.hostPassword
                  const credentials = {classId, subjectName, subjectCode, program, email, pass, tokenId}
                      return this.http.post<any[]>(`${this.apiUrl}/email-notification.php`, credentials);
    }
    

  petitionApprovalGeneral(email: string, faculty: string, classId: string, tokenId: string, classSession: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const credentials = { email, hostPassword, hostEmail, faculty, classId, tokenId, classSession }
    return this.http.post<any[]>(`${this.apiUrl}/petition-approval-general.php`, credentials);
  }

  petitionApprovalRegistrar(email: string, faculty: string, classId: string, tokenId: string, classSession: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const credentials = { email, hostPassword, hostEmail, faculty, classId, tokenId, classSession }
    return this.http.post<any[]>(`${this.apiUrl}/petition-approval-registrar.php`, credentials);
  }

  petitionApprovalHead(email: string, faculty: string, classId: string, tokenId: string, classSession: string, facultyId: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const credentials = { email, hostPassword, hostEmail, faculty, classId, tokenId, classSession, facultyId }
    return this.http.post<any[]>(`${this.apiUrl}/petition-approval-head.php`, credentials);
  }

  petitionApprovalStaff(email: string, faculty: string, classId: string, tokenId: string, classSession: string, schedule: any, facultyId: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const credentials = { email, hostPassword, hostEmail, faculty, classId, tokenId, classSession, schedule, facultyId }
    return this.http.post<any[]>(`${this.apiUrl}/petition-approval-staff.php`, credentials);

  }

  studentTemporaryPasswordSender(tupvId: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const password = Extras.generateTemporaryPassword();
    const credentials = { tupvId, password, hostPassword, hostEmail }
    return this.http.post<any[]>(`${this.apiUrl}/students-temporary-password-sender.php`, credentials);
  }


  facultyTemporaryPasswordSender(email: string) {
    const hostEmail = this.privateData.hostEmail;
    const hostPassword = this.privateData.hostPassword;
    const password = Extras.generateTemporaryPassword();
    const credentials = { email, password, hostPassword, hostEmail }
    return this.http.post<any[]>(`${this.apiUrl}/faculty-temporary-password-sender.php`, credentials);
  }

}
