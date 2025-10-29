// --- Import Application State ---
import { state } from './state.js';

// --- Import Initializers ---
import { initMap, toggleMapTheme, switchMapView } from './map.js';
import { initGlobeModule } from './globe.js';
import { initParticleAnimation, showPage, stopAlert, addEventToTimeline } from './ui.js';

// --- Import Event Handlers ---
import { handleRegister, handleLogin, handleLogout } from './auth.js';
import { handleChatSubmit } from './chat.js';
import { handleSOS, saveAdditionalContacts } from './actions.js';

// NEW: Import stats module
import { initStatsModule } from './stats.js';


// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selections ---
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const toggleToLogin = document.getElementById('toggle-to-login');
    const toggleToRegister = document.getElementById('toggle-to-register');
    const navButtons = document.querySelectorAll('.nav-btn');
    const backButtons = document.querySelectorAll('.nav-back');
    const chatForm = document.getElementById('chat-form');
    const sosButton = document.getElementById('sos-button');
    const stopAlertButton = document.getElementById('stop-alert-button');
    const saveContactsBtn = document.getElementById('save-contacts-btn');
    const toggleAdvisoryBtn = document.getElementById('toggle-advisory-btn');
    const mapControlButtons = document.querySelectorAll('.map-control-btn');
    
    // --- Initialize Vanta.js for Login Page ---
    if (typeof VANTA !== 'undefined') {
        state.vantaEffect = VANTA.GLOBE({
            el: "#login-page",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x00ffff,
            color2: 0x0ea5e9,
            backgroundColor: 0x020a18,
            size: 1.20
        });
    }
    document.body.classList.add('on-login-page');

    // --- Attach Event Listeners ---

    // Auth
    registerForm.addEventListener('submit', handleRegister);
    
    // --- UPDATED LOGIN HANDLER ---
    loginForm.addEventListener('submit', (e) => {
        const user = handleLogin(e); // Get result from auth function
        if (user) {
            performLogin(user); // Call login logic HERE
        }
    });
    
    logoutBtn.addEventListener('click', handleLogout);
    
    toggleToLogin.addEventListener('click', () => {
        toggleToLogin.classList.add('active');
        toggleToRegister.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });
    toggleToRegister.addEventListener('click', () => {
        toggleToRegister.classList.add('active');
        toggleToLogin.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Navigation
    navButtons.forEach(button => button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        if (targetId) {
            showPage(targetId);
            
            // NEW: Initialize stats module only when clicked
            if (targetId === 'module4-stats') {
                initStatsModule();
            }
        }
    }));
    backButtons.forEach(button => button.addEventListener('click', () => showPage('home-dashboard')));

    // Modules & Actions
    chatForm.addEventListener('submit', handleChatSubmit);
    sosButton.addEventListener('click', handleSOS);
    saveContactsBtn.addEventListener('click', saveAdditionalContacts);
    stopAlertButton.addEventListener('click', stopAlert);

    // Map Controls
    mapControlButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'btn-draw-zone') { return; } // Drawing is handled in map.js
            
            if (btn.id === 'btn-theme') { 
                toggleMapTheme(); 
            } else {
                // Handle map view switching
                btn.parentElement.querySelectorAll('.map-control-btn').forEach(b => {
                    if(b !== btn) b.classList.remove('active');
                });
                btn.classList.add('active');
                switchMapView(btn.id);
            }
        });
    });

    // UI Toggles
    toggleAdvisoryBtn.addEventListener('click', () => {
        const disasterFeedSection = document.getElementById('disaster-feed-section');
        const historyAdvisorySection = document.getElementById('history-advisory-section');
        const isHidden = disasterFeedSection.classList.contains('hidden');
        
        disasterFeedSection.classList.toggle('hidden');
        historyAdvisorySection.classList.toggle('hidden');
        toggleAdvisoryBtn.textContent = isHidden ? 'Hide Disaster Intel' : 'Show Disaster Intel';
    });
});

// --- MOVED performLogin() HERE ---
function performLogin(loggedInUserData) {
    state.userData = loggedInUserData; 
    
    // Destroy the Vanta.js animation
    if (state.vantaEffect) {
        state.vantaEffect.destroy();
        state.vantaEffect = null;
    }

    // Show the main dashboard
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
    document.body.classList.remove('on-login-page');

    // Populate user data into the UI
    document.getElementById('profile-name').textContent = state.userData.name;
    document.getElementById('profile-age').textContent = state.userData.age;
    document.getElementById('profile-mobile').textContent = state.userData.mobile;
    document.getElementById('profile-contact').textContent = state.userData.contacts[0] || 'N/A';
    document.getElementById('globe-operator-name').textContent = state.userData.name; 
    
    // Populate additional contacts
    const contactInputs = document.querySelectorAll('.additional-contact');
    state.userData.contacts.slice(1).forEach((contact, index) => {
        if (contactInputs[index]) {
            contactInputs[index].value = contact;
        }
    });

    document.getElementById('dashboard-location').textContent = `Location: Kanpur, Uttar Pradesh | Operator: ${state.userData.name}`;
    
    // Initialize the main app components
    initDashboard();
    initGlobeModule();
}

// --- Dashboard Initializer (called by performLogin) ---
function initDashboard() {
    initMap();
    addEventToTimeline('✅', 'Aegis Protocol Initialized.');
    initParticleAnimation(); // Start particles AFTER login
    
    // We don't init stats here, we wait for the user to click the tab.
}