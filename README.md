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

For detailed API documentation including request/response formats and examples, please see the [API Endpoints Reference](API_ENDPOINTS.md).

### Main API Endpoints Overview

- **User Management**

  - `POST /api/users/register` - Register a new user (car owner or relative)
  - `POST /api/users/login` - Login a user
  - `GET /api/users/profile` - Get user profile

- **User Preferences**

  - `GET /api/users/preferences` - Get user preferences
  - `PUT /api/users/preferences` - Update user preferences
  - `POST /api/users/preferences/toggle-dark-mode` - Toggle dark mode

- **Car Owner & Relative Management**

  - `GET /api/users/owner/relatives` - Get relatives linked to car owner
  - `POST /api/users/owner/relatives` - Add relative to car owner
  - `DELETE /api/users/owner/relatives/:relativeId` - Remove relative
  - `GET /api/users/relative/owners` - Get car owners linked to relative

- **Location Management**

  - `POST /api/location` - Save a new location
  - `GET /api/location` - Get the most recent location
  - `GET /api/location/all` - Get all locations
  - `GET /api/location/:id` - Get location by ID

- **Vehicle Control**

  - `POST /api/car-control` - Save a new car control action
  - `GET /api/car-control` - Get the most recent car control action
  - `GET /api/car-control/all` - Get all car control actions
  - `GET /api/car-control/:id` - Get car control action by ID

- **Camera Management**

  - `POST /api/camera-control` - Save a new camera control status
  - `GET /api/camera-control` - Get the most recent camera status
  - `GET /api/camera-control/all` - Get all camera statuses
  - `GET /api/camera-control/:id` - Get camera status by ID

- **Hardware Authentication**
  - `POST /api/hw-auth` - Save a new hardware authentication status
  - `GET /api/hw-auth` - Get the most recent authentication status
  - `GET /api/hw-auth/all` - Get all authentication statuses
  - `GET /api/hw-auth/:id` - Get authentication status by ID

### Car Control Action Values

| Value | Action  |
| ----- | ------- |
| 5     | stop    |
| 6     | forward |
| 7     | back    |
| 8     | right   |
| 9     | left    |

#### Example Request

```json
{
  "action": "6"
}
```

#### Example Response

```json
{
  "message": "Car control action saved successfully",
  "action": "6",
  "description": "forward",
  "id": 1
}
```

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
