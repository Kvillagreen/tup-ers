import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { StudentService } from './student.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private cookieService: CookieService,
    private studentService: StudentService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> | boolean {
    const tupvId = this.cookieService.get('tupvId');
    const tokenId = this.cookieService.get('tokenId');
    const userType = this.cookieService.get('userType');
    if (tupvId && tokenId && userType=='student') {
      return this.studentService.tokenIdValidator(tupvId, tokenId).pipe(
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
    this.cookieService.set('isLoggedIn', 'false', 1 / 24);
    this.router.navigate(['/login']);
  }
}
