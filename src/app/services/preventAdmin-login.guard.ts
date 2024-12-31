import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
    providedIn: 'root',
})
export class PreventAdminLogin implements CanActivate {
    constructor(
        private cookieService: CookieService,
        private router: Router
    ) { }

    canActivate(): boolean {
        const isLoggedIn = this.cookieService.get('facultyIsLoggedIn') === 'true';
        const userType = this.cookieService.get('userType');
        if (isLoggedIn && userType == 'faculty') {
            this.router.navigate(['/faculty/dashboard']);
            return false;
        }
        return true;
    }
}
