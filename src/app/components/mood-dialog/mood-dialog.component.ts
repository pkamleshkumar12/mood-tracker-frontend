import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { MoodService } from '../../services/mood.service';
import { MoodCategory, MoodSubmission, TeamMoodResponse } from '../../models/mood.model';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';

// Remove the circular dependency
// import { TeamMoodComponent } from '../team-mood/team-mood.component';

interface DialogData {
  teamCode: string;
  initialTeamResponse?: TeamMoodResponse;
}

@Component({
  selector: 'app-mood-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
    // Remove TeamMoodComponent from imports
  ],
  templateUrl: './mood-dialog.component.html',
  styleUrls: ['./mood-dialog.component.scss']
})
export class MoodDialogComponent implements OnInit, OnDestroy {
  moodForm!: FormGroup;
  moodCategories = Object.values(MoodCategory);
  maxCommentLength = 350;
  isLoading = false;
  isSubmitted = false;
  teamResponse: TeamMoodResponse | null = null;
  alreadySubmittedToday = false;
  teamCode: string;
  
  // Carousel properties
  currentMessageIndex = 0;
  carouselInterval: Subscription | null = null;
  
  currentCommentIndex = 0;
  private commentRotationInterval: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MoodDialogComponent>,
    private moodService: MoodService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.teamCode = data.teamCode;
  }

  ngOnInit(): void {
    this.createForm();
    
    // Use initial team response if provided, otherwise initialize
    if (this.data.initialTeamResponse) {
      this.teamResponse = this.data.initialTeamResponse;
      this.handleTeamResponse(this.teamResponse);
    } else {
      this.tryInitTeam();
    }
    
    // Start the comment rotation if there are comments
    this.startCommentRotation();
  }
  
  ngOnDestroy(): void {
    // Clean up the carousel interval when component is destroyed
    this.stopCarousel();
    
    // Clear the rotation interval when component is destroyed
    this.stopCommentRotation();
  }

  createForm(): void {
    this.moodForm = this.fb.group({
      moodCategory: ['', Validators.required],
      moodDescription: ['', [Validators.maxLength(this.maxCommentLength)]]
    });
  }

  tryInitTeam(): void {
    this.isLoading = true;
    this.moodService.initTeam(this.teamCode)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Team initialized:', response);
          
          // Check if this is a duplicate submission response
          if (response.isDuplicate) {
            this.alreadySubmittedToday = true;
            this.isSubmitted = true; // Show the team mood summary
            this.teamResponse = response;
            this.snackBar.open(response.duplicateMessage || 'You have already submitted your mood for today!', 'OK', {
              duration: 5000,
              panelClass: 'info-snackbar',
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            
            // Start the carousel if there are messages
            this.startCarouselIfNeeded();
          } else if (response.alreadySubmitted) {
            // Legacy check for backward compatibility
            this.alreadySubmittedToday = true;
            this.isSubmitted = true; // Show the team mood summary
            this.teamResponse = response;
            
            // Start the carousel if there are messages
            this.startCarouselIfNeeded();
          }
          
          // After setting teamResponse, start the comment rotation
          this.startCommentRotation();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error initializing team:', error);
          
          // Check if this is a duplicate submission (429 status code)
          if (error.status === 429 && error.isDuplicate) {
            this.alreadySubmittedToday = true;
            this.isSubmitted = true; // Show the team mood summary
            this.teamResponse = error; // Use the team data from the error
            
            // Show duplicate message
            this.snackBar.open(error.duplicateMessage || 'You have already submitted your mood for today!', 'OK', {
              duration: 5000,
              panelClass: 'info-snackbar',
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            
            // Start the carousel if there are messages
            this.startCarouselIfNeeded();
          } else {
            // Display the specific error message from the API
            const errorMessage = error.message || 'Could not initialize team. Please try again later.';
            const errorClass = error.status === 404 ? 'warning-snackbar' : 'error-snackbar';
            
            this.snackBar.open(errorMessage, 'OK', {
              duration: 5000,
              panelClass: errorClass,
              verticalPosition: 'top',
              horizontalPosition: 'center'
            });
            
            console.log('Could not initialize team:', error);
          }
          
          // After setting teamResponse, start the comment rotation
          this.startCommentRotation();
        }
      });
  }

  onSubmit(): void {
    if (this.moodForm.valid) {
      this.isLoading = true;
      
      const submission: MoodSubmission = {
        teamCode: this.teamCode,
        moodCategory: this.moodForm.value.moodCategory,
        moodDescription: this.moodForm.value.moodDescription
      };
      
      this.moodService.submitMood(submission)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.isSubmitted = true;
            this.alreadySubmittedToday = false; // Make sure this is false for new submissions
            this.teamResponse = response;
            
            console.log('Mood submitted successfully:', response);
            
            // Start the carousel if there are messages
            this.startCarouselIfNeeded();
            
            // After setting teamResponse, start the comment rotation
            this.startCommentRotation();
          },
          error: (error) => {
            this.isLoading = false;
            
            // Check if this is a duplicate submission (429 status code)
            if (error.status === 429 && error.isDuplicate) {
              this.alreadySubmittedToday = true;
              this.isSubmitted = true; // Show the success view with team data
              this.teamResponse = error; // Use the team data from the error
              
              console.log('Duplicate submission detected:', error);
              
              // Show duplicate message
              this.snackBar.open(error.duplicateMessage || 'You have already submitted your mood for today!', 'OK', {
                duration: 5000,
                panelClass: 'info-snackbar',
                verticalPosition: 'top',
                horizontalPosition: 'center'
              });
              
              // Start the carousel if there are messages
              this.startCarouselIfNeeded();
            } else {
              // Show the specific error message from the API
              console.error('Error submitting mood:', error);
              
              // Determine the appropriate snackbar class based on error type
              let snackbarClass = 'error-snackbar';
              if (error.status === 404) {
                snackbarClass = 'warning-snackbar';
              } else if (error.status === 400) {
                snackbarClass = 'warning-snackbar';
              }
              
              this.snackBar.open(error.message || 'Failed to submit mood. Please try again later.', 'Close', {
                duration: 5000,
                panelClass: snackbarClass,
                verticalPosition: 'top',
                horizontalPosition: 'center'
              });
            }
            
            // After setting teamResponse, start the comment rotation
            this.startCommentRotation();
          }
        });
    }
  }

  getRemainingCharacters(): number {
    const description = this.moodForm.get('moodDescription')?.value || '';
    return this.maxCommentLength - description.length;
  }

  closeDialog(): void {
    // Stop the carousel when closing the dialog
    this.stopCarousel();
    
    // If we have a team response and the user has submitted or already submitted,
    // pass the response back to the parent component
    if (this.teamResponse && (this.isSubmitted || this.alreadySubmittedToday)) {
      this.dialogRef.close(this.teamResponse);
    } else {
      // Otherwise just close the dialog without passing data
      this.dialogRef.close();
    }
    
    // Stop the comment rotation when closing
    this.stopCommentRotation();
  }
  
  // Carousel methods
  startCarouselIfNeeded(): void {
    // Only start the carousel if we have team messages
    if (this.teamResponse && this.teamResponse.teamMessages && this.teamResponse.teamMessages.length > 1) {
      this.stopCarousel(); // Stop any existing carousel
      
      // Start a new interval that changes the message every 2 seconds
      this.carouselInterval = interval(2000).subscribe(() => {
        this.nextMessage();
      });
    }
  }
  
  stopCarousel(): void {
    if (this.carouselInterval) {
      this.carouselInterval.unsubscribe();
      this.carouselInterval = null;
    }
  }
  
  nextMessage(): void {
    if (this.teamResponse && this.teamResponse.teamMessages) {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.teamResponse.teamMessages.length;
    }
  }
  
  setCurrentMessage(index: number): void {
    this.currentMessageIndex = index;
    
    // Reset the interval when manually changing the message
    this.stopCarousel();
    this.startCarouselIfNeeded();
  }
  
  /**
   * Sets the current comment index for the carousel
   */
  setCurrentComment(index: number): void {
    this.currentCommentIndex = index;
    // Reset the rotation timer when manually changing comments
    this.restartCommentRotation();
  }
  
  /**
   * Starts automatic rotation of comments
   */
  private startCommentRotation(): void {
    // Only start if we have team messages
    if (this.teamResponse && this.teamResponse.teamMessages && this.teamResponse.teamMessages.length > 1) {
      this.commentRotationInterval = setInterval(() => {
        if (this.teamResponse && this.teamResponse.teamMessages) {
          this.currentCommentIndex = (this.currentCommentIndex + 1) % this.teamResponse.teamMessages.length;
        }
      }, 3000); // Rotate every 3 seconds
    }
  }
  
  /**
   * Stops the comment rotation
   */
  private stopCommentRotation(): void {
    if (this.commentRotationInterval) {
      clearInterval(this.commentRotationInterval);
      this.commentRotationInterval = null;
    }
  }
  
  /**
   * Restarts the comment rotation
   */
  private restartCommentRotation(): void {
    this.stopCommentRotation();
    this.startCommentRotation();
  }

  private handleTeamResponse(response: TeamMoodResponse): void {
    if (response.isDuplicate || response.alreadySubmitted) {
      this.alreadySubmittedToday = true;
      this.isSubmitted = true;
      
      if (response.isDuplicate) {
        this.snackBar.open(response.duplicateMessage || 'You have already submitted your mood for today!', 'OK', {
          duration: 5000,
          panelClass: 'info-snackbar',
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
      
      this.startCarouselIfNeeded();
    }
  }
} 