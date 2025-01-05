import { CookieService } from "ngx-cookie-service";

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
        "BET-ELECTRONICS": {
            "DT 1": { name: "DIGITAL TECHNIQUES 1", units: 3 },
            "DT 2": { name: "DIGITAL TECHNIQUES 2", units: 1 },
            "CAD": { name: "AUTO CAD", units: 5 },
            "ELEX 1": { name: "ELECTRONICS TECHNIQUES 1", units: 2 },
            "ETTP": { name: "ELECTRONICS PRINCIPLES", units: 4 },
            "COMMS": { name: "COMMUNICATIONS", units: 2 },
        },
        "BS-ECE": {
            "DT 1": { name: "DIGITAL TECHNIQUES 1", units: 3 },
            "DT 2": { name: "DIGITAL TECHNIQUES 2", units: 1 },
            "CAD": { name: "AUTO CAD", units: 5 },
            "ELEX 1": { name: "ELECTRONICS TECHNIQUES 1", units: 2 },
            "ETTP": { name: "ELECTRONICS PRINCIPLES", units: 4 },
            "COMMS": { name: "COMMUNICATIONS", units: 2 },
        }, 'BS-ME': {
            "DT 1": { name: "DIGITAL TECHNIQUES 1", units: 3 },
            "DT 2": { name: "DIGITAL TECHNIQUES 2", units: 1 },
            "CAD": { name: "AUTO CAD", units: 5 },
            "ELEX 1": { name: "ELECTRONICS TECHNIQUES 1", units: 2 },
            "ETTP": { name: "ELECTRONICS PRINCIPLES", units: 4 },
            "COMMS": { name: "COMMUNICATIONS", units: 2 },
        },
        'COAC': {},
        'BET-CHEMTECH': {},
        'BET-ELECTRICAL': {},
        'BET-MECHATRONICS': {},
        'BET-MANUFACTURING': {},
    } as any,

    faculty: {
        "roles": [
            "Registrar",
            "ADAA",
            "Program Head",
            "College Deans",
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
            // If the entry exists, remove it
            this.calendarList.splice(index, 1);
        } else {
            this.calendarList.push(entry);
        }
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


export const Extras = {
    isFilterOn: false,
    petitionTracker: [] as any[],
    classList: [] as any[],
    classListHistory: [] as any[],
    trackList: [] as any[],
    receiveList: [] as any[],
    errorMessage: '',
    load: false,
    searchText: '',
    sortField: '',
    sortDirection: 'asc' as 'asc' | 'desc',
    pageIndex: 0,
    pageSize: 10,
    facultyClassList: [] as any[],
    facultyClassListHistory: [] as any[],
    facultyTrackList: [] as any[],
    facultyReceiveList: [] as any[],

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
            this.petitionTracker = parsedData;
            return this.petitionTracker;
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
        const emailPattern = /^[a-zA-Z0-9._%+-]+@tupv\.edu$/;
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

    getViewPetitionToDisplay(): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const classList = Array.isArray(this.classList) ? this.classList : [];

        // Filter transactions based on search text
        let filteredEvents = classList.filter((listOfClass: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfClass.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.subject_code)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.subject_name)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.units)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.petition_count)).includes(Extras.toLowerCaseSafe(this.searchText))
        );

        // Filter by program and status that is pending and approved
        filteredEvents = this.sortPetition(filteredEvents);

        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return filteredEvents.slice(start, end);
    },

    getFacultyViewStudent(status: string): any[] {
        const facultyClassList = Array.isArray(this.facultyClassList) ? this.facultyClassList : [];
        let filteredEvents = facultyClassList.filter(petition => petition.status === status)
        filteredEvents = this.sortPetition(filteredEvents);
        return filteredEvents;
    },

    getViewPetitionToDisplayHistory(program: string): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const classListHistory = Array.isArray(this.classListHistory) ? this.classListHistory : [];
        let filteredEvents = classListHistory.filter((listOfClass: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfClass.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.subject_code)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.subject_name)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.units)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.petition_count)).includes(Extras.toLowerCaseSafe(this.searchText))
        );

        filteredEvents = this.sortPetition(filteredEvents);
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return filteredEvents.slice(start, end);
    },

    getTrackPetitionToDisplay(): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const trackList = Array.isArray(this.trackList) ? this.trackList : [];

        let filteredEvents = trackList.filter((listOfTrack: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfTrack.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(listOfTrack.subject_code).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(listOfTrack.subject_name).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(listOfTrack.status).includes(Extras.toLowerCaseSafe(this.searchText))
        );
        filteredEvents = this.sortPetition(filteredEvents);
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return filteredEvents.slice(start, end);
    },

    getReceivePetitionsToDisplay(): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const receiveList = Array.isArray(this.receiveList) ? this.receiveList : [];
        let filteredEvents = receiveList.filter((listOfTrack: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfTrack.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(listOfTrack.subject_code).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(listOfTrack.subject_name).includes(Extras.toLowerCaseSafe(this.searchText))
        );
        filteredEvents = this.sortPetition(filteredEvents);
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return filteredEvents.slice(start, end);
    },

    onSortChange(field: string): void {
        if (this.sortField === field) {
            // Toggle sort direction if the same field is clicked
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // Set the new field to sort by and default to ascending
            this.sortField = field;
            this.sortDirection = 'asc';
        }
    },


    get copyRightYear(): string {
        return new Date().getFullYear().toString();
    },

    sortPetition(transactions: any[]): any[] {
        return transactions.sort((a, b) => {
            if (this.sortDirection === 'asc') {
                return a[this.sortField] > b[this.sortField] ? 1 : -1;
            } else {
                return a[this.sortField] < b[this.sortField] ? 1 : -1;
            }
        });
    },

    updateSorting(field: string, direction: 'asc' | 'desc') {
        this.sortField = field;
        this.sortDirection = direction;
    },


    nextList(numberLength: number): void {
        if (numberLength > 0) {
            let length = numberLength / 10;
            if ((length) % 1 !== 0) {
                length = Math.floor(length);
            }
            else {
                length = length - 1;
            }
            if (this.pageIndex != length) {
                this.pageIndex++;
            }
            console.log(this.pageIndex)
        }
    },

    prevList(): void {
        if (this.pageIndex > 0) {
            this.pageIndex--;
        }
    },

    onSearchChange(value: string): void {
        this.searchText = value;
        this.pageIndex = 0; // Reset pagination to the first page
    },


    multiplierCounter(listLength: number): any[] {
        const remainder = listLength % 10;
        let listPlaceholder: any[] = [];
        let toAdd;
        if (remainder === 0 && listLength != 0) {
            toAdd = 0; // It's already divisible by 10
        } else {
            toAdd = 10 - remainder; // Number of elements to add to make it divisible by 10
        }
        for (let i = 0; i < toAdd; i++) {
            listPlaceholder[i] = i
        }
        return listPlaceholder
    }
};
