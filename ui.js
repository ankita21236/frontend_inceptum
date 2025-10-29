// --- Page Navigation ---
export function showPage(targetId) {
    const pages = document.querySelectorAll('.page');
    const homeDashboard = document.getElementById('home-dashboard');
    const navButtons = document.querySelectorAll('.nav-btn');

    pages.forEach(page => page.classList.remove('active'));
    
    if (targetId === 'home-dashboard') { 
        homeDashboard.style.display = 'grid'; 
    } else {
        homeDashboard.style.display = 'none';
        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add('active');
    }
    
    // Update active nav button
    navButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
    if(activeBtn) activeBtn.classList.add('active');
}

// --- Event Timeline ---
export function addEventToTimeline(icon, text, type = 'info') {
    const eventTimeline = document.getElementById('event-timeline');
    const item = document.createElement('div');
    item.className = 'timeline-item';
    
    let iconColor = 'var(--color-success)';
    if (type === 'warning') iconColor = 'var(--color-warn)';
    if (type === 'danger') iconColor = 'var(--color-alert)';
    if (type === 'info') iconColor = 'var(--color-accent)';
    
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    item.innerHTML = `
        <div class="timeline-icon" style="color: ${iconColor};">${icon}</div>
        <div class="timeline-content">
            <p>${text}</p>
            <div class="time">${time}</div>
        </div>`;
    eventTimeline.prepend(item);
}

// --- Alert System ---
export function triggerAlert() {
    const alertPopup = document.getElementById('alert-popup');
    const alarmSound = document.getElementById('alarm-sound');
    
    alertPopup.classList.remove('hidden');
    alarmSound.play().catch(e => console.error("Error playing sound:", e));
    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500]);
    
    addEventToTimeline('🚨', 'CRITICAL ALERT: User location is now in high-risk zone!', 'danger');
    
    // Also show the disaster intel
    document.getElementById('disaster-feed-section').classList.remove('hidden');
    document.getElementById('history-advisory-section').classList.remove('hidden');
    document.getElementById('toggle-advisory-btn').textContent = 'Hide Disaster Intel';
}

export function stopAlert() {
    const alertPopup = document.getElementById('alert-popup');
    const alarmSound = document.getElementById('alarm-sound');

    alertPopup.classList.add('hidden');
    alarmSound.pause(); 
    alarmSound.currentTime = 0;
    if ('vibrate' in navigator) navigator.vibrate(0);
}

// --- Particle Background ---
export function initParticleAnimation() { 
    const canvas = document.getElementById('particle-canvas'); 
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    let particlesArray = []; 
    
    class Particle { 
        constructor(x, y, dirX, dirY, size) { 
            this.x = x; this.y = y; this.dirX = dirX; this.dirY = dirY; this.size = size; 
        } 
        draw() { 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); 
            ctx.fillStyle = 'rgba(100, 150, 255, 0.2)'; 
            ctx.fill(); 
        } 
        update() { 
            if (this.x > canvas.width || this.x < 0) { this.dirX = -this.dirX; } 
            if (this.y > canvas.height || this.y < 0) { this.dirY = -this.dirY; } 
            this.x += this.dirX; this.y += this.dirY; 
            this.draw(); 
        } 
    }
    
    function init() { 
        particlesArray = []; 
        let num = (canvas.height * canvas.width) / 9000; 
        for (let i = 0; i < num; i++) { 
            let size = (Math.random() * 2) + 1; 
            let x = (Math.random() * (innerWidth - size * 2)); 
            let y = (Math.random() * (innerHeight - size * 2)); 
            let dirX = (Math.random() * 0.4) - 0.2; 
            let dirY = (Math.random() * 0.4) - 0.2; 
            particlesArray.push(new Particle(x, y, dirX, dirY, size)); 
        } 
    }
    
    function animate() { 
        requestAnimationFrame(animate); 
        ctx.clearRect(0,0,innerWidth, innerHeight); 
        particlesArray.forEach(p => p.update()); 
    }
    
    window.addEventListener('resize', () => { 
        canvas.width = innerWidth; 
        canvas.height = innerHeight; 
        init(); 
    }); 
    
    init(); 
    animate();
}