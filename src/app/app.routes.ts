import { Routes } from '@angular/router';
import { LoginComponent } from './student/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { SignupComponent } from './student/signup/signup.component';
import { DashboardComponent } from './student/dashboard/dashboard.component';
import { ReceivePetitionComponent } from './student/receive-petition/receive-petition.component';
import { ViewPetitionComponent } from './student/view-petition/view-petition.component';
import { TrackPetitionComponent } from './student/track-petition/track-petition.component';
import { PreventLoginGuard } from './services/prevent-login.guard';
import { ProfileComponent } from './student/profile/profile.component';
import { FacultyLoginComponent } from './faculty/faculty-login/faculty-login.component';
import { FacultySignupComponent } from './faculty/faculty-signup/faculty-signup.component';
import { PreventAdminLogin } from './services/prevent-admin-login.guard';
import { FacultyDashboardComponent } from './faculty/faculty-dashboard/faculty-dashboard.component';
import { AuthAdminGuard } from './services/auth-admin.guard';
import { ForgetPasswordComponent } from './student/forget-password/forget-password.component';
import { FacultyForgetPasswordComponent } from './faculty/faculty-forget-password/faculty-forget-password.component';
import { FacultyProfileComponent } from './faculty/faculty-profile/faculty-profile.component';
import { FacultyViewPetitionComponent } from './faculty/faculty-view-petition/faculty-view-petition.component';
import { FacultyReportPetitionComponent } from './faculty/faculty-report-petition/faculty-report-petition.component';
import { HistoryComponent } from './student/history/history.component';
import { NotificationComponent } from './student/notification/notification.component';
import { StudentManagementComponent } from './faculty/student-management/student-management.component';
import { FacultyManagementComponent } from './faculty/faculty-management/faculty-management.component';
import { FacultyHistoryComponent } from './faculty/faculty-history/faculty-history.component';
export const routes: Routes = [
  // Student routes
  {
    path: '',
    children: [
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, canActivate: [PreventLoginGuard] },
      { path: 'signup', component: SignupComponent, canActivate: [PreventLoginGuard] },
      { path: 'forget-password', component: ForgetPasswordComponent, canActivate: [PreventLoginGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'received-petition', component: ReceivePetitionComponent, canActivate: [AuthGuard] },
      { path: 'view-petition', component: ViewPetitionComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
      { path: 'messages', component: NotificationComponent, canActivate: [AuthGuard] },
      { path: 'track-petition', component: TrackPetitionComponent, canActivate: [AuthGuard] },
    ]
  },
  // Faculty routes
  {
    path: 'faculty',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: FacultyLoginComponent, canActivate: [PreventAdminLogin] },
      { path: 'signup', component: FacultySignupComponent, canActivate: [PreventAdminLogin] },
      { path: 'forget-password', component: FacultyForgetPasswordComponent, canActivate: [PreventAdminLogin] },
      { path: 'profile', component: FacultyProfileComponent, canActivate: [AuthAdminGuard] },
      { path: 'view-petition', component: FacultyViewPetitionComponent, canActivate: [AuthAdminGuard] },
      { path: 'dashboard', component: FacultyDashboardComponent, canActivate: [AuthAdminGuard] },
      { path: 'student-management', component: StudentManagementComponent, canActivate: [AuthAdminGuard] },
      { path: 'faculty-management', component: FacultyManagementComponent, canActivate: [AuthAdminGuard] },
      { path: 'faculty-history', component: FacultyHistoryComponent, canActivate: [AuthAdminGuard] },
      { path: 'report', component: FacultyReportPetitionComponent, canActivate: [AuthAdminGuard] },
      { path: '**', redirectTo: '/faculty/login', pathMatch: 'full' },
    ]
  },
  // Wildcard route
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
