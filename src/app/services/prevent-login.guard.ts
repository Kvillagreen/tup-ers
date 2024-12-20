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
        if (isLoggedIn) {
            // If the user is logged in, redirect to the dashboard
            this.router.navigate(['/dashboard']);
            return false; // Prevent access to login page
        }
        return true; // Allow access to login page if not logged in
    }
}
