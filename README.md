# Mood Tracker Application

A modern Angular application with Material UI for tracking team moods, connecting to a Spring Boot backend.

## Features

- Clean, responsive UI built with Angular Material
- Team mood tracking with emoji selection
- Anonymous comment submission
- Team mood visualization
- Cookie-based session tracking

## Project Structure

- **Components**:
  - Header: Top navigation bar with mood tracker button
  - Mood Dialog: Dialog for submitting mood and comments
  - Team Mood: Component for displaying team mood data

- **Services**:
  - Mood Service: Handles API calls to the backend

- **Models**:
  - Mood models for data structure

- **Interceptors**:
  - Cookie interceptor for proper cookie handling

## API Integration

The application connects to a Spring Boot backend with two endpoints:
1. POST /internal-api/init-team - Initializes the team session
2. POST /internal-api/moods - Submits a mood entry

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mood-tracker-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Configuration

The application is configured to connect to a backend API. You can modify the API endpoints in the `src/environments/environment.ts` file.

## Building for Production

```bash
ng build --configuration production
```

## Running Tests

```bash
ng test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
