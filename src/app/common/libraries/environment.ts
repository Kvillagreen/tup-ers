
interface Subject {
    readonly name: string; // The name of the subject
    readonly units: number; // The number of units the subject carries
};

interface Programs {
    readonly [program: string]: {
        readonly [subjectCode: string]: Subject;
    };
};

export const Subjects = {
    programs: {
        'BS-ECE': {},
        'BS-ME': {},
        'BS-ELECTRICAL': {},
        'BS-COMP ENG': {},
    } as any,

    faculty: {
        "roles": [
            "Registrar",
            "ADAA",
            "Program Head",
            "College Dean",
            "Faculty Staff"
        ]
    },




    getSubjectsName(program: string, subjectCode: string) {
        const programSubjects = this.programs[program];
        if (!programSubjects || !programSubjects[subjectCode]) {
        }
        return programSubjects[subjectCode].name;
    },

    getSubjectsUnits(program: string, subjectCode: string) {
        const programSubjects = this.programs[program];
        if (!programSubjects || !programSubjects[subjectCode]) {
        }
        return programSubjects[subjectCode].units;
    },

    getSubjects(program: string) {
        const programSubjects = this.programs[program];
        if (!programSubjects) {
            return [];
        }
        return Object.entries(programSubjects).map(([code, details]) => {
            const subject = details as Subject; // Explicitly cast details to Subject
            return {
                code,
                name: subject.name,
                units: subject.units,
            };
        });
    }

};
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
    classId: string = '';
}

export const Calendar = {
    isTime: false,
    calendarList: [] as any[],

    addCalendarList(entry: { date: string; fromTime: string; toTime: string }) {
        // Check if the entry already exists in the list
        const index = this.calendarList.findIndex(
            (item) =>
                item.date === entry.date &&
                item.fromTime === entry.fromTime &&
                item.toTime === entry.toTime
        );

        if (index !== -1) { 
            this.calendarList = this.calendarList.filter(item => item.date !== entry.date);
            console.log(this.calendarList)

        } else {
            this.calendarList.push(entry);
        }
    },
    getTotalList() {
        return this.calendarList.length
    },
    getTotalTimeInHours(calendarList: { date: string; fromTime: string; toTime: string }[]): number {
        return calendarList.reduce((total, entry) => {
            const fromTime = new Date(`1970-01-01T${entry.fromTime}:00`);
            const toTime = new Date(`1970-01-01T${entry.toTime}:00`);

            // Calculate the difference in hours
            const diffInHours = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60);

            // Add to the total time
            return total + diffInHours;
        }, 0);
    }


}

import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { StudentService } from '../../services/student.service';
import { dataViewer } from './data-viewer';
import { Router } from '@angular/router';
import { EncryptData } from './encrypt-data';

@Injectable({
    providedIn: 'root', // Ensure this is present
})

export class NotificationService {
    constructor(private studentService: StudentService, private encryptData: EncryptData) {
    }
    extras = Extras;
    dataViewer = dataViewer;
    public fetchNotification() {
        const data = this.encryptData.decryptData('student') ?? '';
        if (!data) {
            return;
        }
        this.extras.load = false;
        const tokenId = data.tokenId;
        const studentId = data.studentId;
        this.studentService.fetchNotification(tokenId, studentId).subscribe((response: any) => {
            if (response.success) {
                dataViewer.notificationList = response.data;
            }
        });
    }
}

@Injectable({
    providedIn: 'root',
})
export class restrictService {
    constructor(private router: Router, private encrypData: EncryptData,
    ) { }
    public isAdmin() {
        const data = this.encrypData.decryptData('faculty');
        if (data.facultyType !== 'Registrar' && data.facultyType !== 'Admin') {
            console.log('restrict')
            this.router.navigate(['/faculty/dashboard']);
        }
    }

    public isAdminReport() {
        const data = this.encrypData.decryptData('faculty');
        if (data.facultyType !== 'Registrar' && data.facultyType !== 'Admin' && data.facultyType !== 'Program Head') {
            this.router.navigate(['/faculty/dashboard']);

        }
    }

    public isAdminReportViewable() {
        const data = this.encrypData.decryptData('faculty');
        if (data.facultyType !== 'Registrar' && data.facultyType !== 'Admin' && data.facultyType !== 'Program Head') {
            return false;
        }
        else {
            return true
        }
    }

    public isAdminViewable() {
        const data = this.encrypData.decryptData('faculty');
        if (data.facultyType !== 'Registrar' && data.facultyType !== 'Admin') {
            return false;
        }
        else {
            return true;
        }
    }
}




export const Extras = {
    runOnce: false,
    errorMessage: '',
    load: false,

    generateTemporaryPassword(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < 12; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }
        return password;
    },

    toLowerCaseSafe(value: string | undefined | null): string {
        return value ? value.toLowerCase() : '';
    },

    toUpperCaseSafe(value: string | null | undefined): string {
        return value ? value.toUpperCase() : '';
    },

    toTitleCaseSafe(value: string | undefined | null): string {
        if (!value) return ''; // Return an empty string if the value is null or undefined
        return value
            .split(' ') // Split the string into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word and lower the rest
            .join(' '); // Join the words back into a single string
    },


    removeHyphens(text: string): string {
        return text.replace(/-/g, '');
    },

    formatDate(dateStr: string): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return new Date(dateStr)
            .toLocaleDateString('en-US', options)
            .replace(',', '');
    },

    convertJson(rawData: string): any[] {
        try {
            const parsedData = JSON.parse(rawData);
            dataViewer.petitionTracker = parsedData;
            return dataViewer.petitionTracker;
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            return [];
        }
    },


    generateOtpCode() {
        // Generate a random number between 100000 and 999999
        return Math.floor(100000 + Math.random() * 900000);
    },

    formatID(tupvId: string): boolean {
        const tupvIdFormat = /^TUPV-\d{2}-\d{4}$/;
        return tupvIdFormat.test(tupvId);
    },
    formatFacultyEmail(facultyEmail: string): boolean {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@tup\.edu\.ph$/;
        return emailPattern.test(facultyEmail);
    },
    isError(message: string) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
    },

    isErrorReload(message: string) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
            window.location.reload();
        }, 500);
    },


    get copyRightYear(): string {
        return new Date().getFullYear().toString();
    },
};
