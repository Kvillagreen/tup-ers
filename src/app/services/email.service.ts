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
