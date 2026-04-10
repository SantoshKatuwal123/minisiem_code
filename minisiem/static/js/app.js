const API_BASE = "/api";

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/summary`);
        const data = await response.json();

        document.getElementById('total-logs').textContent = data.total_logs;
        document.getElementById('total-alerts').textContent = data.total_alerts;
    } catch (e) { console.error("Error fetching stats", e); }
}

async function fetchLogs() {
    try {
        const response = await fetch(`${API_BASE}/logs?limit=50`);
        const logs = await response.json();
        const container = document.getElementById('logs-container');
        container.innerHTML = '';

        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `
                <div class="log-meta">
                    <span class="badge badge-${log.level.toLowerCase() === 'error' ? 'error' : 'info'}">${log.level}</span>
                    ${new Date(log.timestamp).toLocaleTimeString()} | ${log.source_ip} | ${log.log_type}
                </div>
                <div>${log.raw_content}</div>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error("Error fetching logs", e); }
}

async function fetchAlerts() {
    try {
        const response = await fetch(`${API_BASE}/alerts?limit=20`);
        const alerts = await response.json();
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';

        alerts.forEach(alert => {
            const div = document.createElement('div');
            div.className = 'alert-item';
            div.innerHTML = `
                <div class="log-meta">
                    <strong>${alert.rule_name}</strong> | ${new Date(alert.timestamp).toLocaleTimeString()}
                </div>
                <div>${alert.message}</div>
                <div style="margin-top:5px"><span class="badge badge-error">${alert.severity}</span> Source: ${alert.source_ip}</div>
            `;
            container.appendChild(div);
        });
    } catch (e) { console.error("Error fetching alerts", e); }
}

function init() {
    // Initial fetch
    fetchStats();
    fetchLogs();
    fetchAlerts();

    // Poll every 2 seconds
    setInterval(() => {
        fetchStats();
        fetchLogs();
        fetchAlerts();
    }, 2000);
}

document.addEventListener('DOMContentLoaded', init);
