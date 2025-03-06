import { Routes } from '@angular/router';
import { TeamMoodComponent } from './components/team-mood/team-mood.component';

export const routes: Routes = [
  { path: '', component: TeamMoodComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
