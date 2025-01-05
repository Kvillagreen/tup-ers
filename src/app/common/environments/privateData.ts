export const Environment = {
    //url: 'https://tup-ers.infotech3c.com/services/',
    url: 'http://localhost/tup-ers/php-folder/',
    get studentUrl(): string {
        return this.url + 'student';
    },
    get facultyUrl(): string {
        return this.url + 'faculty';
    },

    get emailServiceUrl(): string {
        return this.url + 'email-service';
    },
    backgroundUrl: 'http://localhost/tup-ers/src/assets/background.jpg',
    hostEmail: 'admin@tup-ers.infotech3c.com',
    hostPassword: 'Villagreen23.', 
};
