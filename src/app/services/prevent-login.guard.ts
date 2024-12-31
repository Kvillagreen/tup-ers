import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
    providedIn: 'root',
})
export class PreventLoginGuard implements CanActivate {
    constructor(
        private cookieService: CookieService,
        private router: Router
    ) { }

    canActivate(): boolean {
        const isLoggedIn = this.cookieService.get('isLoggedIn') === 'true';
        const userType = this.cookieService.get('userType');
        if (isLoggedIn && userType == 'student') {
            this.router.navigate(['/dashboard']);
            return false;
        }
        return true;
    }
}
