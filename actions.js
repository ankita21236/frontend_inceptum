import { state } from './state.js';
import { api } from './api.js';
import { addEventToTimeline } from './ui.js';

// --- SOS Button ---
export async function handleSOS() { 
    if (!state.userMarker) { 
        alert("Cannot send SOS: Your location is not yet determined."); 
        return; 
    }
    
    const userLatLng = state.userMarker.getLatLng(); 
    const coords = `${userLatLng.lat.toFixed(6)}, ${userLatLng.lng.toFixed(6)}`;
    
    const sosData = { 
        userId: state.userData.mobile, 
        info: state.userData, 
        coordinates: { lat: userLatLng.lat, lng: userLatLng.lng } 
    };
    
    // Show loading state (optional but good UX)
    const sosButton = document.getElementById('sos-button');
    sosButton.disabled = true;
    sosButton.classList.remove('sos-pulse');
    sosButton.innerHTML = `<span id="sos-text" style="font-size: 4rem;">SEND...</span>`;

    const response = await api.sendSOS(sosData);
    
    if (response.success) {
        const primaryContact = state.userData.contacts[0]; 
        const otherContacts = state.userData.contacts.slice(1).filter(c => c.trim() !== "");
        let notificationList = `\n- Nearest Rescue Teams\n- Primary Contact: ${primaryContact}`;
        if (otherContacts.length > 0) { 
            notificationList += `\n- Other Contacts: ${otherContacts.join(', ')}`; 
        }
        
        alert(`SOS Activated for ${state.userData.name}!\n\nCoordinates: ${coords}\n\nNotifying:\n${notificationList}`);
        
        sosButton.style.backgroundColor = 'var(--color-success)';
        sosButton.innerHTML = `<span id="sos-text" style="font-size: 5rem;">SENT</span>`;
        
        addEventToTimeline('🆘', `SOS beacon activated by ${state.userData.name}.`, 'danger');
    } else { 
        alert("SOS failed to send. Please check your connection."); 
        sosButton.disabled = false;
        sosButton.classList.add('sos-pulse');
        sosButton.innerHTML = `<span id="sos-text">SOS</span>`;
    }
}

// --- Save Additional Contacts ---
export async function saveAdditionalContacts() { 
    const newContacts = [state.userData.contacts[0]]; // Keep primary contact
    
    document.querySelectorAll('.additional-contact').forEach(input => { 
        if (input.value.trim() !== "") { 
            newContacts.push(input.value.trim()); 
        } 
    });
    
    // Update local state
    state.userData.contacts = newContacts;
    
    // Update localStorage
    const users = JSON.parse(localStorage.getItem('aegisUsers')) || {};
    if (users[state.userData.mobile]) {
        users[state.userData.mobile] = state.userData; // Save updated user data
        localStorage.setItem('aegisUsers', JSON.stringify(users));
        
        // Mock API call
        await api.saveContacts(state.userData.mobile, newContacts);
        
        alert("Additional contacts have been saved.");
    } else {
        alert("Error: Could not find user to save contacts.");
    }
}