import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { FacultyService } from './faculty.service';
import { EncryptData } from '../common/libraries/encrypt-data';
import { Extras } from '../common/libraries/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthAdminGuard implements CanActivate {
  constructor(
    private cookieService: CookieService,
    private facultyService: FacultyService,
    private router: Router,
    private encryptData: EncryptData
  ) { }

  canActivate(): Observable<boolean> | boolean {
    const data = this.encryptData.decryptData('faculty') ?? '';

    const email = data.email;
    const tokenId = data.tokenId;
    const facultyId = data.facultyId;
    const userType = data.userType;
    if (email && tokenId && facultyId && userType == 'faculty') {
      return this.facultyService.tokenIdValidator(facultyId, email, tokenId).pipe(
        map((response: any) => {
          if (response.success) {
            return true; // Allow access
          } else {
            this.handleInvalidSession(); // Handle invalid session
            return false;
          }
        }),
        catchError(() => {
          this.handleInvalidSession(); // Handle error
          return of(false);
        })
      );
    } else {
      this.handleInvalidSession(); // Handle missing cookies
      return false;
    }
  }

  private handleInvalidSession(): void {
    Extras.load = false;
    Extras.isError("Changes detected.")
    this.encryptData.logoutDelete('faculty')
    this.router.navigate(['/faculty/login']);
  }
}
