import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TeamMoodResponse, MoodCategory } from '../../models/mood.model';
import { MoodService } from '../../services/mood.service';
import { MoodDialogComponent } from '../mood-dialog/mood-dialog.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-team-mood',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './team-mood.component.html',
  styleUrls: ['./team-mood.component.scss']
})
export class TeamMoodComponent implements OnInit {
  teamResponse: TeamMoodResponse = {
    teamMood: MoodCategory.NORMAL,
    teamMessages: []
  };
  
  teamCode: string = environment.defaultTeamCode;
  showTeamMood: boolean = false;
  
  constructor(
    private moodService: MoodService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    // Check if team data is available on component load
    this.checkTeamMood();
  }
  
  checkTeamMood(): void {
    this.moodService.initTeam(this.teamCode).subscribe({
      next: (response) => {
        console.log('Team init response:', response);
        
        // Only show team mood if we have actual data from the server
        // or if the user has already submitted their mood
        if (response.hasActualData || response.alreadySubmitted || response.isDuplicate) {
          this.showTeamMood = true;
          this.teamResponse = response;
        } else {
          // If it's just default data, don't show it
          console.log('No real team mood data available yet');
          this.showTeamMood = false;
        }
      },
      error: (error) => {
        console.error('Error checking team mood:', error);
        // Don't show error to user, just keep the default state
        this.showTeamMood = false;
      }
    });
  }
  
  openMoodDialog(): void {
    // Open the dialog directly without checking first
    const dialogRef = this.dialog.open(MoodDialogComponent, {
      width: '500px',
      data: { teamCode: this.teamCode }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If we have a result, it means the user submitted their mood
        // Update the team mood data
        this.showTeamMood = true;
        this.teamResponse = result;
      }
    });
  }

  private showAlreadySubmittedMessage(): void {
    this.snackBar.open('You have already submitted your mood for today!', 'OK', {
      duration: 5000,
      panelClass: 'info-snackbar'
    });
  }
} 