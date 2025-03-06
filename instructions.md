# Mood Tracker Application - Setup Instructions

This document provides instructions for setting up and running the Mood Tracker application using either Docker (recommended) or manual installation.

## 1. How to Run with Docker (Recommended Way)

Running the application with Docker is the recommended approach as it ensures consistent environments and simplifies the setup process.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

### Steps

1. **Open source code**

   ```bash
   cd mood-tracker-frontend
   ```

2. **Build and run the application using Docker Compose**

   ```bash
   docker-compose up -d
   ```

   This command will:
   - Build the Docker image based on the Dockerfile
   - Start the container in detached mode
   - Map port 4200 on your host to port 80 in the container

3. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

4. **Stop the application**

   When you're done using the application, you can stop it with:
   ```bash
   docker-compose down
   ```

### Additional Docker Commands

- **View logs**
  ```bash
  docker-compose logs -f
  ```

- **Rebuild the application after changes**
  ```bash
  docker-compose up -d --build
  ```

### Customizing Nginx Configuration

The Docker setup includes a custom Nginx configuration (`nginx.conf`) that handles Angular routing and optimizes performance. If you need to modify this configuration:

1. Edit the `nginx.conf` file in the project root
2. Rebuild the Docker image:
   ```bash
   docker-compose up -d --build
   ```

## 2. How to Run Manually Without Docker

If you prefer to run the application directly on your machine, follow these steps:

### Prerequisites

- Node.js version 20.x
- npm (included with Node.js)

### Steps

1. **Install Node.js 20**

   **Using NVM (recommended):**
   ```bash
   # Install NVM if you don't have it already
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   # or using wget
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   
   # Reload shell configuration
   source ~/.bashrc  # or source ~/.zshrc for Zsh
   
   # Install and use Node.js 20
   nvm install 20
   nvm use 20
   ```

   **Direct installation:**
   Download and install from [Node.js official website](https://nodejs.org/)

2. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mood-tracker-frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Run the development server**

   ```bash
   ng serve
   ```
   
   If you don't have Angular CLI installed globally, you can use:
   ```bash
   npx ng serve
   ```
   
   or
   
   ```bash
   npm start
   ```

5. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

### Building for Production

To create a production build:

```bash
npm run build -- --configuration production
```

The build artifacts will be stored in the `dist/mood-tracker/browser` directory.

To serve the production build locally, you can use a simple HTTP server:

```bash
# Install a simple HTTP server if you don't have one
npm install -g http-server

# Navigate to the build directory
cd dist/mood-tracker/browser

# Serve the application (with routing support)
http-server -p 8080 --proxy http://localhost:8080?
```

Then access the application at `http://localhost:8080`.

### Running Tests

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   If port 4200 is already in use, you can specify a different port:
   
   **With Docker:**
   Edit the `docker-compose.yml` file and change the port mapping:
   ```yaml
   ports:
     - "4201:80"  # Change 4201 to any available port
   ```
   
   **Without Docker:**
   ```bash
   ng serve --port 4201
   ```

2. **Node version issues**

   If you encounter errors related to Node.js version, ensure you're using Node.js 20:
   ```bash
   node --version
   ```
   
   If using nvm:
   ```bash
   nvm use 20
   ```

3. **API Connection Issues**

   The application expects a backend API running at the URL specified in the environment configuration. Make sure the API is running and accessible.

4. **Routing issues in production build**

   If you're experiencing routing issues with the production build, ensure you're using a server that supports HTML5 routing. The included Nginx configuration in the Docker setup handles this automatically. 