import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  MoodCategory, 
  MoodSubmission, 
  TeamMoodResponse, 
  ApiTeamMoodResponse,
  ApiErrorResponse,
  mapApiResponseToTeamMoodResponse
} from '../models/mood.model';

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }
  
  initTeam(teamCode: string): Observable<TeamMoodResponse> {
    // Transform to match API spec
    const payload = {
      team_code: teamCode
    };
    
    return this.http.post<ApiTeamMoodResponse>(
      `${this.apiUrl}${environment.endpoints.initTeam}`, 
      payload,
      { withCredentials: true } // Explicitly set withCredentials
    ).pipe(
      map(response => {
        // Check if response is valid and has actual data
        if (!response || (!response.team_mood && !response.team_messages)) {
          console.warn('Received empty or invalid response from initTeam API');
          // Return a response that indicates no data is available
          return {
            teamMood: MoodCategory.NORMAL,
            teamMessages: [],
            alreadySubmitted: false,
            isDuplicate: false,
            hasActualData: false // Add a flag to indicate this is just default data
          };
        }
        
        // Map the response and indicate it has actual data
        const mappedResponse = mapApiResponseToTeamMoodResponse(response);
        return {
          ...mappedResponse,
          hasActualData: true // Add a flag to indicate this is actual data from the server
        };
      }),
      catchError(error => this.handleError(error))
    );
  }
  
  submitMood(submission: MoodSubmission): Observable<TeamMoodResponse> {
    // Transform to match API spec
    const payload = {
      team_code: submission.teamCode,
      mood_category: submission.moodCategory,
      mood_description: submission.moodDescription
    };
    
    return this.http.post<ApiTeamMoodResponse>(
      `${this.apiUrl}${environment.endpoints.moods}`, 
      payload,
      { 
        withCredentials: true, // Explicitly set withCredentials
        observe: 'response' // Get the full response including headers
      }
    ).pipe(
      map(response => {
        // Check if response body is valid
        if (!response.body) {
          console.warn('Received null body from submitMood API');
          return mapApiResponseToTeamMoodResponse(null);
        }
        return mapApiResponseToTeamMoodResponse(response.body as ApiTeamMoodResponse);
      }),
      catchError(error => this.handleError(error))
    );
  }
  
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    // Check for duplicate submission (429 status code)
    if (error.status === 429) {
      try {
        // Extract team mood and messages from error response
        const errorResponse = error.error as ApiTeamMoodResponse;
        // Handle case where error.error might be null
        const teamResponse = errorResponse ? 
          mapApiResponseToTeamMoodResponse(errorResponse) : 
          mapApiResponseToTeamMoodResponse(null);
        
        // Get the error message from the header
        const errorMessage = error.headers?.get('X-Error-Message') || 
                            'You have already submitted your mood for today.';
        
        // Mark as duplicate submission
        return throwError(() => {
          return {
            ...teamResponse,
            isDuplicate: true,
            duplicateMessage: errorMessage,
            status: 429
          };
        });
      } catch (e) {
        console.error('Error parsing duplicate submission response:', e);
      }
    }
    
    // For network errors or other client-side errors
    if (error.status === 0) {
      return throwError(() => {
        return {
          errorCode: 0,
          message: 'Network error or client-side error occurred',
          isNetworkError: true,
          status: 0
        };
      });
    }
    
    // Handle specific API error responses
    if (error.error && error.error.error_code) {
      const apiError = error.error as ApiErrorResponse;
      
      // Map specific error codes to user-friendly messages
      let userMessage = apiError.message;
      
      switch (apiError.error_code) {
        case 40001: // Invalid request parameters
          userMessage = apiError.message || 'Invalid request parameters. Please check your input.';
          break;
        case 40101: // Unauthorized
          userMessage = 'Unauthorized access. Please log in again.';
          break;
        case 40301: // Invalid HMAC signature
          userMessage = 'Security validation failed. Please refresh and try again.';
          break;
        case 40401: // Team not registered
          userMessage = 'Team not found. Please check your team code.';
          break;
        case 42901: // Too many initialization attempts
          userMessage = 'Too many requests. Please try again later.';
          break;
        default:
          userMessage = apiError.message || 'An error occurred. Please try again.';
      }
      
      return throwError(() => {
        return {
          errorCode: apiError.error_code,
          message: userMessage,
          httpStatus: apiError.http_status_code,
          status: error.status,
          originalError: apiError
        };
      });
    }
    
    // For all other errors
    return throwError(() => {
      return {
        errorCode: error.status,
        message: error.message || 'Unknown error occurred',
        httpStatus: error.status,
        status: error.status
      };
    });
  }
} 