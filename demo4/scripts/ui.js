// UI helper functions – same as demo1
export function renderStatCard(containerId, label, value) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h3 class="card__title">${label}</h3>
      </div>
      <div class="metric-card">
        <div class="metric-card__value">${value}</div>
      </div>
    </div>`;
}

export function renderDispatchQueue(data) {
  const tbody = document.getElementById('dispatch-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.flow}</td>
      <td>${item.status}</td>
      <td class="right"><button class="btn btn--primary btn--sm">Phân công</button></td>
    </tr>`).join('');
}

export function renderAlerts(alerts) {
  const list = document.getElementById('alert-list');
  if (!list) return;
  list.innerHTML = alerts.map(a => `
    <div class="alert chip chip--${a.type}">${a.message}</div>`).join('');
}