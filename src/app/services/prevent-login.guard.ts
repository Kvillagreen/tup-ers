import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EncryptData } from '../common/libraries/encrypt-data';
@Injectable({
    providedIn: 'root',
})
export class PreventLoginGuard implements CanActivate {
    constructor(
        private cookieService: CookieService,
        private router: Router,
        private encryptData: EncryptData
    ) { }

    canActivate(): boolean {
        const data = this.encryptData.decryptData('student') ?? '';
        let userType = data.userType;
        let isLoggedIn = data.isLoggedIn;
        
        if (isLoggedIn && userType == 'student') {
            this.router.navigate(['/dashboard']);
            return false;
        }
        return true;
    }
}
