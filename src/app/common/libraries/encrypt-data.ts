import { CookieService } from 'ngx-cookie-service';
import * as CryptoJS from 'crypto-js';
import { privateData } from './private-data';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})

export class EncryptData {
    constructor(private cookieService: CookieService, private privateData: privateData) { }

    secretKey: string = '';
    encryptAndStoreData(key: string, data: any): any {
        if (key == 'faculty') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'student') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'web') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        }
        else {
            this.secretKey = '';
        }
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
            secure: true, // Transmit over HTTPS only
            httpOnly: true, // Prevent access via JavaScript
            sameSite: 'Strict', // Prevent cross-site access
        }).toString();
        if (this.secretKey) {
            this.cookieService.delete(this.privateData.generateBeforeDate(key))
            this.cookieService.set(this.secretKey.toString(), encryptedData, 2 / 24);
        }
    }
    logoutDelete(key: string): any {
        if (key == 'faculty') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'student') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'web') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        }
        else {
            this.secretKey = '';
        }
        if (this.secretKey) {
            this.cookieService.delete(this.privateData.generateBeforeDate(key))
            this.cookieService.delete(this.secretKey.toString());
        }
    }

    decryptData(key: string): any {
        if (key == 'faculty') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'student') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        } else if (key == 'web') {
            this.secretKey = this.privateData.generateCustomApiKey(key)
        }
        else {
            this.secretKey = '';
            return [];
        }
        if (this.secretKey) {
            const encryptedData = this.cookieService.get(this.secretKey.toString());
            if (!encryptedData) {
                return null;
            }
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            return decryptedData;
        }
    }
}
