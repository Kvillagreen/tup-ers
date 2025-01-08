import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { privateData } from '../common/libraries/private-data';
@Injectable({
    providedIn: 'root'
})

export class FacultyService {
    constructor(private http: HttpClient, private privateData: privateData) { }
    apiUrl = this.privateData.facultyUrl;

    getClass(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-class.php`, credentials);
    }

    getStudent(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-student.php`, credentials);
    }

    otpVerification(email: string) {
      const credentials = { email }
      return this.http.post<any[]>(`${this.apiUrl}/otp-verification.php`, credentials);
    }

    getFaculty(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-faculty.php`, credentials);
    }
    getPetitionPending(tokenId: string, classId: string) {
        const credentials = { tokenId, classId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-petition-pending.php`, credentials);
    }

    getPetitionDenied(tokenId: string, classId: string) {
        const credentials = { tokenId, classId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-petition-denied.php`, credentials);
    }

    updateFaculty(status: string, facultyId: string, tokenId: string) {
        const credentials = { status, facultyId, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/update-faculty-status.php`, credentials);
    }

    updateStudentPetition(tokenId: string, classId: string, petitionId: string, status: string, message: string, reasons: string, studentId: string, notedBy: string) {
        const credentials = { tokenId, classId, petitionId, status, message, reasons, studentId, notedBy }
        return this.http.post<any[]>(`${this.apiUrl}/update-petition-student.php`, credentials);
    }

    tokenIdValidator(facultyId: string, email: string, tokenId: string) {
        const credentials = { facultyId, email, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/tokenId-validation.php`, credentials);
    }

    login(email: string, password: string) {
        const credentials = { email, password }
        return this.http.post<any[]>(`${this.apiUrl}/faculty-authentication.php`, credentials);
    }

    register(firstName: string, lastName: string, email: string, password: string, faculty: string, program: string) {
        const credentials = { firstName, lastName, email, password, faculty, program }
        return this.http.post<any[]>(`${this.apiUrl}/faculty-registration.php`, credentials);
    }
}



