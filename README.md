# My Auth App

A modern, fully-featured authentication application built with Node.js, featuring user registration, login, password reset, and an intuitive user interface with smooth animations.

## Features

- **User Authentication**
  - User signup with email and password
  - User login with email and password
  - Email verification support
  
- **Security**
  - Password hashing using SHA-256
  - Token generation for authenticated sessions
  - Secure password reset via email with expiring tokens (15-minute validity)
  - Protected dashboard page
  
- **Email Integration**
  - Password reset functionality with email notifications
  - Support for Gmail (via App Password) or custom SMTP
  - Fallback console logging for testing without email setup
  
- **User Interface**
  - Modern, responsive design with gradient backgrounds
  - Smooth button animations and transitions
  - Interactive toggle between login and signup forms
  - Real-time form validation feedback
  - Beautiful hover effects with lift animation
  - Shine effect on buttons for enhanced interactivity
  - Professional dashboard with logout functionality

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

## Usage

### Sign Up
1. Open your browser and go to `http://localhost:3000`
2. Click the "Sign Up" button
3. Enter your full name, email, and password
4. Click "Sign Up" to create your account

### Login
1. Click the "Login" button on the home page
2. Enter your email and password
3. Click "Login" to access your dashboard

### Password Reset
1. On the login page, click "Forgot password? Email me a reset"
2. Enter your email address
3. Check your email for a password reset link
4. Click the link and enter your new password
5. Return to login with your new password

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
  "message": "Signup successful"
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

### POST /api/forgot-password
Request a password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, you will receive an email shortly."
}
```

### POST /api/reset-password
Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd my-auth-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Email Setup (Optional)

To enable password reset emails, configure one of the following:

#### Gmail Setup
1. Create an [App Password](https://support.google.com/accounts/answer/185833)
2. Create a `.env` file in the project root:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   GMAIL_FROM=your-email@gmail.com
   ```

#### Custom SMTP Server
Create a `.env` file:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_SECURE=false
SMTP_FROM=noreply@example.com
```

If no email configuration is provided, reset links will be logged to the console.

## Running the App

Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Tech Stack

- **Backend**: Node.js (ES modules)
- **Email**: Nodemailer (Gmail or custom SMTP)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Storage**: JSON file
- **Security**: SHA-256 hashing, secure token generation

## Notes

- This is an educational authentication app demonstrating modern web development practices
- Passwords are hashed using SHA-256 (suitable for learning; use bcrypt in production)
- User data is stored in JSON format (suitable for learning; use a database in production)
- For production deployment:
  - Use a proper database (MongoDB, PostgreSQL, etc.)
  - Replace SHA-256 with bcrypt for password hashing
  - Implement HTTPS
  - Add rate limiting and input validation
  - Use environment variables for sensitive configuration
  - Implement proper session management

## Troubleshooting

**Emails not sending?**
- Check if `.env` file is configured correctly
- Verify Gmail App Password is set up (not regular password)
- Check console logs for SMTP errors
- Ensure firewall isn't blocking SMTP port

**Form not submitting?**
- Open browser console (F12) for error messages
- Check network tab to see API responses
- Ensure server is running on port 3000

**Password reset link expired?**
- Links are valid for 15 minutes
- Request a new reset email if needed

## 🌟 Future Improvements

- **JWT-based authentication** - Implement JSON Web Tokens for better session management
- **Email verification workflow** - Verify user email addresses before account activation
- **MongoDB or PostgreSQL support** - Replace JSON file storage with a proper database
- **OAuth login (Google, GitHub)** - Add social media login options
- **2FA support** - Implement two-factor authentication for enhanced security

## 📄 License

This project is free to use and modify. You are welcome to use it for personal, educational, or commercial purposes. Feel free to fork, modify, and enhance it as needed!
