// This object holds all shared data for the application.
// Other modules will import this to read or write state.
export const state = {
    // Map State
    map: null,
    userMarker: null,
    redZonePolygon: null,
    manualRedZone: null,
    tileLayers: {},
    isNightMode: false,
    reportedHazards: null,
    
    // User State
    userData: {}, // Will be populated on login
    
    // UI State
    vantaEffect: null // Holds the login page Vanta.js instance
};