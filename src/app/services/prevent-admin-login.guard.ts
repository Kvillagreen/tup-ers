import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { EncryptData } from '../common/libraries/encrypt-data';
@Injectable({
    providedIn: 'root',
})
export class PreventAdminLogin implements CanActivate {
    constructor(
        private router: Router,
        private encryptData: EncryptData
    ) { }

    canActivate(): boolean {
        const data = this.encryptData.decryptData('faculty') ?? '';
        const isLoggedIn = data.facultyIsLoggedIn;
        const userType = data.userType;
        if (isLoggedIn && userType == 'faculty') {
            this.router.navigate(['/faculty/dashboard']);
            return false;
        }
        return true;
    }
}
