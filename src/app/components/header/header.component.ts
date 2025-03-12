import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MoodDialogComponent } from '../mood-dialog/mood-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MoodService } from '../../services/mood.service';
import { environment } from '../../../environments/environment';
import { TeamMoodResponse } from '../../models/mood.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Default team code from environment
  private teamCode: string = environment.defaultTeamCode;
  private teamResponse: TeamMoodResponse | null = null;
  
  constructor(
    private dialog: MatDialog,
    private moodService: MoodService,
    private snackBar: MatSnackBar
  ) {
    // Get initial team response when component is created
    this.moodService.initTeam(this.teamCode).subscribe({
      next: (response) => {
        this.teamResponse = response;
      },
      error: (error) => {
        console.error('Error getting team response:', error);
      }
    });
  }

  openMoodDialog(): void {
    const dialogRef = this.dialog.open(MoodDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { 
        teamCode: this.teamCode,
        initialTeamResponse: this.teamResponse 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.teamResponse = result;
      }
    });
  }

  private showAlreadySubmittedMessage(): void {
    this.snackBar.open('You have already submitted your mood for today!', 'OK', {
      duration: 5000,
      panelClass: 'info-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center'
    });
  }
} 