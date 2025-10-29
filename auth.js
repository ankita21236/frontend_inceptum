import { state } from './state.js';

// --- REGISTRATION with inline error ---
export function handleRegister(e) {
    e.preventDefault();
    const errorEl = document.getElementById('register-error-message');
    errorEl.textContent = ''; // Clear old errors

    const users = JSON.parse(localStorage.getItem('aegisUsers')) || {};
    const mobile = document.getElementById('reg-mobile').value;
    
    if (!mobile) {
        errorEl.textContent = 'Mobile number is required.';
        return;
    }
    if (users[mobile]) {
        errorEl.textContent = 'User with this mobile already exists.';
        return;
    }
    
    const newUser = {
        name: document.getElementById('reg-name').value,
        age: document.getElementById('reg-age').value,
        mobile: mobile,
        contacts: [document.getElementById('reg-contact').value],
        password: document.getElementById('reg-password').value 
    };

    if (!newUser.name || !newUser.age || !newUser.contacts[0] || !newUser.password) {
        errorEl.textContent = 'Please fill in all fields.';
        return;
    }

    users[mobile] = newUser;
    localStorage.setItem('aegisUsers', JSON.stringify(users));
    
    alert('Registration successful! Please log in.');
    document.getElementById('toggle-to-login').click();
}

// --- LOGIN with inline error ---
export function handleLogin(e) {
    e.preventDefault();
    const errorEl = document.getElementById('login-error-message');
    errorEl.textContent = ''; // Clear old errors

    const users = JSON.parse(localStorage.getItem('aegisUsers')) || {};
    const mobile = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;
    const registeredUser = users[mobile];

    if (registeredUser && registeredUser.password === password) {
        // --- SUCCESS ---
        return registeredUser; // Return the user object
    } else {
        // --- FAIL ---
        errorEl.textContent = 'Invalid mobile number or password.';
        return null; // Return null on failure
    }
}

// --- LOGOUT ---
export function handleLogout() {
    location.reload(); // Simple reload to go back to login screen
}