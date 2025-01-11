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

    transferFaculty(tokenId: string, classId: string, petitionId: string) {
        const credentials = { tokenId, classId, petitionId }
        return this.http.post<any[]>(`${this.apiUrl}/transfer-faculty.php`, credentials);
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

    updateClassStatus(tokenId: string, classId: string, status: string) {
        const credentials = { tokenId, classId, status }
        return this.http.post<any[]>(`${this.apiUrl}/update-class-status.php`, credentials);
    }

    finalApprovalPetition(tokenId: string, classId: string) {
        const credentials = { tokenId, classId, }
        return this.http.post<any[]>(`${this.apiUrl}/petition-final-approval.php`, credentials);
    }

    getStudentManagement(tokenId: string) {
        const credentials = { tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-student-management.php`, credentials);
    }

    fetchSchedule(tokenId: string, facultyId: string) {
        const credentials = { tokenId, facultyId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-schedule.php`, credentials);
    }

    updateTrackerPetitioon(tokenId: string, classId: string, facultyType: string) {
        const credentials = { tokenId, classId, facultyType }
        return this.http.post<any[]>(`${this.apiUrl}/update-petition-tracker.php`, credentials);
    }

    addSchedule(tokenId: string, classId: string, schedule: any, facultyId: string) {
        const credentials = { tokenId, classId, schedule, facultyId }
        return this.http.post<any[]>(`${this.apiUrl}/add-schedule.php`, credentials);
    }

    generalPetitionApproval(tokenId: string, classId: string, location: string) {
        const credentials = { tokenId, classId, location }
        return this.http.post<any[]>(`${this.apiUrl}/general-petition-approval.php`, credentials);
    }


    getPetitionDenied(tokenId: string, classId: string) {
        const credentials = { tokenId, classId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-petition-denied.php`, credentials);
    }

    updateFaculty(status: string, facultyId: string, tokenId: string) {
        const credentials = { status, facultyId, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/update-faculty-status.php`, credentials);
    }

    updateStudent(status: string, studentId: string, tokenId: string) {
        const credentials = { status, studentId, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/update-student-status.php`, credentials);
    }

    updateFacultyProfile(facultyId: string, tokenId: string, email: string, currentPassword: string, newPassword: string) {
        const credentials = { facultyId, tokenId, email, currentPassword, newPassword }
        return this.http.post<any[]>(`${this.apiUrl}/update-faculty-profile.php`, credentials);
    }


    fetchDepartment(classId: string, tokenId: string) {
        const credentials = { classId, tokenId }
        return this.http.post<any[]>(`${this.apiUrl}/fetch-department.php`, credentials);
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



