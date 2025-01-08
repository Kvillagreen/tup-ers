import { Extras } from "./environment";
export const dataViewer = {

    petitionTracker: [] as any[],
    classList: [] as any[],
    classListHistory: [] as any[],
    trackList: [] as any[],
    receiveList: [] as any[],
    notificationList: [] as any[],

    isFilterOn: false,
    searchText: '',
    sortField: '',
    sortDirection: 'asc' as 'asc' | 'desc',
    pageIndex: 0,
    pageSize: 10,
    facultyClassList: [] as any[],
    facultyClassListHistory: [] as any[],
    facultyTrackList: [] as any[],
    facultyReceiveList: [] as any[],
    facultyManagement: [] as any[],

    getFacultyToDisplay(): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const facultyList = Array.isArray(this.facultyManagement) ? this.facultyManagement : [];

        // Filter transactions based on search text
        let filteredEvents = facultyList.filter((listOfClass: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfClass.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.firstname)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.email)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.program)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.faculty_type)).includes(Extras.toLowerCaseSafe(this.searchText))
        );

        // Filter by program and status that is pending and approved
        filteredEvents = this.sortPetition(filteredEvents);

        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        return filteredEvents.slice(start, end);
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

    //filter and display the data for notification
    getNotificationList(status: string): any[] {
        this.searchText = typeof this.searchText === 'string' ? this.searchText : '';
        const notificationList = Array.isArray(this.notificationList) ? this.notificationList : [];

        // Filter notifications based on search text
        let filteredEvents = notificationList.filter((listOfClass: any) =>
            Extras.toLowerCaseSafe(Extras.formatDate(listOfClass.date_created)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.message)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.reasons)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.noted_by)).includes(Extras.toLowerCaseSafe(this.searchText)) ||
            Extras.toLowerCaseSafe(String(listOfClass.status)).includes(Extras.toLowerCaseSafe(this.searchText))
        );

        // Filter by specific status if provided
        if (status !== '') {
            filteredEvents = filteredEvents.filter((listOfClass: any) => listOfClass.status === status);
        } else {
            // Sort by unread first, then read if status is empty
            filteredEvents.sort((a: any, b: any) => {
                if (a.status === 'unread' && b.status === 'read') return -1; // Unread comes before read
                if (a.status === 'read' && b.status === 'unread') return 1;  // Read comes after unread
                return 0; // Maintain original order for same status
            });
        }
        filteredEvents.sort((a: any, b: any) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());

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
    },
}