
import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root', // Ensure this is present
})

export class privateData {
    //url = 'http://localhost/tup-ers/php-folder/'
    url = 'https://tupv-serve.ptspec.com/services/'
    get studentUrl(): string {
        return this.url + 'student';
    }
    get facultyUrl(): string {
        return this.url + 'faculty';
    }

    get printableUrl(): string {
        return this.url + 'printable';
    }
    get emailServiceUrl(): string {
        return this.url + 'email-service';
    }

    studentSecretKey = ''
    facultySecretKey = ''
    hostEmail = 'admin@tupv-serve.ptspec.com'
    hostPassword = 'n5NabnD~&uZ#'

    generateCustomApiKey(variableKey: string): string {
        const monthAbbreviations = [
            'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
        ];
        const currentDate = new Date();
        const monthInitial = monthAbbreviations[currentDate.getMonth()]; // First letter of the month
        const variableKeyInitial = variableKey.charAt(0).toUpperCase(); // First letter of variableKey

        // Get the date string (YYYY-MM-DD) and hash it
        const dateString = currentDate.toISOString().split('T')[0];
        const hashedDate = CryptoJS.SHA256(dateString).toString(CryptoJS.enc.Hex);

        // Format hash as UUID-like string
        const uuidLikeHash = `${hashedDate.substring(0, 8)}-${hashedDate.substring(8, 12)}-${hashedDate.substring(12, 16)}-${hashedDate.substring(16, 20)}-${hashedDate.substring(20, 32)}`;

        // Combine everything into the desired format
        return `_${monthInitial}${variableKeyInitial}ERS-${uuidLikeHash}`;
    }


    generateBeforeDate(variableKey: string): string {
        const monthAbbreviations = [
            'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
        ];
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        const monthInitial = monthAbbreviations[currentDate.getMonth()]; // First letter of the month
        const variableKeyInitial = variableKey.charAt(0).toUpperCase(); // First letter of variableKey

        // Get the date string (YYYY-MM-DD) and hash it
        const dateString = currentDate.toISOString().split('T')[0];
        const hashedDate = CryptoJS.SHA256(dateString).toString(CryptoJS.enc.Hex);

        // Format hash as UUID-like string
        const uuidLikeHash = `${hashedDate.substring(0, 8)}-${hashedDate.substring(8, 12)}-${hashedDate.substring(12, 16)}-${hashedDate.substring(16, 20)}-${hashedDate.substring(20, 32)}`;

        // Combine everything into the desired format
        return `_${monthInitial}${variableKeyInitial}ERS-${uuidLikeHash}`;
    }

};

