// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
}

// Show login / signup helpers for the new toggle buttons
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
}

function showSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
}

// Handle Login
document.addEventListener('DOMContentLoaded', function() {
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.textContent = 'Login successful! Redirecting...';
                    messageDiv.className = 'success';
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', email);
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 1500);
                } else {
                    messageDiv.textContent = data.message || 'Login failed';
                    messageDiv.className = 'error';
                }
            } catch (error) {
                messageDiv.textContent = 'An error occurred: ' + error.message;
                messageDiv.className = 'error';
            }
        });
    }

    // Forgot password link
    const forgotLink = document.getElementById('forgotLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const prefilled = document.getElementById('loginEmail').value || '';
            const email = prompt('Enter your email for password reset:', prefilled);
            const messageDiv = document.getElementById('loginMessage');

            if (!email) return;

            try {
                const response = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                messageDiv.textContent = data.message || 'If the account exists, check your email.';
                messageDiv.className = response.ok ? 'success' : 'error';
            } catch (err) {
                messageDiv.textContent = 'An error occurred: ' + err.message;
                messageDiv.className = 'error';
            }
        });
    }
    
    // Handle Signup
    const signupFormElement = document.getElementById('signupFormElement');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const messageDiv = document.getElementById('signupMessage');
            
            if (password !== confirmPassword) {
                messageDiv.textContent = 'Passwords do not match';
                messageDiv.className = 'error';
                return;
            }
            
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    messageDiv.textContent = 'Signup successful! Redirecting to login...';
                    messageDiv.className = 'success';
                    setTimeout(() => {
                        toggleForms();
                        document.getElementById('signupFormElement').reset();
                        document.getElementById('loginEmail').value = email;
                    }, 1500);
                } else {
                    messageDiv.textContent = data.message || 'Signup failed';
                    messageDiv.className = 'error';
                }
            } catch (error) {
                messageDiv.textContent = 'An error occurred: ' + error.message;
                messageDiv.className = 'error';
            }
        });
    }
});
