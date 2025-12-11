# My Auth App

A simple authentication application built with Node.js, featuring user registration and login functionality.

## Features

- User signup with email and password
- User login with email and password
- Password hashing using SHA-256
- Token generation for authenticated sessions
- Protected dashboard page
- Clean and responsive UI

## Project Structure

```
my-auth-app/
├── data/
│   └── users.json           # User database (JSON file)
├── public/
│   ├── index.html           # Login/signup page
│   ├── dashboard.html       # Protected dashboard page
│   ├── style.css            # CSS styles
│   └── app.js               # Client-side JavaScript
├── server.js                # Node.js server
├── package.json             # Project metadata
├── .gitignore               # Git ignore file
└── README.md                # This file
```

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd my-auth-app
   ```

## Running the App

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Sign up with your email and password
3. Log in with your credentials
4. You'll be redirected to the dashboard

## API Endpoints

### POST /api/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

### POST /api/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "generated_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Notes

- This is a basic authentication app for learning purposes
- Passwords are hashed using SHA-256 (not suitable for production)
- User data is stored in a JSON file (not suitable for production)
- For production, use proper database and bcrypt for password hashing

## License

MIT
