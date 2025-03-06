export enum MoodCategory {
  HAPPY = 'Happy',
  NORMAL = 'Just normal really',
  MEH = 'A Bit meh',
  GRUMPY = 'Grumpy',
  STRESSED = 'Stressed out – not a happy camper'
}

export interface MoodSubmission {
  teamCode: string;
  moodCategory: MoodCategory;
  moodDescription?: string;
}

// Interface matching the API response
export interface ApiTeamMoodResponse {
  team_mood: string;
  team_messages: string[];
}

// Interface for API error responses
export interface ApiErrorResponse {
  error_code: number;
  message: string;
  http_status_code: number;
}

export interface TeamMoodResponse {
  teamMood: MoodCategory;
  teamMessages: string[];
  alreadySubmitted?: boolean;
  isDuplicate?: boolean;
  duplicateMessage?: string;
  status?: number;
  hasActualData?: boolean; // Flag to indicate if this is actual data from the server
}

// Helper function to convert API response to our model
export function mapApiResponseToTeamMoodResponse(apiResponse: ApiTeamMoodResponse | null): TeamMoodResponse {
  // If apiResponse is null or undefined, return a default response
  if (!apiResponse) {
    return {
      teamMood: MoodCategory.NORMAL,
      teamMessages: [],
      alreadySubmitted: false,
      isDuplicate: false,
      hasActualData: false
    };
  }
  
  // Check if this is actual data or just an empty response
  const hasActualData = !!apiResponse.team_mood || 
    (apiResponse.team_messages && apiResponse.team_messages.length > 0);
  
  return {
    teamMood: apiResponse.team_mood as MoodCategory,
    teamMessages: apiResponse.team_messages || [],
    alreadySubmitted: false, // This will be set based on cookie or response header
    isDuplicate: false, // This will be set based on the first message
    hasActualData: hasActualData
  };
} 