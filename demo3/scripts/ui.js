// UI Render Helpers for Demo 3

window.UI = {
  renderStats: (stats) => {
    const el = (id, icon, value, label, color) => {
      const wrapper = document.getElementById(id);
      if(!wrapper) return;
      wrapper.innerHTML = `
        <div class="stat-card__icon" style="background:rgba(0,0,0,0.04); color:var(--color-accent-${color})">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div class="stat-card__value">${value}</div>
        <div class="stat-card__label">${label}</div>
      `;
    };
    const outStr = stats.output ? `${stats.output.current}/${stats.output.target}` : '52/60';
    const progStr = stats.progress ? `${stats.progress.pct || '85'}%` : '85%';
    const resStr = stats.resources && stats.resources.trucks ? `${stats.resources.trucks.active + stats.resources.trailers.active}` : '140';
    const cliStr = stats.clients ? stats.clients.count : '10';

    el('stat-output', 'inventory', outStr, 'Sản lượng hôm nay', 'cyan');
    el('stat-progress', 'trending_up', progStr, 'Tiến độ tháng', 'emerald');
    el('stat-resources', 'local_shipping', resStr, 'Nguồn lực đang chạy', 'purple');
    el('stat-clients', 'domain', cliStr, 'Khách hàng phục vụ', 'pink');
  },

  renderDispatchQueue: (queue) => {
    const tbody = document.getElementById('dispatch-tbody');
    if(!tbody) return;
    tbody.innerHTML = queue.map((q, i) => `
      <tr style="animation-delay: ${i * 50}ms">
        <td style="font-weight:600; color:var(--color-accent-cyan)">${q.id}</td>
        <td>
          <div style="font-size:13px">${q.flow}</div>
          <div class="text-muted" style="font-size:11px">${q.flowSub || ''}</div>
        </td>
        <td><span class="status-pill chip--${q.statusType || 'info'}"><span class="chip__dot"></span>${q.status}</span></td>
        <td class="right">
          <button class="btn btn--secondary btn--compact" data-modal="modal-assign">Phân công</button>
        </td>
      </tr>
    `).join('');
  },

  renderAlerts: (alerts) => {
    const list = document.getElementById('alert-list');
    if(!list) return;
    list.innerHTML = alerts.map(a => `
      <div class="alert alert--${a.type}">
        <span class="material-symbols-outlined">${a.icon}</span>
        <p>${a.text}</p>
      </div>
    `).join('');
  },

  renderFlows: (flows) => {
    const el = document.getElementById('flow-cards');
    if(!el) return;
    el.innerHTML = flows.map(f => `
      <div class="card" style="border-top: 3px solid ${f.borderColor || 'var(--color-accent-cyan)'}">
        <div class="card__header">
          <h3 class="card__title"><span class="material-symbols-outlined" style="color:${f.textColor || 'inherit'}">${f.icon}</span> ${f.name}</h3>
        </div>
        <p class="text-muted" style="font-size:13px; margin-bottom:12px; min-height:40px">${f.desc}</p>
        <div class="status-pill chip--info" style="font-size:11px; background:rgba(0,0,0,0.04); color:var(--color-text-main); border:none">${f.route}</div>
      </div>
    `).join('');
  },

  renderContainers: (containers) => {
    const tbody = document.getElementById('container-tbody');
    if(!tbody) return;
    tbody.innerHTML = containers.map((c, i) => `
      <tr style="animation-delay: ${i * 50}ms">
        <td style="font-weight:600">${c.id}</td>
        <td>${c.client}</td>
        <td>${c.flow}</td>
        <td class="text-muted" style="font-size:12px">${c.route}</td>
        <td><span class="status-pill chip--${c.statusType}"><span class="chip__dot"></span>${c.status}</span></td>
        <td class="right">
          <button class="icon-btn" data-modal="modal-container-detail" data-id="${c.id}" style="display:inline-flex" title="Chi tiết">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </td>
      </tr>
    `).join('');
  },

  renderKanban: (kanban) => {
    const renderCol = (id, items) => {
      const el = document.getElementById(id);
      if(!el) return;
      el.innerHTML = items.map(k => `
        <div class="action-card" style="flex-direction:column; align-items:flex-start; gap:8px">
          <div style="font-weight:600; font-size:14px">${k.title}</div>
          <div class="text-muted" style="font-size:12px">${k.body}</div>
          ${k.alert ? `<div style="font-size:11px; color:var(--color-warning); margin-top:4px">${k.alert}</div>` : ''}
          <button class="btn btn--secondary btn--compact" style="width:100%; margin-top:8px" data-modal="${k.modal}">${k.action}</button>
        </div>
      `).join('');
    };
    if(kanban.catMooc) renderCol('kanban-cat-mooc', kanban.catMooc);
    if(kanban.haCont) renderCol('kanban-ha-cont', kanban.haCont);
    if(kanban.swapCont) renderCol('kanban-swap-cont', kanban.swapCont);
  },

  renderHubCosts: (hubs) => {
    const tbody = document.getElementById('hub-costs-tbody');
    if(!tbody) return;
    tbody.innerHTML = hubs.map((h, i) => `
      <tr style="animation-delay: ${i * 50}ms">
        <td style="font-weight:600">${h.hub}</td>
        <td>${h.operations}</td>
        <td>${h.dropFee}</td>
        <td>${h.storageFee}</td>
        <td style="font-weight:600; color:var(--color-accent-cyan)">${h.monthlyTotal}</td>
      </tr>
    `).join('');
  },

  renderDrivers: (drivers) => {
    const tbody = document.getElementById('driver-tbody');
    if(!tbody) return;
    tbody.innerHTML = drivers.map((d, i) => `
      <tr style="animation-delay: ${i * 50}ms">
        <td style="font-weight:600">${d.name}</td>
        <td>${d.team}</td>
        <td>${d.trips}</td>
        <td>${d.points}</td>
        <td style="${d.highlight ? 'color:var(--color-warning)' : ''}">${d.surcharge}</td>
        <td style="font-weight:600; color:var(--color-accent-emerald)">${d.total}</td>
        <td class="right">
          <button class="icon-btn" data-modal="modal-driver-detail" style="display:inline-flex"><span class="material-symbols-outlined">info</span></button>
        </td>
      </tr>
    `).join('');
  },

  renderTrailers: (trailers) => {
    const tbody = document.getElementById('trailer-tbody');
    if(!tbody) return;
    tbody.innerHTML = trailers.map((t, i) => `
      <tr style="animation-delay: ${i * 50}ms">
        <td style="font-weight:600; color:var(--color-accent-cyan)">${t.id}</td>
        <td>${t.type}</td>
        <td>${t.axles}</td>
        <td>${t.capacity}</td>
        <td><span class="status-pill chip--${t.status === 'Sẵn sàng' ? 'success' : 'warning'}"><span class="chip__dot"></span>${t.status}</span></td>
        <td class="right">
          <button class="icon-btn" style="display:inline-flex"><span class="material-symbols-outlined">edit</span></button>
        </td>
      </tr>
    `).join('');
  }
};
