import { Routes } from '@angular/router';
import { LoginComponent } from './student/login/login.component';
import { AuthGuardService } from './services/auth-guard.service';
import { SignupComponent } from './student/signup/signup.component';
import { DashboardComponent } from './student/dashboard/dashboard.component';
import { ReceivePetitionComponent } from './student/receive-petition/receive-petition.component';
import { ViewPetitionComponent } from './student/view-petition/view-petition.component';
import { TrackPetitionComponent } from './student/track-petition/track-petition.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [AuthGuardService] },
    { path: 'signup', component: SignupComponent, canActivate: [AuthGuardService] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService] },
    { path: 'receive-petition', component: ReceivePetitionComponent, canActivate: [AuthGuardService] },
    { path: 'view-petition', component: ViewPetitionComponent, canActivate: [AuthGuardService] },
    { path: 'track-petition', component: TrackPetitionComponent, canActivate: [AuthGuardService] },

    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
