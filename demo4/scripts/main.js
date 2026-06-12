import mockData from './data.js';
import { renderStatCard, renderDispatchQueue, renderAlerts } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Render stat cards
  renderStatCard('stat-output', mockData.stats.output.label, mockData.stats.output.value);
  renderStatCard('stat-progress', mockData.stats.progress.label, mockData.stats.progress.value);
  renderStatCard('stat-resources', mockData.stats.resources.label, mockData.stats.resources.value);
  renderStatCard('stat-clients', mockData.stats.clients.label, mockData.stats.clients.value);

  // Render dispatch queue and alerts
  renderDispatchQueue(mockData.dispatchQueue);
  renderAlerts(mockData.alerts);

  // Simple SPA navigation
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.dataset.view;
      views.forEach(v => v.classList.toggle('active', v.id === `view-${viewId}`));
      navItems.forEach(i => i.classList.toggle('active', i === item));
    });
  });
});