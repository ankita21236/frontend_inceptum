let hazardChart = null;
let resourceChart = null;

// Mock data for the charts
const hazardData = {
    labels: ['Floods', 'Wildfires', 'Earthquakes', 'Storms'],
    datasets: [{
        label: 'Reported Incidents',
        data: [12, 5, 2, 8],
        backgroundColor: [
            'rgba(0, 150, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: 'rgba(230, 241, 255, 0.5)',
        borderWidth: 1
    }]
};

const resourceData = {
    labels: ['Shelters', 'Medical Teams', 'Police Units', 'Food Supplies'],
    datasets: [{
        label: 'Capacity / Availability %',
        data: [65, 80, 75, 45],
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderColor: 'rgba(0, 255, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 255, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 255, 255, 1)'
    }]
};

export function initStatsModule() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded!');
        return;
    }

    const hazardCtx = document.getElementById('hazardChart');
    if (hazardCtx && !hazardChart) {
        hazardChart = new Chart(hazardCtx, {
            type: 'doughnut',
            data: hazardData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'var(--color-text-primary)'
                        }
                    }
                }
            }
        });
    }

    const resourceCtx = document.getElementById('resourceChart');
    if (resourceCtx && !resourceChart) {
        resourceChart = new Chart(resourceCtx, {
            type: 'radar',
            data: resourceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: {
                            color: 'var(--color-text-primary)',
                            font: {
                                family: 'Inter, sans-serif'
                            }
                        },
                        ticks: {
                            color: 'var(--color-text-primary)',
                            backdropColor: 'var(--color-bg-dark)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}