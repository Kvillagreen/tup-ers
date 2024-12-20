import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})

export class StudentService {
  constructor(private http: HttpClient, private cookieService: CookieService) { }

  apiUrl = 'https://tup-ers.infotech3c.com/services/student';


  tokenIdValidator(tupvId: string, tokenId: string) {
    const credentials = { tupvId, tokenId }
    return this.http.post<any[]>(`${this.apiUrl}/tokenId_validation.php`, credentials);
  }

  login(tupvId: string, password: string) {
    const credentials = { tupvId, password }
    return this.http.post<any[]>(`${this.apiUrl}/student_authentication.php`, credentials);
  }
  register(firstName: string, lastName: string, tupvId: string, email: string, password: string, program: string) {
    const credentials = { firstName, lastName, tupvId, email, password, program }
    return this.http.post<any[]>(`${this.apiUrl}/student_registration.php`, credentials);
  }
}



