import { state } from './state.js';
import { addEventToTimeline, triggerAlert } from './ui.js';

const KANPUR_COORDS = [26.4499, 80.3319];
let polygonDrawer; // To hold the Leaflet.Draw instance

// --- Main Map Initializer ---
export function initMap() {
    if (state.map) return;
    
    state.map = L.map('map').setView(KANPUR_COORDS, 13);
    
    // Define Tile Layers
    state.tileLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' });
    state.tileLayers.light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' });
    state.tileLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '&copy; Esri' });
    state.tileLayers.radar = L.tileLayer('https://tilecache.rainviewer.com/v2/radar/{z}/{x}/{y}/256/{ts}/1_0.png', { ts: Math.floor(Date.now() / 1000), opacity: 0.7, attribution: 'RainViewer' });

    // Set initial theme
    state.tileLayers.dark.addTo(state.map);
    state.map.getContainer().classList.add('dark-theme');
    state.isNightMode = true;
    document.getElementById('btn-theme').innerHTML = "☀️ Day Mode";
    
    // Locate user
    state.map.locate({watch: true, setView: true, maxZoom: 16, enableHighAccuracy: true});
    state.map.on('locationfound', onLocationFound);

    // Add layers and markers
    state.reportedHazards = L.layerGroup().addTo(state.map);
    addResourceMarkers();

    // Right-click to report hazard
    state.map.on('contextmenu', function(e) { 
        L.marker(e.latlng, { icon: L.divIcon({ className: 'text-2xl', html: '⚠️' }) })
            .addTo(state.reportedHazards)
            .bindPopup(`Hazard reported`)
            .openPopup(); 
    });

    // Initial simulated disaster zone
    const initialRedCoords = [[26.48, 80.38], [26.48, 80.42], [26.45, 80.42], [26.45, 80.38]];
    state.redZonePolygon = L.polygon(initialRedCoords, { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 1 }).addTo(state.map);
    
    // Start simulation
    setInterval(simulateDisaster, 4000);

    // Init Leaflet.draw
    initDrawing();
}

// --- Map Helper Functions ---

function onLocationFound(e) {
    if (!state.userMarker) {
        // Create user marker
        state.userMarker = L.marker(e.latlng, { 
            icon: L.divIcon({ 
                className: 'user-marker', 
                html: '<div></div>', 
                iconSize: [16, 16] 
            }) 
        }).addTo(state.map);
        
        // Add CSS for the marker pulse
        const style = document.createElement('style');
        style.innerHTML = `
            .user-marker div { 
                width: 16px; height: 16px; background: var(--color-accent); 
                border-radius: 50%; border: 2px solid white; 
                box-shadow: 0 0 10px var(--color-accent); 
                animation: pulse-user 1.5s infinite; 
            } 
            @keyframes pulse-user { 
                0% { transform: scale(1); opacity: 1; } 
                50% { transform: scale(1.5); opacity: 0.5; } 
                100% { transform: scale(1); opacity: 1; } 
            }`;
        if(!document.head.querySelector('.user-marker-style')) {
             style.className = 'user-marker-style';
             document.head.appendChild(style);
        }
    } else {
        // Update marker position
        state.userMarker.setLatLng(e.latlng); 
    }
}

function addResourceMarkers() {
    const resources = [ 
        { name: 'Regency Hospital', coords: [26.4748, 80.3421], icon: '🏥' }, 
        { name: 'GSVM Medical College', coords: [26.4589, 80.3061], icon: '🏥' }, 
        { name: 'Green Park Stadium (Shelter)', coords: [26.4715, 80.3499], icon: '🏠' }, 
        { name: 'Kanpur Central (Police Post)', coords: [26.4533, 80.3516], icon: '👮' } 
    ];
    resources.forEach(res => { 
        L.marker(res.coords, { icon: L.divIcon({ className: 'text-2xl', html: res.icon }) })
            .addTo(state.map)
            .bindPopup(res.name); 
    });
}

export function toggleMapTheme() {
    state.isNightMode = !state.isNightMode;
    const themeBtn = document.getElementById('btn-theme');
    if (state.isNightMode) {
        if (state.map.hasLayer(state.tileLayers.light)) state.map.removeLayer(state.tileLayers.light);
        if (!state.map.hasLayer(state.tileLayers.dark)) state.tileLayers.dark.addTo(state.map);
        themeBtn.innerHTML = "☀️ Day Mode";
    } else {
        if (state.map.hasLayer(state.tileLayers.dark)) state.map.removeLayer(state.tileLayers.dark);
        if (!state.map.hasLayer(state.tileLayers.light)) state.tileLayers.light.addTo(state.map);
        themeBtn.innerHTML = "🌙 Night Mode";
    }
}

export function switchMapView(viewId) {
    if (state.map.hasLayer(state.tileLayers.satellite)) state.map.removeLayer(state.tileLayers.satellite);
    if (state.map.hasLayer(state.tileLayers.radar)) state.map.removeLayer(state.tileLayers.radar);
    
    if (viewId === 'btn-satellite') { 
        state.tileLayers.satellite.addTo(state.map); 
    } else if (viewId === 'btn-radar') {
        state.tileLayers.radar.options.ts = Math.floor(Date.now() / 1000);
        state.tileLayers.radar.addTo(state.map);
    }
    addEventToTimeline('🗺️', `Map view switched to ${viewId.replace('btn-', '')}.`, 'info');
}

function simulateDisaster() {
    if (!state.redZonePolygon || !state.userMarker) return;
    
    // Expand the simulated zone
    const currentCoords = state.redZonePolygon.getLatLngs()[0];
    const newCoords = currentCoords.map(coord => ({ lat: coord.lat - 0.002, lng: coord.lng - 0.004 }));
    state.redZonePolygon.setLatLngs(newCoords);
    if (Math.random() > 0.8) { 
        addEventToTimeline('📈', 'Danger zone has expanded.', 'warning'); 
    }
    
    // Check user location against zones
    const userLatLng = state.userMarker.getLatLng();
    const inSimZone = state.redZonePolygon.getBounds().contains(userLatLng);
    
    let inManualZone = false;
    if (state.manualRedZone && typeof state.manualRedZone.getBounds === 'function' && state.manualRedZone.getBounds().contains(userLatLng)) {
       inManualZone = true;
    }

    // Trigger alert if in a zone and alert is not already showing
    if ((inSimZone || inManualZone) && document.getElementById('alert-popup').classList.contains('hidden')) { 
        triggerAlert(); 
    }
}

function initDrawing() {
    const btnDrawZone = document.getElementById('btn-draw-zone'); 
    if (typeof L.Draw !== 'undefined') {
        polygonDrawer = new L.Draw.Polygon(state.map, {
            shapeOptions: { color: '#f74040', fillColor: '#f74040', fillOpacity: 0.4 },
            showArea: false 
        });
        
        // --- UPDATED CLICK LISTENER ---
        btnDrawZone.addEventListener('click', () => {
            // Check if the button is ALREADY active
            if (btnDrawZone.classList.contains('active')) {
                // If active, stop the drawing
                polygonDrawer.disable();
                // The 'draw:drawstop' event will automatically reset the button text
            } else {
                // If not active, start the drawing
                polygonDrawer.enable();
                btnDrawZone.textContent = 'Drawing... (Click to Stop)'; // Updated text
                btnDrawZone.classList.add('active');
            }
        });

        state.map.on(L.Draw.Event.CREATED, function (e) {
            const layer = e.layer;
            if (state.manualRedZone) { state.map.removeLayer(state.manualRedZone); }
            state.manualRedZone = layer;
            state.manualRedZone.setStyle({ color: '#f74040', fillColor: '#f74040', fillOpacity: 0.4, weight: 1 });
            state.map.addLayer(state.manualRedZone);
            addEventToTimeline('✏️', 'Manual danger zone created.', 'warn');
            
            // This 'draw:drawstop' event will fire AFTER creation,
            // so we don't need to reset the button here.
        });

        state.map.on('draw:drawstop', function () {
            // This event fires when drawing is stopped (either by finishing or cancelling)
            polygonDrawer.disable();
            btnDrawZone.textContent = 'Draw Manual Zone';
            btnDrawZone.classList.remove('active');
        });
    } else {
        console.error("Leaflet.draw library not loaded correctly!");
        btnDrawZone.disabled = true;
        btnDrawZone.textContent = 'Draw Unavailable';
    }
}