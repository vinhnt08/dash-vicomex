const UI = {
  chip(text, type = 'neutral', dotted = false) {
    const dot = dotted ? `<span class="chip__dot"></span>` : '';
    return `<span class="chip chip--${type}">${dot}${text}</span>`;
  },

  alert(type, icon, text) {
    return `
      <div class="alert alert--${type}" role="alert">
        <span class="material-symbols-outlined">${icon}</span>
        <p>${text}</p>
      </div>`;
  },

  statCard({ label, value, unit, sub, subType }) {
    const subEl = sub
      ? `<span class="body-sm" style="margin-top:4px;display:inline-block;padding:2px 8px;border-radius:2px;background:${subType === 'success' ? 'var(--color-success-bg)' : 'var(--color-surface-container-low)'};color:${subType === 'success' ? 'var(--color-success-text)' : 'var(--color-secondary)'}">${sub}</span>`
      : '';
    return `
      <div class="metric-card">
        <p class="metric-card__label">${label}</p>
        <div class="metric-card__value">
          <span>${value}</span>
          ${unit ? `<span class="metric-card__unit">${unit}</span>` : ''}
        </div>
        ${subEl}
      </div>`;
  },

  dispatchRow(item, idx) {
    const flowSubColor = item.flowSubColor
      ? `style="color:var(--color-${item.flowSubColor === 'success' ? 'success' : item.flowSubColor === 'error' ? 'error' : 'info'})"` : '';
    return `
      <tr style="animation-delay:${idx * 50}ms">
        <td class="bold">Cont ${item.id}</td>
        <td class="muted">${item.flow} <span ${flowSubColor}>${item.flowSub}</span></td>
        <td>${UI.chip(item.status, item.statusType)}</td>
        <td class="right"><button class="btn btn--secondary btn--sm js-assign" data-cont="${item.id}">Phân công</button></td>
      </tr>`;
  },

  containerRow(item, idx) {
    const allTemplates = [...DATA_TEMPLATES.import, ...DATA_TEMPLATES.export];
    const tmpl = allTemplates.find(t => t.id === item.templateId);
    const flowLabel = tmpl ? tmpl.label : (item.templateId || '–');
    const dirChip = item.direction === 'import'
      ? `<span class="chip chip--info" style="font-size:10px;padding:1px 6px;margin-top:3px">Nhập</span>`
      : `<span class="chip chip--neutral" style="font-size:10px;padding:1px 6px;margin-top:3px">Xuất</span>`;
    return `
      <tr style="animation-delay:${idx * 50}ms">
        <td class="bold" style="white-space:nowrap">${item.id}</td>
        <td class="muted">${item.client}</td>
        <td>
          <div style="display:flex;flex-direction:column;gap:3px">
            <span style="font-size:13px;font-weight:500">${flowLabel}</span>
            ${dirChip}
          </div>
        </td>
        <td class="muted" style="font-size:12px">${item.route}</td>
        <td>${UI.chip(item.status, item.statusType, true)}</td>
        <td>${UI.chip(item.laden === 'Empty' ? 'Rỗng' : 'Có hàng', item.laden === 'Empty' ? 'info' : 'success', false)}</td>
        <td class="right" style="white-space:nowrap">
          <button class="btn btn--ghost btn--sm js-detail" data-id="${item.id}" style="margin-right:4px">Chi tiết</button>
          <button class="btn btn--secondary btn--sm js-edit-container" data-id="${item.id}" title="Sửa flow">
            <span class="material-symbols-outlined icon-sm">edit</span>
          </button>
        </td>
      </tr>`;
  },

  driverRow(item, idx) {
    const highlight = item.highlight
      ? `style="background:var(--color-warning-bg)"` : '';
    const surchargeColor = item.highlight ? 'var(--color-warning-text)' : 'var(--color-on-secondary-fixed)';
    const surchargeStyle = `style="background:${item.highlight ? 'var(--color-warning-border)' : 'var(--color-secondary-fixed)'};color:${surchargeColor};padding:2px 8px;border-radius:2px;font-size:13px;font-weight:500"`;
    return `
      <tr ${highlight} style="animation-delay:${idx * 50}ms">
        <td class="bold">${item.name}</td>
        <td class="muted">${item.team}</td>
        <td>${item.trips} chuyến</td>
        <td>${item.points} điểm</td>
        <td><span ${surchargeStyle}>${item.surcharge} VNĐ</span></td>
        <td class="bold text-primary">${item.total} VNĐ</td>
        <td class="right"><button class="btn btn--secondary btn--sm js-driver-detail" data-driver="${item.name}">Chi tiết</button></td>
      </tr>`;
  },

  trailerRow(item, idx) {
    const statusMap = { active: ['success', 'Sẵn sàng'], broken: ['error', 'Hỏng dùng'], maintenance: ['warning', 'Bảo dưỡng'] };
    const [sType, sLabel] = statusMap[item.status] || ['neutral', item.status];
    return `
      <tr style="animation-delay:${idx * 50}ms">
        <td class="bold">${item.id}</td>
        <td class="muted">${item.type}</td>
        <td>${item.axles}</td>
        <td class="muted">${item.capacity}</td>
        <td>${UI.chip(sLabel, sType, true)}</td>
        <td class="right">
          <button class="btn btn--ghost btn--sm">
            <span class="material-symbols-outlined icon-sm">edit</span>
          </button>
        </td>
      </tr>`;
  },

  kanbanCard({ title, body, alert: alertText, action, modal }) {
    const alertEl = alertText ? `
      <div class="inline-alert inline-alert--warning">
        <span class="material-symbols-outlined">warning</span> ${alertText}
      </div>` : '';
    return `
      <div class="kanban-card" draggable="true">
        <p class="kanban-card__title">${title}</p>
        <p class="kanban-card__body">${body}</p>
        ${alertEl}
        <button class="btn btn--secondary btn--compact" style="width:100%" data-modal="${modal}">${action}</button>
      </div>`;
  },

  flowCard(flow, active = false) {
    return `
      <div class="flow-card${active ? ' active' : ''}" data-flow="${flow.id}" tabindex="0">
        <div class="flow-card__header">
          <span class="flow-card__icon">${flow.icon}</span>
          <span class="flow-card__name">${flow.name}</span>
        </div>
        <p class="flow-card__desc">${flow.desc}</p>
        <span class="flow-card__route" style="background:${flow.color};border:1px solid ${flow.borderColor};color:${flow.textColor}">LỘ TRÌNH: ${flow.route}</span>
      </div>`;
  },

  hubCard(hub) {
    const features = hub.features
      ? hub.features.map(f => `<button class="btn btn--secondary btn--sm">${f}</button>`).join('') : '';
    const featureRow = features ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${features}</div>` : '';
    return `
      <div class="hub-card" style="flex-direction:column;align-items:flex-start;gap:8px">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="hub-card__icon">
            <span class="material-symbols-outlined">warehouse</span>
          </div>
          <div>
            <p class="hub-card__name">${hub.name}</p>
            <p class="hub-card__cap">${hub.capacity}</p>
          </div>
        </div>
        ${featureRow}
      </div>`;
  },

  clientRow(client) {
    const checked = client.reuseEnabled ? 'checked' : '';
    return `
      <div class="client-row">
        <div class="client-row__info">
          <span class="client-row__avatar">${client.id}</span>
          <span class="label-md">${client.name}</span>
        </div>
        <div class="client-row__toggle">
          <span class="body-sm text-on-surface-variant">Sóc chứa cont rỗng quay về</span>
          <label class="toggle"><input type="checkbox" ${checked} /><span class="toggle__track"></span></label>
        </div>
      </div>`;
  },

  renderDispatchTable(items) {
    const rows = items.map((item, i) => UI.dispatchRow(item, i)).join('');
    return rows;
  },

  renderContainerTable(items) {
    return items.map((item, i) => UI.containerRow(item, i)).join('');
  },

  renderDriverTable(items) {
    return items.map((item, i) => UI.driverRow(item, i)).join('');
  },

  renderTrailerTable(items) {
    return items.map((item, i) => UI.trailerRow(item, i)).join('');
  },

  routeSuggestionCard(route) {
    return `
      <div class="card" style="cursor:pointer;transition:all 0.2s ease;border:2px solid transparent">
        <div class="stack stack--12">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:var(--space-12)">
            <div>
              <p class="label-caps" style="color:var(--color-primary)">${route.priority}</p>
              <p class="body-md" style="margin-top:4px;font-weight:500">${route.route}</p>
            </div>
            <span class="chip chip--success" style="white-space:nowrap">
              <span class="chip__dot"></span>${route.time}
            </span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-12)">
            <div>
              <p class="label-sm" style="color:var(--color-on-surface-variant)">Phương tiện</p>
              <p class="body-sm">${route.vehicle}</p>
            </div>
            <div>
              <p class="label-sm" style="color:var(--color-on-surface-variant)">Chi phí dự kiến</p>
              <p class="body-sm" style="font-weight:600">${route.cost}</p>
            </div>
            <div>
              <p class="label-sm" style="color:var(--color-on-surface-variant)">Tải trọng</p>
              <p class="body-sm">${route.load}</p>
            </div>
            <div>
              <p class="label-sm" style="color:var(--color-on-surface-variant)">Container</p>
              <p class="body-sm">${route.containers.join(', ')}</p>
            </div>
          </div>
          <p class="body-sm" style="padding:8px 12px;background:var(--color-surface-container-low);border-radius:var(--radius-lg);color:var(--color-on-surface-variant)">
            <span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle">info</span>
            ${route.notes}
          </p>
        </div>
      </div>`;
  },

  hubCostRow(item, idx) {
    return `
      <tr style="animation-delay:${idx * 50}ms">
        <td class="bold">${item.hub}</td>
        <td>${item.operations}</td>
        <td class="muted">${item.dropFee}</td>
        <td class="muted">${item.storageFee}</td>
        <td class="text-primary" style="font-weight:600">${item.monthlyTotal}</td>
      </tr>`;
  },

  renderHubCostTable(items) {
    return items.map((item, i) => UI.hubCostRow(item, i)).join('');
  },
};
