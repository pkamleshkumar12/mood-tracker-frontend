import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MoodDialogComponent } from '../mood-dialog/mood-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MoodService } from '../../services/mood.service';
import { environment } from '../../../environments/environment';

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
  
  constructor(
    private dialog: MatDialog,
    private moodService: MoodService,
    private snackBar: MatSnackBar
  ) {}

  openMoodDialog(): void {
    const dialogRef = this.dialog.open(MoodDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { teamCode: this.teamCode }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      // Handle the result if needed
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