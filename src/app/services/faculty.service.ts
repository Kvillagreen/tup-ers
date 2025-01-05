import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Environment } from '../common/environments/privateData';
@Injectable({
    providedIn: 'root'
})

export class FacultyService {
    constructor(private http: HttpClient) { }
    apiUrl = Environment.facultyUrl;

    getClass(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-class.php`, credentials);
    }

    getStudent(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-student.php`, credentials);
    }

    getPetitionPending(tokenId: string, classId: string) {
        const credentials = { tokenId, classId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-petition-pending.php`, credentials);
    }

    updateStudentService(tokenId: string, classId: string, petitionId: string, status: string, message: string, reasons: string, studentId: string, notedBy: string) {
        const credentials = { tokenId, classId, petitionId, status, message, reasons, studentId, notedBy }
        return this.http.post<any[]>(`${this.apiUrl}/update-petition-student.php`, credentials);
    }

    trackPetition(tokenId: string, studentId: string) {
        const credentials = { tokenId, studentId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-track-petition.php`, credentials);
    }


    getStudentsReport(tokenId: string, studentId: string) {
        const credentials = { tokenId, studentId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-students-report.php`, credentials);
    }

    receivePetition(tokenId: string, studentId: string) {
        const credentials = { tokenId, studentId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-receive-petition.php`, credentials);
    }

    petitionCreation(studentId: string, subjectCode: string, subjectName: string, subjectUnits: string, program: string) {
        const credentials = { studentId, subjectCode, subjectName, subjectUnits, program }
        return this.http.post<any[]>(`${this.apiUrl}/petition-creation.php`, credentials);
    }

    petitionApplicatipon(studentId: string, classId: string) {
        const credentials = { studentId, classId }
        return this.http.post<any[]>(`${this.apiUrl}/petition-application.php`, credentials);
    }

    tokenIdValidator(facultyId: string, email: string, tokenId: string) {
        const credentials = { facultyId, email, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/tokenId-validation.php`, credentials);
    }

    login(email: string, password: string) {
        const credentials = { email, password }
        return this.http.post<any[]>(`${this.apiUrl}/faculty-authentication.php`, credentials);
    }

    updateStudentsProfile(tupvId: string, studentId: string, tokenId: string, email: string, currentPassword: string, newPassword: string) {
        const credentials = { tupvId, studentId, tokenId, email, currentPassword, newPassword }
        return this.http.post<any[]>(`${this.apiUrl}/update-students-profile.php`, credentials);
    }
    register(firstName: string, lastName: string, email: string, password: string, faculty: string, program: string) {
        const credentials = { firstName, lastName, email, password, faculty, program }
        return this.http.post<any[]>(`${this.apiUrl}/faculty-registration.php`, credentials);
    }
}



