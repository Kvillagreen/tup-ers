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

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [PreventLoginGuard] },
    { path: 'signup', component: SignupComponent, canActivate: [PreventLoginGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'receive-petition', component: ReceivePetitionComponent, canActivate: [AuthGuard] },
    { path: 'view-petition', component: ViewPetitionComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'track-petition', component: TrackPetitionComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
