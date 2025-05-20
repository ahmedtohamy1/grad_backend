# Smart Vehicle Control System API

A comprehensive backend API for managing smart vehicle operations with real-time location tracking, camera control, and remote vehicle movement.

![Smart Vehicle Control System Architecture](https://mermaid.ink/img/pako:eNqNkk9PwzAMxb9KlBMIaZM6dRdOSAj1wGFIcOLSpE5rjTYpSVCnqu--pGNsY0gc_OzYv_fsNKdCCwQSxzKvtLEsN1LVzplKz2GrweLj0TP1JJ3KDOYguAVtI69omJc7WD7N8XuxWP6sVhj8A5_Gu34YQXAwjUOCkbcfwTgNYYKHH1Q5PnZBfHqKMfQevX5PCH0CdyWdDNGzJdWj8SDM6KGZTqgQ9kYY2hRRdMVsHvXFMDxcH_vpzR6ZVNk2JzfSyZ5EsBjNhj6JEk9bMpkK7rkV7ZjOiGQqukVRbpShqq0r0WjouQZ47DwU-lrauPuhiDcOGjFH7oT5dDEVUltMSG2Mm1oasRFurx03xN95QkYfDTmD2iDZ1LFLNRTbmlj7A-WChYJGx4YtZUJeN-jvqCL52hTVmnyRy8p25P-pELrVUHtS3pEWCmOcVqYhD9c0HoXOtEWyA5sJaXFLr2cFKW4b0YAk2SlXvFbupF5rUxLsmVyTa44ZZdTQcKbHOHJ-f3wBTdjt7Q)

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Setup and Deployment](#setup-and-deployment)
- [Performance Considerations](#performance-considerations)
- [Monitoring and Logging](#monitoring-and-logging)

## Overview

The Smart Vehicle Control System API provides a robust backend interface for controlling and monitoring autonomous vehicles. It enables:

- **Real-time Location Tracking**: Record and retrieve vehicle positions with status information
- **Remote Vehicle Control**: Send directional commands (forward, backward, left, right, stop)
- **Camera Management**: Toggle multiple onboard cameras independently or simultaneously
- **Hardware Authentication**: Secure vehicle access with authentication mechanisms

This system is ideal for:

- Autonomous delivery vehicles
- Remote inspection drones
- Security patrol vehicles
- Research and development platforms

## System Architecture

The backend follows a modular architecture with clear separation of concerns:

```
src/
  ├── config/        # Application and database configuration
  ├── controllers/   # Request handlers and business logic
  ├── models/        # Data models and validation
  ├── routes/        # API endpoint definitions
  ├── middleware/    # Request processing, validation, error handling
  ├── utils/         # Utility functions and helpers
  ├── db/            # Database initialization and migration
  └── server.js      # Application entry point
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Controller
    participant Model
    participant Database

    Client->>API Gateway: HTTP Request
    API Gateway->>API Gateway: Apply Middleware (Validation, Security)
    API Gateway->>Controller: Forward Request
    Controller->>Model: Process Data
    Model->>Database: Query/Update
    Database->>Model: Return Results
    Model->>Controller: Return Processed Data
    Controller->>API Gateway: Format Response
    API Gateway->>Client: HTTP Response
```

## Database Schema

The system uses SQLite for data persistence with the following schema:

### Entity Relationship Diagram

```mermaid
erDiagram
    LOCATIONS {
        int id PK
        string latitude
        string longitude
        string status
        datetime created_at
    }

    CAR_CONTROLS {
        int id PK
        string action
        datetime created_at
    }

    CAMERA_CONTROLS {
        int id PK
        string status
        datetime created_at
    }

    HW_AUTHS {
        int id PK
        int status
        datetime created_at
    }

    USERS {
        int id PK
        string email UK
        string name
        string password
        string type
        string profile_img
        string car_img
        string car_name
        datetime created_at
    }

    USER_PREFERENCES {
        int user_id PK,FK
        int dark_mode
    }

    USER_RELATIONSHIPS {
        int id PK
        int owner_id FK
        int relative_id FK
        datetime created_at
    }

    USERS ||--o{ USER_RELATIONSHIPS : "car owner has"
    USERS }o--|| USER_PREFERENCES : "has"
    USERS ||--o{ USER_RELATIONSHIPS : "is relative in"
```

### Tables Description

| Table              | Purpose                           | Fields                                                                      |
| ------------------ | --------------------------------- | --------------------------------------------------------------------------- |
| locations          | Stores vehicle position data      | id, latitude, longitude, status, created_at                                 |
| car_controls       | Records movement commands         | id, action, created_at                                                      |
| camera_controls    | Manages camera states             | id, status, created_at                                                      |
| hw_auths           | Tracks authentication status      | id, status, created_at                                                      |
| users              | Stores user account information   | id, email, name, password, type, profile_img, car_img, car_name, created_at |
| user_preferences   | Stores user interface preferences | user_id, dark_mode                                                          |
| user_relationships | Links car owners with relatives   | id, owner_id, relative_id, created_at                                       |

## API Endpoints

### Location Management

```mermaid
graph TD
    A[Client] --> B[POST /api/location]
    A --> C[GET /api/location]
    A --> D[GET /api/location/all]
    A --> E[GET /api/location/:id]

    B --> F[Save Location]
    C --> G[Get Latest Location]
    D --> H[Get All Locations]
    E --> I[Get Location by ID]

    F --> J[Database]
    G --> J
    H --> J
    I --> J
```

- `POST /api/location` - Save a new location
  - Required body: `{ "latitude": "37.7749", "longitude": "-122.4194", "status": "active" }`
  - Status values: "active", "idle", "emergency", "maintenance", etc.
- `GET /api/location` - Get the most recent location entry
- `GET /api/location/all` - Get all location entries
- `GET /api/location/:id` - Get location by ID

### Vehicle Control

```mermaid
graph TD
    A[Client] --> B[POST /api/car-control]
    A --> C[GET /api/car-control]
    A --> D[GET /api/car-control/all]
    A --> E[GET /api/car-control/:id]

    B --> F[Execute Command]
    C --> G[Get Latest Command]
    D --> H[Get Command History]
    E --> I[Get Command by ID]

    F --> J[Database]
    G --> J
    H --> J
    I --> J
```

- `POST /api/car-control` - Save a new car control action
  - Required body: `{ "action": "1" }`
  - Valid actions:
    - `1` - Forward movement
    - `2` - Backward movement
    - `3` - Right turn
    - `4` - Left turn
    - `5` - Emergency stop
- `GET /api/car-control` - Get the most recent car control action
- `GET /api/car-control/all` - Get all car control actions
- `GET /api/car-control/:id` - Get car control action by ID

### Camera Management

```mermaid
graph TD
    A[Client] --> B[POST /api/camera-control]
    A --> C[GET /api/camera-control]
    A --> D[GET /api/camera-control/all]
    A --> E[GET /api/camera-control/:id]

    B --> F[Change Camera State]
    C --> G[Get Current State]
    D --> H[Get State History]
    E --> I[Get State by ID]

    F --> J[Database]
    G --> J
    H --> J
    I --> J
```

- `POST /api/camera-control` - Save a new camera control status
  - Required body: `{ "status": 11 }`
  - Valid status codes:
    - `11` - First camera on
    - `12` - First camera off
    - `13` - Second camera on
    - `14` - Second camera off
    - `15` - Both cameras on
    - `16` - Both cameras off
- `GET /api/camera-control` - Get the most recent camera control status
- `GET /api/camera-control/all` - Get all camera control statuses
- `GET /api/camera-control/:id` - Get camera control status by ID

### Hardware Authentication

```mermaid
graph TD
    A[Client] --> B[POST /api/hw-auth]
    A --> C[GET /api/hw-auth]
    A --> D[GET /api/hw-auth/all]
    A --> E[GET /api/hw-auth/:id]

    B --> F[Set Auth Status]
    C --> G[Get Current Status]
    D --> H[Get Status History]
    E --> I[Get Status by ID]

    F --> J[Database]
    G --> J
    H --> J
    I --> J
```

- `POST /api/hw-auth` - Save a new hardware authentication status
  - Required body: `{ "status": 1 }`
  - Valid status values:
    - `1` - Authenticated (vehicle is authorized to operate)
    - `0` - Not authenticated (vehicle is locked)
- `GET /api/hw-auth` - Get the most recent authentication status
- `GET /api/hw-auth/all` - Get all authentication statuses
- `GET /api/hw-auth/:id` - Get authentication status by ID

### User Management

```mermaid
graph TD
    A[Client] --> B[POST /api/users/register]
    A --> C[POST /api/users/login]
    A --> D[GET /api/users/profile]

    B --> E[Create User Account]
    C --> F[Authenticate User]
    D --> G[Get User Profile]

    E --> H[Database]
    F --> H
    G --> H
```

- `POST /api/users/register` - Register a new user

  - Required body for car owner: `{ "email": "owner@example.com", "name": "Car Owner", "password": "password123", "type": "car_owner", "car_name": "My Car" }`
  - Required body for relative: `{ "email": "relative@example.com", "name": "Relative User", "password": "password123", "type": "relative" }`
  - Optional fields for car owner: `profile_img`, `car_img`
  - Returns authentication token

- `POST /api/users/login` - Login an existing user

  - Required body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns authentication token and user details

- `GET /api/users/profile` - Get current user profile
  - Requires authentication token
  - Returns user details

### Car Owner & Relative Management

```mermaid
graph TD
    A[Car Owner] --> B[GET /api/users/owner/relatives]
    A --> C[POST /api/users/owner/relatives]
    A --> D[DELETE /api/users/owner/relatives/:id]

    E[Relative] --> F[GET /api/users/relative/owners]

    B --> G[Get All Relatives]
    C --> H[Add Relative]
    D --> I[Remove Relative]
    F --> J[Get Connected Car Owners]

    G --> K[Database]
    H --> K
    I --> K
    J --> K
```

- `GET /api/users/owner/relatives` - Get all relatives linked to car owner

  - Requires authentication token (car owner only)
  - Returns list of relative users

- `POST /api/users/owner/relatives` - Add relative to car owner

  - Requires authentication token (car owner only)
  - Required body: `{ "relativeId": 123 }`

- `DELETE /api/users/owner/relatives/:relativeId` - Remove relative from car owner

  - Requires authentication token (car owner only)

- `GET /api/users/relative/owners` - Get all car owners linked to a relative
  - Requires authentication token
  - Returns list of car owners with their details

### User Preferences

```mermaid
graph TD
    A[Client] --> B[GET /api/users/preferences]
    A --> C[PUT /api/users/preferences]
    A --> D[POST /api/users/preferences/toggle-dark-mode]

    B --> E[Get User Preferences]
    C --> F[Update Preferences]
    D --> G[Toggle Dark Mode]

    E --> H[Database]
    F --> H
    G --> H
```

- `GET /api/users/preferences` - Get user preferences

  - Requires authentication token
  - Returns user preferences (dark_mode status)

- `PUT /api/users/preferences` - Update user preferences

  - Requires authentication token
  - Required body: `{ "dark_mode": true }`

- `POST /api/users/preferences/toggle-dark-mode` - Toggle dark mode
  - Requires authentication token
  - Toggles current dark_mode preference

## Security Features

The API implements several security features:

```mermaid
graph TD
    A[Request] --> B[Input Validation]
    B --> C[Parameter Sanitization]
    C --> D[Security Headers]
    D --> E[Error Masking]
    E --> F[Rate Limiting]
    F --> G[Response]
```

- **Input Validation**: All request parameters and bodies are validated
- **Security Headers**:
  - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
  - `X-Frame-Options: DENY` - Prevents clickjacking attacks
  - `X-XSS-Protection: 1; mode=block` - Enhances XSS protection
- **Error Masking**: Detailed error messages in development, generic messages in production
- **Parameter Sanitization**: Prevents SQL injection and other injection attacks

## Error Handling

The API provides comprehensive error handling:

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type?}
    B -->|Validation| C[400 Bad Request]
    B -->|Not Found| D[404 Not Found]
    B -->|Database| E[Database Error Handler]
    B -->|Other| F[500 Server Error]

    E --> G{Error Code?}
    G -->|CONSTRAINT| H[409 Conflict]
    G -->|BUSY| I[503 Service Unavailable]
    G -->|READONLY| J[500 Server Error]
    G -->|NOTFOUND| K[404 Not Found]

    C --> L[JSON Response]
    D --> L
    H --> L
    I --> L
    J --> L
    K --> L
    F --> L
```

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "type": "APIError",
    "path": "/api/car-control"
  }
}
```

### Common Error Status Codes

- `400` - Bad Request (invalid input)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (constraint violation)
- `500` - Server Error (unexpected errors)
- `503` - Service Unavailable (database busy)

## Setup and Deployment

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/smart-vehicle-api.git
   cd smart-vehicle-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

4. For development with auto-restart:
   ```
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
```

### Deployment Options

```mermaid
graph TD
    A[Local Development] --> B[Testing]
    B --> C{Deployment}
    C -->|Option 1| D[Docker Container]
    C -->|Option 2| E[Cloud Service]
    C -->|Option 3| F[On-Premise Server]

    D --> G[Container Registry]
    G --> H[Kubernetes/Docker Swarm]

    E --> I[AWS/Azure/GCP]

    F --> J[Physical Server]
```

## Performance Considerations

- **Database Indexing**: All tables have indexed primary keys and timestamp fields
- **Connection Pooling**: Efficient database connection management
- **Caching**: Frequently accessed data can be cached
- **Pagination**: All list endpoints support pagination for large datasets

## Monitoring and Logging

The application includes comprehensive logging:

- **Request Logging**: All incoming requests are logged with timestamp, method, and URL
- **Error Logging**: Detailed error logs include stack traces in development mode
- **Graceful Shutdown**: Proper handling of server shutdown with connection cleanup

### Log Example

```
[2023-07-15T14:32:45.123Z] GET /api/location
[2023-07-15T14:32:45.234Z] POST /api/car-control
[2023-07-15T14:32:45.345Z] ERROR: Invalid action parameter - 400 Bad Request
```

## Database

The application uses SQLite with a file-based database (`database.db`). The database will be created automatically when you start the application for the first time.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
