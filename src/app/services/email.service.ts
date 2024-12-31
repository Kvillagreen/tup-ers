import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../common/environments/environment';
import { Extras } from '../common/environments/environment';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class EmailService {
  apiUrl: string = Environment.emailServiceUrl;

  constructor(private http: HttpClient, private cookieService: CookieService) { }
  // students resend email
  studentForgetPasswordEmail(tupvId: string) {
    const hostEmail = Environment.hostEmail;
    const hostPassword = Environment.hostPassword;
    const otpCode = Extras.generateOtpCode();
    const credentials = { tupvId, otpCode, hostPassword, hostEmail }
    return this.http.post<any[]>(`${this.apiUrl}/students-reset-password-service.php`, credentials);
  }

}
