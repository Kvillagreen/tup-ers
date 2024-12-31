import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { FacultyService } from './faculty.service';
@Injectable({
  providedIn: 'root',
})
export class AuthAdminGuard implements CanActivate {
  constructor(
    private cookieService: CookieService,
    private facultyService: FacultyService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> | boolean {
    const email = this.cookieService.get('facultyEmail');
    const tokenId = this.cookieService.get('facultyTokenId');
    const facultyId = this.cookieService.get('facultyId');
    const userType = this.cookieService.get('userType');
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
    this.cookieService.set('facultyIsLoggedIn', 'false', 1 / 24);
    this.router.navigate(['/faculty/login']);
  }
}
