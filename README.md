# Express and SQLite Backend

A well-structured Node.js backend API using Express and SQLite with robust error handling.

## Project Structure

```
src/
  ├── config/        # Application and database configuration
  ├── controllers/   # Request handlers
  ├── models/        # Data models
  ├── routes/        # API routes
  ├── middleware/    # Custom middleware
  ├── utils/         # Utility functions
  ├── db/            # Database scripts
  └── server.js      # Application entry point
```

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Start the server:

   ```
   npm start
   ```

3. For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /` - Welcome message
- **Locations:**
  - `POST /api/location` - Save a new location
    - Required body: `{ "latitude": "22222", "longitude": "123", "status": "accedint" }`
  - `GET /api/location` - Get the most recent location entry
  - `GET /api/location/all` - Get all location entries
  - `GET /api/location/:id` - Get location by ID
- **Car Controls:**
  - `POST /api/car-control` - Save a new car control action
    - Required body: `{ "action": "1" }`
    - Valid actions:
      - `1` - forward
      - `2` - backward
      - `3` - right
      - `4` - left
      - `5` - stop
  - `GET /api/car-control` - Get the most recent car control action
  - `GET /api/car-control/all` - Get all car control actions
  - `GET /api/car-control/:id` - Get car control action by ID

## Error Handling

The API includes comprehensive error handling:

- Validation of all request parameters and bodies
- Appropriate HTTP status codes for different error types
- Consistent error response format:
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
- Common error status codes:
  - `400` - Bad Request (invalid input)
  - `404` - Not Found (resource doesn't exist)
  - `500` - Server Error (unexpected errors)

## Database

The application uses SQLite with a file-based database (`database.db`). The database will be created automatically when you start the application for the first time.
