# Smart Vehicle Control System API Reference

This document provides detailed information about all available API endpoints, including request/response formats and authentication requirements.

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [User Preferences](#user-preferences)
- [Car Owner & Relative Management](#car-owner--relative-management)
- [Location Management](#location-management)
- [Vehicle Control](#vehicle-control)
- [Camera Management](#camera-management)
- [Hardware Authentication](#hardware-authentication)

## Authentication

All protected endpoints require a JWT token sent in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Management

### Register a new user

**Endpoint:** `POST /api/users/register`

**Authentication:** None

**Request Body - Car Owner:**

```json
{
  "email": "owner@example.com",
  "name": "John Doe",
  "password": "password123",
  "type": "car_owner",
  "car_name": "My Tesla",
  "profile_img": "https://example.com/profile.jpg", // optional
  "car_img": "https://example.com/car.jpg" // optional
}
```

**Request Body - Relative:**

```json
{
  "email": "relative@example.com",
  "name": "Jane Smith",
  "password": "password123",
  "type": "relative"
}
```

**Response - Success (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "owner@example.com",
    "name": "John Doe",
    "type": "car_owner",
    "profile_img": "https://example.com/profile.jpg",
    "car_img": "https://example.com/car.jpg",
    "car_name": "My Tesla"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid fields
- `409 Conflict`: Email already exists

### Login

**Endpoint:** `POST /api/users/login`

**Authentication:** None

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response - Success:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "type": "car_owner",
    "profile_img": "https://example.com/profile.jpg",
    "car_img": "https://example.com/car.jpg",
    "car_name": "My Tesla",
    "created_at": "2023-07-15T14:32:45.123Z",
    "dark_mode": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

### Get User Profile

**Endpoint:** `GET /api/users/profile`

**Authentication:** Required

**Response - Success:**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "type": "car_owner",
    "profile_img": "https://example.com/profile.jpg",
    "car_img": "https://example.com/car.jpg",
    "car_name": "My Tesla",
    "created_at": "2023-07-15T14:32:45.123Z",
    "dark_mode": 0
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

## User Preferences

### Get User Preferences

**Endpoint:** `GET /api/users/preferences`

**Authentication:** Required

**Response - Success:**

```json
{
  "preferences": {
    "user_id": 1,
    "dark_mode": true
  }
}
```

### Update User Preferences

**Endpoint:** `PUT /api/users/preferences`

**Authentication:** Required

**Request Body:**

```json
{
  "dark_mode": true
}
```

**Response - Success:**

```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "user_id": 1,
    "dark_mode": true
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid dark_mode value

### Toggle Dark Mode

**Endpoint:** `POST /api/users/preferences/toggle-dark-mode`

**Authentication:** Required

**Response - Success:**

```json
{
  "message": "Dark mode toggled successfully",
  "preferences": {
    "user_id": 1,
    "dark_mode": false
  }
}
```

## Car Owner & Relative Management

### Get Car Owner's Relatives

**Endpoint:** `GET /api/users/owner/relatives`

**Authentication:** Required (car owner only)

**Response - Success:**

```json
{
  "owner": {
    "id": 1,
    "email": "owner@example.com",
    "name": "John Doe",
    "type": "car_owner",
    "profile_img": "https://example.com/profile.jpg",
    "car_img": "https://example.com/car.jpg",
    "car_name": "My Tesla",
    "created_at": "2023-07-15T14:32:45.123Z",
    "dark_mode": 1,
    "relatives": [
      {
        "id": 2,
        "email": "relative1@example.com",
        "name": "Jane Smith"
      },
      {
        "id": 3,
        "email": "relative2@example.com",
        "name": "Bob Johnson"
      }
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request`: User is not a car owner
- `403 Forbidden`: User doesn't have car owner privileges

### Add Relative to Car Owner

**Endpoint:** `POST /api/users/owner/relatives`

**Authentication:** Required (car owner only)

**Request Body:**

```json
{
  "relativeId": 2
}
```

**Response - Success (201 Created):**

```json
{
  "message": "Relative added successfully",
  "relationship": {
    "id": 1,
    "owner_id": 1,
    "relative_id": 2
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing relative ID or user is not a car owner
- `409 Conflict`: Relationship already exists

### Remove Relative from Car Owner

**Endpoint:** `DELETE /api/users/owner/relatives/:relativeId`

**Authentication:** Required (car owner only)

**URL Parameters:**

- `relativeId`: ID of the relative to remove

**Response - Success:**

```json
{
  "message": "Relative removed successfully",
  "success": true
}
```

**Error Responses:**

- `404 Not Found`: Relationship does not exist

### Get Car Owners for a Relative

**Endpoint:** `GET /api/users/relative/owners`

**Authentication:** Required

**Response - Success:**

```json
{
  "owners": [
    {
      "id": 1,
      "email": "owner1@example.com",
      "name": "John Doe",
      "profile_img": "https://example.com/profile1.jpg",
      "car_img": "https://example.com/car1.jpg",
      "car_name": "Tesla Model S"
    },
    {
      "id": 4,
      "email": "owner2@example.com",
      "name": "Alice Brown",
      "profile_img": "https://example.com/profile2.jpg",
      "car_img": "https://example.com/car2.jpg",
      "car_name": "BMW i8"
    }
  ]
}
```

## Location Management

### Save a New Location

**Endpoint:** `POST /api/location`

**Authentication:** None (consider adding in production)

**Request Body:**

```json
{
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "status": "active"
}
```

**Status Values:**

- `active`: Vehicle is in use
- `idle`: Vehicle is stationary
- `emergency`: Vehicle has an emergency
- `maintenance`: Vehicle is in maintenance mode

**Response - Success (201 Created):**

```json
{
  "message": "Location saved successfully",
  "location": {
    "id": 1,
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "status": "active"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or invalid data

### Get Latest Location

**Endpoint:** `GET /api/location`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "location": {
    "id": 1,
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "status": "active",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: No location data found

### Get All Locations

**Endpoint:** `GET /api/location/all`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "locations": [
    {
      "id": 2,
      "latitude": "37.7750",
      "longitude": "-122.4195",
      "status": "active",
      "created_at": "2023-07-15T14:35:45.123Z"
    },
    {
      "id": 1,
      "latitude": "37.7749",
      "longitude": "-122.4194",
      "status": "active",
      "created_at": "2023-07-15T14:32:45.123Z"
    }
  ]
}
```

### Get Location by ID

**Endpoint:** `GET /api/location/:id`

**Authentication:** None (consider adding in production)

**URL Parameters:**

- `id`: Location ID

**Response - Success:**

```json
{
  "location": {
    "id": 1,
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "status": "active",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Location with specified ID not found

## Vehicle Control

### Execute Car Control Action

**Endpoint:** `POST /api/car-control`

**Authentication:** None (consider adding in production)

**Request Body:**

```json
{
  "action": "6"
}
```

**Action Values:**

- `5`: Stop
- `6`: Forward movement
- `7`: Backward movement
- `8`: Right turn
- `9`: Left turn

**Response - Success (201 Created):**

```json
{
  "message": "Car control action saved successfully",
  "control": {
    "id": 1,
    "action": "6"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing action or invalid action value

### Get Latest Car Control Action

**Endpoint:** `GET /api/car-control`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "control": {
    "id": 1,
    "action": "6",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: No car control data found

### Get All Car Control Actions

**Endpoint:** `GET /api/car-control/all`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "controls": [
    {
      "id": 2,
      "action": "8",
      "created_at": "2023-07-15T14:35:45.123Z"
    },
    {
      "id": 1,
      "action": "6",
      "created_at": "2023-07-15T14:32:45.123Z"
    }
  ]
}
```

### Get Car Control Action by ID

**Endpoint:** `GET /api/car-control/:id`

**Authentication:** None (consider adding in production)

**URL Parameters:**

- `id`: Control action ID

**Response - Success:**

```json
{
  "control": {
    "id": 1,
    "action": "6",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Car control action with specified ID not found

## Camera Management

### Change Camera State

**Endpoint:** `POST /api/camera-control`

**Authentication:** None (consider adding in production)

**Request Body:**

```json
{
  "status": 11
}
```

**Status Values:**

- `11`: First camera on
- `12`: First camera off
- `13`: Second camera on
- `14`: Second camera off
- `15`: Both cameras on
- `16`: Both cameras off

**Response - Success (201 Created):**

```json
{
  "message": "Camera control status saved successfully",
  "control": {
    "id": 1,
    "status": 11
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing status or invalid status code

### Get Latest Camera Control Status

**Endpoint:** `GET /api/camera-control`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "control": {
    "id": 1,
    "status": "11",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: No camera control data found

### Get All Camera Control Statuses

**Endpoint:** `GET /api/camera-control/all`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "controls": [
    {
      "id": 2,
      "status": "15",
      "created_at": "2023-07-15T14:35:45.123Z"
    },
    {
      "id": 1,
      "status": "11",
      "created_at": "2023-07-15T14:32:45.123Z"
    }
  ]
}
```

### Get Camera Control Status by ID

**Endpoint:** `GET /api/camera-control/:id`

**Authentication:** None (consider adding in production)

**URL Parameters:**

- `id`: Control status ID

**Response - Success:**

```json
{
  "control": {
    "id": 1,
    "status": "11",
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Camera control status with specified ID not found

## Hardware Authentication

### Set Hardware Authentication Status

**Endpoint:** `POST /api/hw-auth`

**Authentication:** None (consider adding in production)

**Request Body:**

```json
{
  "status": 1
}
```

**Status Values:**

- `1`: Authenticated (vehicle is authorized to operate)
- `0`: Not authenticated (vehicle is locked)

**Response - Success (201 Created):**

```json
{
  "message": "Hardware authentication status saved successfully",
  "auth": {
    "id": 1,
    "status": 1
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing status or invalid status value

### Get Latest Hardware Authentication Status

**Endpoint:** `GET /api/hw-auth`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "auth": {
    "id": 1,
    "status": 1,
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: No authentication data found

### Get All Hardware Authentication Statuses

**Endpoint:** `GET /api/hw-auth/all`

**Authentication:** None (consider adding in production)

**Response - Success:**

```json
{
  "auths": [
    {
      "id": 2,
      "status": 0,
      "created_at": "2023-07-15T14:35:45.123Z"
    },
    {
      "id": 1,
      "status": 1,
      "created_at": "2023-07-15T14:32:45.123Z"
    }
  ]
}
```

### Get Hardware Authentication Status by ID

**Endpoint:** `GET /api/hw-auth/:id`

**Authentication:** None (consider adding in production)

**URL Parameters:**

- `id`: Authentication status ID

**Response - Success:**

```json
{
  "auth": {
    "id": 1,
    "status": 1,
    "created_at": "2023-07-15T14:32:45.123Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Authentication status with specified ID not found
