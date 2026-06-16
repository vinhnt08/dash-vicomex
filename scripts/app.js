const App = (() => {
  /* ── State ── */
  let currentTab  = 'import';

  /* ── Cached DOM roots ── */
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  /* ── Routing ── */
  function navigateTo(view) {
    $$('.view').forEach(el => el.classList.remove('active'));
    $$('.nav-item').forEach(el => el.classList.remove('active'));

    const viewEl = $(`view-${view}`);
    const navEl  = document.querySelector(`.nav-item[data-view="${view}"]`);
    if (viewEl) {
      viewEl.classList.add('active');
      const inner = viewEl.querySelector('main, .page');
      if (inner) {
        inner.classList.remove('page-enter');
        void inner.offsetWidth;
        inner.classList.add('page-enter');
      }
    }
    if (navEl) navEl.classList.add('active');

    document.querySelector('.topbar__title').textContent = NAV_TITLES[view] || 'Control Tower';

    if (view === 'orders')    renderOrders();
    if (view === 'resources') renderResources();
    if (view === 'costs')     renderCosts();
    if (view === 'data')      renderSystemData();
    if (view === 'analytics') renderAnalytics();
    if (view === 'drivers')   renderDriverManagement();
    if (view === 'hub-ops')   renderHubOps();
    if (view === 'customers') renderCustomerManagement();
    if (view === 'reports')   renderReports();
  }

  const NAV_TITLES = {
    dashboard: 'Control Tower – Bảng điều khiển trung tâm',
    orders:    'Quản lý Luồng Vận Hành',
    resources: 'Điều phối Nghiệp vụ & Nguồn lực',
    data:      'Quản trị Dữ liệu Hệ thống',
    costs:     'Quản lý Nguồn lực & Chi phí',
    analytics: 'Phân tích Hiệu suất',
    drivers:   'Quản lý Tài xế',
    'hub-ops':   'Hub Operations Console',
    customers:   'Quản lý Khách hàng',
    reports:     'Báo cáo & Xuất dữ liệu',
  };

  /* ── Dashboard ── */
  function renderDashboard() {
    const { stats, alerts, dispatchQueue } = DATA;

    /* Stat cards */
    $('stat-output').innerHTML = UI.statCard({
      label: stats.output.label,
      value: `${stats.output.current} / ${stats.output.target}`,
      unit: stats.output.unit,
      sub: `Đạt ${stats.output.pct}% mục tiêu ngày`,
      subType: 'success',
    });
    $('stat-progress').innerHTML = UI.statCard({
      label: stats.progress.label,
      value: stats.progress.current.toLocaleString('vi'),
      unit: stats.progress.unit,
      sub: `Mục tiêu: >${stats.progress.target.toLocaleString('vi')} chuyến/tháng`,
      subType: 'neutral',
    });
    $('stat-resources').innerHTML = UI.statCard({
      label: stats.resources.label,
      value: `${stats.resources.trucks.active}/${stats.resources.trucks.total}`,
      unit: 'Đầu kéo',
      sub: `Rơ mooc: ${stats.resources.trailers.active}/${stats.resources.trailers.total} | Chuyên dụng: ${stats.resources.special.active}/${stats.resources.special.total}`,
      subType: null,
    });
    $('stat-clients').innerHTML = UI.statCard({
      label: stats.clients.label,
      value: stats.clients.count,
      unit: 'Khách hàng',
      sub: `Tuyến ${stats.clients.route}`,
      subType: null,
    });

    /* Alerts */
    $('alert-list').innerHTML = alerts.map(a => UI.alert(a.type, a.icon, a.text)).join('');

    /* Dispatch table */
    $('dispatch-tbody').innerHTML = UI.renderDispatchTable(dispatchQueue);
  }

  /* ── Orders ── */
  function renderOrders() {
    FlowBuilder.init();
    renderContainerTab();
  }

  function renderContainerTab() {
    const items = currentTab === 'import' ? DATA.importContainers : DATA.exportContainers;
    $('container-tbody').innerHTML = UI.renderContainerTable(items);
    $$('#view-orders .tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === currentTab);
    });
  }

  function createContainerFromFlow(flowData) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const etaDate = new Date(now.getTime() + 3 * 86400000);

    const ids = flowData.containerIds.length ? flowData.containerIds : [`CONT-NEW-${Date.now()}`];
    ids.forEach(id => {
      const entry = {
        id,
        client: '(Chưa gán)',
        direction:   flowData.direction,
        templateId:  flowData.templateId,
        route:       flowData.route || '–',
        status:      'Chờ điều phối',
        statusType:  'neutral',
        laden:       'Loaded',
        truck:       flowData.truck,
        createdAt:   fmt(now),
        eta:         fmt(etaDate),
        notes:       flowData.notes,
      };
      if (flowData.direction === 'import') DATA.importContainers.unshift(entry);
      else DATA.exportContainers.unshift(entry);
    });

    currentTab = flowData.direction;
    renderContainerTab();
    setTimeout(() => {
      document.querySelector('#view-orders .card:last-child')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function updateContainerFromFlow(containerId, flowData) {
    const arrays = [DATA.importContainers, DATA.exportContainers];
    for (const arr of arrays) {
      const idx = arr.findIndex(c => c.id === containerId);
      if (idx !== -1) {
        arr[idx] = {
          ...arr[idx],
          ...(flowData.templateId ? { templateId: flowData.templateId } : {}),
          ...(flowData.route      ? { route: flowData.route }           : {}),
          ...(flowData.truck      ? { truck: flowData.truck }           : {}),
          ...(flowData.notes      ? { notes: flowData.notes }           : {}),
        };
        break;
      }
    }
    renderContainerTab();
  }

  /* ── Resources / Nghiệp vụ ── */
  function renderResources() {
    const { kanban } = DATA;

    $('kanban-cat-mooc').innerHTML  = kanban.catMooc.map(c => UI.kanbanCard(c)).join('');
    $('kanban-ha-cont').innerHTML   = kanban.haCont.map(c => UI.kanbanCard(c)).join('');
    $('kanban-swap-cont').innerHTML = kanban.swapCont.map(c => UI.kanbanCard(c)).join('');
  }

  /* ── Costs / Resource overview ── */
  function renderCosts() {
    const { resources, drivers, hubCosts } = DATA;

    $('cost-hub-list').innerHTML = resources.hubs.map(h => `
      <div class="hub-card">
        <div class="hub-card__icon"><span class="material-symbols-outlined">warehouse</span></div>
        <div>
          <p class="hub-card__name">${h.name}</p>
          <p class="hub-card__cap">Có ${h.vehicles} xe chuyên dụng</p>
        </div>
      </div>`).join('');

    $('hub-costs-tbody').innerHTML = UI.renderHubCostTable(hubCosts);
    $('driver-tbody').innerHTML = UI.renderDriverTable(drivers);
  }

  /* ── System data ── */
  function renderSystemData() {
    const { systemData } = DATA;
    $('trailer-tbody').innerHTML  = UI.renderTrailerTable(systemData.trailers);
    $('hub-preview').innerHTML    = systemData.hubs.map(h => UI.hubCard(h)).join('');
    $('client-list').innerHTML    = systemData.clients.map(c => UI.clientRow(c)).join('');
  }

  /* ── Driver Management ── */
  function renderDriverManagement() {
    renderDriverTable();
    $('driver-search')?.addEventListener('input', renderDriverTable);
    $('driver-filter-team')?.addEventListener('change', renderDriverTable);
    $('driver-filter-status')?.addEventListener('change', renderDriverTable);
  }

  function renderDriverTable() {
    const search = ($('driver-search')?.value || '').toLowerCase();
    const team   = $('driver-filter-status') ? ($('driver-filter-team')?.value || '') : '';
    const status = $('driver-filter-status')?.value || '';

    const filtered = DATA.driverProfiles.filter(d => {
      if (search && !d.name.toLowerCase().includes(search) && !d.plate.toLowerCase().includes(search)) return false;
      if (team   && d.team !== team) return false;
      if (status && d.status !== status) return false;
      return true;
    });

    const STATUS_LABEL = { 'on-duty': 'Đang làm việc', 'off-duty': 'Nghỉ ca', 'on-leave': 'Nghỉ phép' };
    const STATUS_TYPE  = { 'on-duty': 'success', 'off-duty': 'neutral', 'on-leave': 'warning' };

    $('driver-mgmt-tbody').innerHTML = filtered.length
      ? filtered.map((d, i) => {
          const teamCls  = d.team === 'Đội 1' ? 'driver-avatar--team1' : 'driver-avatar--team2';
          const barColor = d.onTimeRate >= 90 ? 'var(--color-success)' : d.onTimeRate >= 80 ? 'var(--color-warning)' : 'var(--color-error)';
          return `
            <tr style="animation-delay:${i * 50}ms">
              <td>
                <div style="display:flex;align-items:center;gap:var(--space-12)">
                  <div class="driver-avatar ${teamCls}" aria-hidden="true">${d.initials}</div>
                  <div>
                    <p style="font-weight:600;font-size:14px;color:var(--color-on-surface)">${d.name}</p>
                    <p style="font-size:12px;color:var(--color-on-surface-variant)">${d.phone}</p>
                  </div>
                </div>
              </td>
              <td class="muted">${d.team}</td>
              <td>${UI.chip(STATUS_LABEL[d.status], STATUS_TYPE[d.status], true)}</td>
              <td style="font-weight:500">${d.trips} chuyến</td>
              <td>
                <div style="display:flex;align-items:center;gap:var(--space-8)">
                  <div style="width:48px;height:4px;background:var(--color-surface-container-high);border-radius:var(--radius-full);overflow:hidden">
                    <div style="width:${d.onTimeRate}%;height:100%;background:${barColor};border-radius:var(--radius-full)"></div>
                  </div>
                  <span style="font-size:12px;font-weight:600">${d.onTimeRate}%</span>
                </div>
              </td>
              <td style="font-weight:500;font-size:13px">${d.salary}</td>
              <td class="right">
                <button class="btn btn--ghost btn--sm js-driver-profile" data-driver-id="${d.id}">
                  <span class="material-symbols-outlined icon-sm">open_in_new</span>
                  Chi tiết
                </button>
              </td>
            </tr>`;
        }).join('')
      : `<tr><td colspan="7" style="text-align:center;color:var(--color-on-surface-variant);padding:var(--space-32)">Không tìm thấy tài xế nào</td></tr>`;
  }

  function openDriverProfile(driver) {
    const STATUS_LABEL = { 'on-duty': 'Đang làm việc', 'off-duty': 'Nghỉ ca', 'on-leave': 'Nghỉ phép' };
    const STATUS_TYPE  = { 'on-duty': 'success', 'off-duty': 'neutral', 'on-leave': 'warning' };
    const teamCls = driver.team === 'Đội 1' ? 'driver-avatar--team1' : 'driver-avatar--team2';

    $('profile-avatar').textContent = driver.initials;
    $('profile-avatar').className   = `driver-avatar driver-avatar--lg ${teamCls}`;
    $('profile-modal-title').textContent = driver.name;
    $('profile-status').innerHTML   = UI.chip(STATUS_LABEL[driver.status], STATUS_TYPE[driver.status], true);
    $('profile-team-label').textContent = driver.team;
    $('profile-plate').textContent  = `· ${driver.plate}`;

    $('profile-phone').textContent      = driver.phone;
    $('profile-hire-date').textContent  = driver.hireDate;
    $('profile-license-id').textContent = driver.licenseId;
    $('profile-license-exp').textContent = driver.licenseExpiry;

    $('profile-current-trip').innerHTML = driver.currentTrip
      ? `<div class="alert alert--info">
           <span class="material-symbols-outlined">local_shipping</span>
           <div>
             <p style="font-weight:600;font-size:13px;margin-bottom:2px">Đang chạy chuyến</p>
             <p style="font-size:12px">${driver.currentTrip.orderId} · ${driver.currentTrip.route} · ETA ${driver.currentTrip.eta}</p>
           </div>
         </div>`
      : '';

    $('perf-trips').textContent = driver.trips;
    $('perf-ontime').innerHTML  = `${driver.onTimeRate}<span class="kpi-card__unit">%</span>`;
    $('perf-stars').innerHTML   = buildStars(driver.avgRating);
    $('perf-rating').textContent = driver.avgRating.toFixed(1);
    $('perf-salary').textContent = driver.salary;
    $('perf-monthly-chart').innerHTML = buildMiniBarChart(driver.monthly);

    $('perf-violations').innerHTML = driver.violations.length
      ? driver.violations.map(v => `
          <div class="alert alert--warning" style="margin-bottom:var(--space-8)">
            <span class="material-symbols-outlined">warning</span>
            <div>
              <p style="font-weight:600;font-size:13px">${v.type} <span style="font-weight:400;color:var(--color-on-surface-variant)">· ${v.date}</span></p>
              <p style="font-size:12px;margin-top:2px">${v.desc}</p>
            </div>
          </div>`).join('')
      : `<div style="display:flex;align-items:center;gap:var(--space-8);padding:var(--space-12);background:var(--color-success-bg);border-radius:var(--radius-lg)">
           <span class="material-symbols-outlined icon-fill" style="color:var(--color-success)">verified</span>
           <span style="font-size:13px;color:var(--color-success-text)">Không có vi phạm trong tháng</span>
         </div>`;

    $('profile-trip-tbody').innerHTML = driver.tripHistory.map((t, i) => `
      <tr style="animation-delay:${i * 40}ms">
        <td class="muted" style="white-space:nowrap">${t.date}/06</td>
        <td class="bold">${t.orderId}</td>
        <td class="muted" style="font-size:12px">${t.route}</td>
        <td style="font-weight:500;white-space:nowrap">${t.earnings} VNĐ</td>
        <td><span style="display:flex;gap:1px">${buildStars(t.rating)}</span></td>
      </tr>`).join('');

    $$('#modal-driver-profile .modal-tab').forEach((t, i) => {
      t.classList.toggle('active', i === 0);
      t.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    });
    $$('#modal-driver-profile [data-driver-panel]').forEach((p, i) => { p.hidden = i !== 0; });

    openModal('modal-driver-profile');
  }

  function buildStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return `<span class="material-symbols-outlined star-icon">star</span>`;
      if (i === full && half) return `<span class="material-symbols-outlined star-icon">star_half</span>`;
      return `<span class="material-symbols-outlined star-icon star-icon--empty">star</span>`;
    }).join('');
  }

  function buildMiniBarChart(monthly) {
    const max = Math.max(...monthly) * 1.1;
    const H   = 56;
    const labels = ['T1','T2','T3','T4','T5','T6'];
    const bars = monthly.map((v, i) => {
      const bH = Math.round((v / max) * H);
      const opacity = 0.35 + (i / (monthly.length - 1)) * 0.65;
      return `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <span style="font-size:10px;font-weight:600;color:var(--color-on-surface-variant)">${v}</span>
          <div style="flex:1;width:100%;display:flex;align-items:flex-end">
            <div style="width:100%;height:${bH}px;background:var(--color-primary);border-radius:var(--radius-sm) var(--radius-sm) 0 0;opacity:${opacity.toFixed(2)}"></div>
          </div>
          <span style="font-size:10px;color:var(--color-on-surface-variant)">${labels[i]}</span>
        </div>`;
    }).join('');
    return `<div style="display:flex;align-items:flex-end;gap:var(--space-8);height:${H + 32}px">${bars}</div>`;
  }

  /* ── Analytics ── */
  function renderAnalytics() {
    const d = ANALYTICS_DATA;

    $('analytics-kpis').innerHTML = d.kpis.map((kpi, i) => {
      const up = kpi.trend > 0;
      const trendCls = kpi.trendGood ? 'kpi-card__trend--good' : 'kpi-card__trend--bad';
      const icon = up ? 'trending_up' : 'trending_down';
      const sign = up ? '+' : '';
      return `
        <div class="kpi-card" style="animation-delay:${i * 60}ms">
          <div class="kpi-card__top">
            <p class="kpi-card__label">${kpi.label}</p>
            <span class="kpi-card__trend ${trendCls}">
              <span class="material-symbols-outlined">${icon}</span>${sign}${Math.abs(kpi.trend)}%
            </span>
          </div>
          <div class="kpi-card__value">${kpi.value}<span class="kpi-card__unit">${kpi.unit}</span></div>
          <div class="kpi-card__bar"><div class="kpi-card__fill" style="width:${kpi.barPct}%"></div></div>
        </div>`;
    }).join('');

    $('line-chart-container').innerHTML = buildLineChart(d.daily);
    $('donut-chart-container').innerHTML = buildDonut(d.hubBreakdown);
    $('donut-legend').innerHTML = d.hubBreakdown.map((seg, i) => {
      const colors = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)'];
      return `
        <div style="display:flex;align-items:center;gap:var(--space-8);font-size:13px">
          <span style="width:12px;height:12px;border-radius:var(--radius-sm);background:${colors[i]};flex-shrink:0"></span>
          <span style="color:var(--color-on-surface-variant);flex:1">${seg.label}</span>
          <span style="font-weight:600;color:var(--color-on-surface)">${seg.pct}%</span>
          <span style="color:var(--color-on-surface-variant);font-size:11px;min-width:72px;text-align:right">${seg.amount}</span>
        </div>`;
    }).join('');

    $('bar-chart-container').innerHTML = buildBarChart(d.monthly);

    $('vehicle-ranking-tbody').innerHTML = d.vehicleRanking.map((v, i) => `
      <tr style="animation-delay:${i * 60}ms">
        <td>${rankBadge(v.rank)}</td>
        <td class="bold">${v.plate}</td>
        <td class="muted">${v.driver}</td>
        <td>${v.trips}</td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-8)">
            <div style="width:52px;height:4px;background:var(--color-surface-container-high);border-radius:var(--radius-full);overflow:hidden">
              <div style="width:${v.onTime}%;height:100%;background:var(--color-success);border-radius:var(--radius-full)"></div>
            </div>
            <span style="font-size:12px;font-weight:600;color:${v.onTime >= 90 ? 'var(--color-success)' : 'var(--color-on-surface-variant)'}">${v.onTime}%</span>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:var(--space-8)">
            <div style="width:52px;height:4px;background:var(--color-surface-container-high);border-radius:var(--radius-full);overflow:hidden">
              <div style="width:${v.util}%;height:100%;background:var(--color-info);border-radius:var(--radius-full)"></div>
            </div>
            <span style="font-size:12px;font-weight:500">${v.util}%</span>
          </div>
        </td>
      </tr>`).join('');
  }

  function rankBadge(rank) {
    if (rank === 1) return '<span class="material-symbols-outlined icon-fill" style="color:#F59E0B;font-size:18px">workspace_premium</span>';
    if (rank <= 3) return `<span style="font-size:12px;font-weight:700;color:var(--color-secondary)">#${rank}</span>`;
    return `<span style="font-size:12px;color:var(--color-on-surface-variant)">${rank}</span>`;
  }

  function buildLineChart(data) {
    const W = 700, H = 220, PL = 44, PR = 16, PT = 12, PB = 36;
    const plotW = W - PL - PR, plotH = H - PT - PB;
    const max = Math.ceil(Math.max(...data.map(d => d.containers)) / 10) * 10 + 10;
    const xOf = i => PL + (i / (data.length - 1)) * plotW;
    const yOf = v => PT + plotH * (1 - v / max);

    const cPts  = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.containers).toFixed(1)}`).join(' ');
    const oPts  = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d.onTime).toFixed(1)}`).join(' ');
    const area  = `${xOf(0).toFixed(1)},${(PT + plotH).toFixed(1)} ${cPts} ${xOf(data.length - 1).toFixed(1)},${(PT + plotH).toFixed(1)}`;

    const gridVals = [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];
    const grid = gridVals.map(v => {
      const y = yOf(v).toFixed(1);
      return `<line x1="${PL}" y1="${y}" x2="${W - PR}" y2="${y}" stroke-width="1" style="stroke:var(--color-outline-variant)"/>
<text x="${PL - 6}" y="${(parseFloat(y) + 4).toFixed(0)}" text-anchor="end" font-size="10" style="fill:var(--color-on-surface-variant)">${v}</text>`;
    }).join('');

    const step = 2;
    const xLabels = data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map(({ label }, _, arr) => {
        const origI = data.findIndex(d => d.label === label);
        return `<text x="${xOf(origI).toFixed(1)}" y="${H - PB + 16}" text-anchor="middle" font-size="10" style="fill:var(--color-on-surface-variant)">${label}</text>`;
      }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <defs>
    <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${grid}
  ${xLabels}
  <polygon points="${area}" fill="url(#lc-area)"/>
  <polyline points="${cPts}" fill="none" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--color-primary)"/>
  <polyline points="${oPts}" fill="none" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="6,3" style="stroke:var(--color-success)"/>
</svg>`;
  }

  function buildDonut(segments) {
    const r = 68, cx = 90, cy = 90;
    const circ = 2 * Math.PI * r;
    const colors = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)'];
    let cum = 0;
    const circles = segments.map((seg, i) => {
      const len = (seg.pct / 100) * circ;
      const offset = circ / 4 - (cum / 100) * circ;
      cum += seg.pct;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="20"
        style="stroke:${colors[i]}"
        stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}"
        stroke-dashoffset="${offset.toFixed(2)}"/>`;
    }).join('\n  ');
    const total = segments.reduce((s, seg) => s + seg.pct, 0);
    return `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style="width:160px;height:160px;flex-shrink:0">
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="20" style="stroke:var(--color-surface-container-high)"/>
  ${circles}
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="22" font-weight="700" style="fill:var(--color-on-surface);font-family:'Hanken Grotesk',sans-serif">${total}%</text>
  <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" style="fill:var(--color-on-surface-variant)">Chi phí</text>
</svg>`;
  }

  function buildBarChart(data) {
    const maxVal = Math.max(...data.map(m => m.revenue)) * 1.08;
    const chartH = 160;
    const bars = data.map((m, i) => {
      const rH = Math.round((m.revenue / maxVal) * chartH);
      const eH = Math.round((m.expenses / maxVal) * chartH);
      return `
        <div class="bar-group" style="animation-delay:${i * 70}ms">
          <div class="bar-pair">
            <div class="bar bar--primary" style="height:${rH}px"></div>
            <div class="bar bar--muted" style="height:${eH}px"></div>
          </div>
          <div class="bar-group__label">${m.label}</div>
        </div>`;
    }).join('');
    return `<div class="bar-chart"><div class="bar-chart__area">${bars}</div><div class="bar-chart__baseline"></div></div>`;
  }

  /* ── Route Suggestions ── */
  function renderRoutesuggestions() {
    const { routeSuggestions } = DATA;
    const container = $('route-suggestions');
    if (container) {
      container.innerHTML = routeSuggestions.map(route => UI.routeSuggestionCard(route)).join('');
      $$('#route-suggestions .card').forEach((card, idx) => {
        card.style.animationDelay = (idx * 50) + 'ms';
        card.addEventListener('click', () => {
          $$('#route-suggestions .card').forEach(c => c.style.borderColor = 'transparent');
          card.style.borderColor = 'var(--color-primary)';
          card.style.backgroundColor = 'var(--color-surface-container-low)';
        });
      });
    }
  }

  /* ── Modals ── */
  function openModal(id) {
    const el = $(id);
    if (!el) return;
    el.classList.add('open');
    el.querySelector('.modal')?.focus();
  }
  /* ── Sidebar (mobile) ── */
  const sidebar        = document.querySelector('.sidebar');
  const sidebarOverlay = $('sidebar-overlay');

  /* ── Reports ── */
  let currentReportPeriod = 'month';

  function renderReports() {
    renderReportKPIs(currentReportPeriod);
    renderReportVolumeChart();
    renderReportBreakdowns();
    renderReportRoutes();
    renderReportBreakdownTable();
  }

  function renderReportKPIs(period) {
    const s    = DATA.reports.summary[period];
    const cards = $('report-kpi-cards');
    if (!cards) return;

    const trend = (cur, prev, unit = '', invert = false) => {
      const pct  = prev ? Math.round(((cur - prev) / prev) * 100) : 0;
      const good = invert ? pct < 0 : pct >= 0;
      const sign = pct >= 0 ? '+' : '';
      return `<span class="report-kpi__trend report-kpi__trend--${good ? 'good' : 'bad'}">
        <span class="material-symbols-outlined">${good ? 'trending_up' : 'trending_down'}</span>
        ${sign}${pct}% vs kỳ trước
      </span>`;
    };

    const fmtRevenue = v => (v / 1e9).toFixed(2) + ' tỷ';

    cards.innerHTML = [
      { label: 'Tổng Cont vận chuyển', value: s.totalConts,    unit: 'cont', trendHtml: trend(s.totalConts, s.prevTotalConts) },
      { label: 'Doanh thu ước tính',   value: fmtRevenue(s.revenue), unit: 'VNĐ', trendHtml: trend(s.revenue, s.prevRevenue) },
      { label: 'Tỷ lệ đúng hạn TB',   value: s.onTimeRate + '%', unit: '',  trendHtml: trend(s.onTimeRate, s.prevOnTimeRate) },
      { label: 'Tài xế hoạt động',     value: s.activeDrivers,  unit: 'người', trendHtml: trend(s.activeDrivers, s.prevActiveDrivers) },
    ].map(k => `
      <div class="card report-kpi">
        <p class="report-kpi__label">${k.label}</p>
        <p class="report-kpi__value">${k.value} <span class="report-kpi__unit">${k.unit}</span></p>
        ${k.trendHtml}
      </div>`).join('');
  }

  function renderReportVolumeChart() {
    const el = $('report-volume-chart');
    if (!el) return;
    const allData = DATA.reports.monthly;
    const activeData = allData.filter(d => d.conts > 0);
    if (!activeData.length) { el.innerHTML = ''; return; }

    const maxVal = Math.max(...activeData.map(d => d.conts));
    const chartH = 120;
    const W = 540, H = chartH + 20;
    const padL = 8, padR = 8;
    const slotW = (W - padL - padR) / activeData.length;

    const points = activeData.map((d, i) => ({
      x: padL + i * slotW + slotW / 2,
      y: H - 20 - Math.round((d.conts / maxVal) * chartH),
      d,
    }));

    const areaD = `M ${points[0].x} ${H - 20} ` +
      points.map(p => `L ${p.x} ${p.y}`).join(' ') +
      ` L ${points[points.length - 1].x} ${H - 20} Z`;

    const bars = activeData.map((d, i) => {
      const x  = padL + i * slotW;
      const bH = Math.round((d.conts / maxVal) * chartH);
      return `<rect x="${x + 4}" y="${H - 20 - bH}" width="${slotW - 8}" height="${bH}" rx="3"
        style="fill:var(--color-primary);opacity:0.08"/>`;
    }).join('');

    const labels = activeData.map((d, i) => {
      const x = padL + i * slotW + slotW / 2;
      return `<text x="${x}" y="${H - 2}" text-anchor="middle" style="font-size:10px;fill:var(--color-on-surface-variant)">${d.month}</text>`;
    }).join('');

    const dots = points.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="3.5" style="fill:var(--color-primary)"/>
       <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" style="font-size:10px;font-weight:600;fill:var(--color-on-surface)">${p.d.conts}</text>`
    ).join('');

    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;overflow:visible" aria-hidden="true">
      <defs>
        <linearGradient id="rpt-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   style="stop-color:var(--color-primary);stop-opacity:0.15"/>
          <stop offset="100%" style="stop-color:var(--color-primary);stop-opacity:0"/>
        </linearGradient>
      </defs>
      <line x1="${padL}" y1="${H-20}" x2="${W-padR}" y2="${H-20}" style="stroke:var(--color-outline-variant);stroke-width:1"/>
      ${bars}
      <path d="${areaD}" style="fill:url(#rpt-area-grad)"/>
      <polyline points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" style="fill:none;stroke:var(--color-primary);stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>
      ${dots}
      ${labels}
    </svg>`;
  }

  function renderReportBreakdowns() {
    const clientEl = $('report-by-client');
    const hubEl    = $('report-by-hub');
    if (!clientEl || !hubEl) return;

    clientEl.innerHTML = DATA.reports.byClient.map(c => `
      <div style="margin-bottom:var(--space-12)">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="font-weight:500;color:var(--color-on-surface)">${c.name}</span>
          <span style="color:var(--color-on-surface-variant)">${c.conts} cont · ${c.pct}%</span>
        </div>
        <div class="progress" style="height:8px">
          <div class="progress__bar" style="height:8px;width:${c.pct}%"></div>
        </div>
      </div>`).join('');

    hubEl.innerHTML = DATA.reports.byHub.map(h => `
      <div style="margin-bottom:var(--space-12)">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="font-weight:500;color:var(--color-on-surface)">${h.name}</span>
          <span style="color:var(--color-on-surface-variant)">${h.conts} cont · ${h.pct}%</span>
        </div>
        <div class="progress" style="height:8px">
          <div class="progress__bar" style="height:8px;width:${h.pct}%"></div>
        </div>
      </div>`).join('');
  }

  function renderReportRoutes() {
    const tbody = $('report-routes-tbody');
    if (!tbody) return;
    tbody.innerHTML = DATA.reports.byRoute.map(r => `<tr>
      <td>${r.route}</td>
      <td><span class="chip ${r.type === 'Import' ? 'chip--info' : 'chip--success'}" style="font-size:11px">${r.type}</span></td>
      <td>${r.conts}</td>
      <td>
        <div style="display:flex;align-items:center;gap:var(--space-8)">
          <div class="progress" style="height:6px;width:80px">
            <div class="progress__bar ${r.onTime < 93 ? 'progress__bar--warn' : ''}" style="height:6px;width:${r.onTime}%"></div>
          </div>
          <span style="font-size:12px;font-weight:600">${r.onTime}%</span>
        </div>
      </td>
      <td>${r.avgDays}</td>
    </tr>`).join('');
  }

  function renderReportBreakdownTable() {
    const tbody = $('report-breakdown-tbody');
    if (!tbody) return;
    const rows  = DATA.reports.monthlyBreakdown;
    const total = rows.reduce((s, r) => s + r.total, 0);
    tbody.innerHTML = rows.map(r => `<tr>
      <td>${r.month}</td>
      <td>${r.alpha}</td>
      <td>${r.beta}</td>
      <td>${r.gamma}</td>
      <td><strong>${r.total}</strong></td>
    </tr>`).join('') + `<tr style="background:var(--color-surface-container);font-weight:600">
      <td>Tổng cộng</td>
      <td>${rows.reduce((s,r)=>s+r.alpha,0)}</td>
      <td>${rows.reduce((s,r)=>s+r.beta,0)}</td>
      <td>${rows.reduce((s,r)=>s+r.gamma,0)}</td>
      <td><strong>${total}</strong></td>
    </tr>`;
  }

  /* ── Customer Management ── */
  function renderCustomerManagement() {
    renderCustomerCards();
    $('customer-search')?.addEventListener('input', renderCustomerCards);
    $('customer-filter-status')?.addEventListener('change', renderCustomerCards);
  }

  function renderCustomerCards() {
    const search = ($('customer-search')?.value || '').toLowerCase();
    const status = $('customer-filter-status')?.value || '';
    const grid   = $('customer-cards');
    if (!grid) return;

    const filtered = DATA.customerProfiles.filter(c => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search) ||
        c.contactName.toLowerCase().includes(search) ||
        c.industry.toLowerCase().includes(search);
      const matchStatus = !status || c.status === status;
      return matchSearch && matchStatus;
    });

    if (!filtered.length) {
      grid.innerHTML = '<p style="color:var(--color-on-surface-variant);grid-column:1/-1">Không tìm thấy khách hàng phù hợp.</p>';
      return;
    }

    const creditUsedPct = c => Math.round((c.outstanding / c.creditLimit) * 100);
    const slaOk = c => c.slaActual >= c.slaTarget;

    grid.innerHTML = filtered.map(c => `
      <div class="card customer-card js-customer-open" role="button" tabindex="0" data-cust-id="${c.id}">
        <div class="customer-card__header">
          <div class="customer-avatar customer-avatar--${c.id.toLowerCase().replace('-','')}">${c.initials}</div>
          <div style="flex:1;min-width:0">
            <p class="customer-card__name">${c.name}</p>
            <p class="customer-card__industry">${c.industry}</p>
          </div>
          <span class="chip ${c.status === 'active' ? 'chip--success' : 'chip--neutral'}">
            ${c.status === 'active' ? 'Hoạt động' : 'Ngừng'}
          </span>
        </div>
        <div class="customer-card__stats">
          <div class="customer-card__stat">
            <p class="customer-card__stat-val">${c.containersThisMonth}</p>
            <p class="customer-card__stat-label">Cont tháng này</p>
          </div>
          <div class="customer-card__stat">
            <p class="customer-card__stat-val ${slaOk(c) ? 'text-success' : 'text-error'}">${c.slaActual}%</p>
            <p class="customer-card__stat-label">SLA thực tế</p>
          </div>
          <div class="customer-card__stat">
            <p class="customer-card__stat-val">${(c.outstanding / 1e6).toFixed(1)}M</p>
            <p class="customer-card__stat-label">Dư nợ (VNĐ)</p>
          </div>
        </div>
        <div style="margin-top:var(--space-12)">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--color-on-surface-variant);margin-bottom:4px">
            <span>Hạn mức tín dụng</span>
            <span>${creditUsedPct(c)}%</span>
          </div>
          <div class="progress" style="height:6px">
            <div class="progress__bar ${creditUsedPct(c) >= 80 ? 'progress__bar--warn' : ''}"
              style="height:6px;width:${creditUsedPct(c)}%"></div>
          </div>
        </div>
        <div style="margin-top:var(--space-12);display:flex;gap:var(--space-4);flex-wrap:wrap">
          ${c.flows.map(f => `<span class="chip chip--neutral" style="font-size:10px;padding:1px 6px">${f}</span>`).join('')}
        </div>
      </div>`).join('');
  }

  function openCustomerProfile(cust) {
    const fmt = n => n.toLocaleString('vi') + ' ₫';
    const pct = Math.round((cust.outstanding / cust.creditLimit) * 100);

    $('cust-modal-avatar').textContent  = cust.initials;
    $('cust-modal-avatar').className    = `customer-avatar customer-avatar--lg customer-avatar--${cust.id.toLowerCase().replace('-','')}`;
    $('cust-modal-name').textContent    = cust.name;
    $('cust-modal-industry').textContent = cust.industry;
    $('cust-modal-id').textContent      = cust.id;
    $('cust-modal-status-chip').innerHTML = `<span class="chip ${cust.status === 'active' ? 'chip--success' : 'chip--neutral'}">${cust.status === 'active' ? 'Hoạt động' : 'Ngừng'}</span>`;

    $('cust-contact-name').textContent  = cust.contactName;
    $('cust-contact-phone').textContent = cust.contactPhone;
    $('cust-contact-email').textContent = cust.contactEmail;
    $('cust-address').textContent       = cust.address;
    $('cust-tax-code').textContent      = cust.taxCode;
    $('cust-flows').innerHTML           = cust.flows.map(f => `<span class="chip chip--neutral" style="font-size:11px;margin-right:4px">${f}</span>`).join('');

    const maxVol = Math.max(...cust.monthlyVolume);
    const months = ['T1','T2','T3','T4','T5','T6'];
    const barArea   = cust.monthlyVolume.map((v, i) => `<div style="flex:1;background:var(--color-info-text);border-radius:3px 3px 0 0;height:${Math.round((v/maxVol)*56)}px;opacity:${0.35+(i/cust.monthlyVolume.length)*0.65}"></div>`).join('');
    const labelArea = months.map(m => `<span style="flex:1;text-align:center;font-size:10px;color:var(--color-on-surface-variant)">${m}</span>`).join('');
    const numArea   = cust.monthlyVolume.map(v => `<span style="flex:1;text-align:center;font-size:10px;font-weight:600;color:var(--color-on-surface)">${v}</span>`).join('');
    $('cust-volume-chart').innerHTML =
      `<div style="display:flex;align-items:flex-end;gap:var(--space-8);height:56px">${barArea}</div>
       <div style="display:flex;gap:var(--space-8);margin-top:6px">${labelArea}</div>
       <div style="display:flex;gap:var(--space-8);margin-top:2px">${numArea}</div>`;

    $('cust-contract-start').textContent = cust.contractStart;
    $('cust-contract-end').textContent   = cust.contractEnd;
    $('cust-credit-limit').textContent   = fmt(cust.creditLimit);
    $('cust-outstanding').textContent    = fmt(cust.outstanding);
    $('cust-credit-bar').style.width     = pct + '%';
    $('cust-credit-bar').className       = `progress__bar ${pct >= 80 ? 'progress__bar--warn' : ''}`;
    $('cust-credit-pct').textContent     = `${pct}% hạn mức đã dùng`;

    $('cust-orders-tbody').innerHTML = cust.recentOrders.map(o => `<tr>
      <td><span class="cont-id">${o.contId}</span></td>
      <td>${o.type}</td>
      <td>${o.size}</td>
      <td>${o.route}</td>
      <td>${UI.chip(o.status, o.statusType, false)}</td>
      <td>${o.date}</td>
    </tr>`).join('');

    $('cust-kpi-ontime').textContent     = cust.kpis.onTimeRate + '%';
    $('cust-kpi-ontime-bar').style.width = cust.kpis.onTimeRate + '%';
    $('cust-kpi-ontime-bar').className   = `progress__bar ${cust.kpis.onTimeRate >= cust.slaTarget ? '' : 'progress__bar--warn'}`;
    $('cust-kpi-sla-target').textContent = cust.slaTarget + '%';
    $('cust-kpi-lead').textContent       = cust.kpis.avgLeadDays;
    $('cust-kpi-damage').textContent     = cust.kpis.damageRate + '%';
    $('cust-kpi-return').textContent     = cust.kpis.returnRate + '%';
    $('cust-kpi-this-month').textContent = cust.containersThisMonth + ' cont';
    $('cust-kpi-total').textContent      = cust.totalContainers + ' cont';

    $$('#overlay-customer-profile .modal-tab').forEach(t => {
      const sel = t.dataset.custTab === 'info';
      t.classList.toggle('active', sel);
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
    });
    $$('#overlay-customer-profile [data-cust-panel]').forEach(p => {
      p.hidden = p.dataset.custPanel !== 'info';
    });

    $('overlay-customer-profile').classList.add('open');
  }

  /* ── Hub Operations Console ── */
  let currentHub = 'kcn-lon';
  let currentQueue = 'incoming';

  function renderHubOps() {
    switchHub(currentHub);
  }

  function switchHub(hubKey) {
    currentHub = hubKey;
    const hub = DATA.hubOps[hubKey];
    if (!hub) return;

    $$('.hub-tab').forEach(btn => {
      const sel = btn.dataset.hub === hubKey;
      btn.classList.toggle('active', sel);
      btn.setAttribute('aria-selected', sel ? 'true' : 'false');
    });

    renderHubAlerts(hub);
    renderHubStatCards(hub);
    renderHubQueue(hub, currentQueue);
    renderHubOpsList(hub);
  }

  function renderHubAlerts(hub) {
    const bar = $('hub-alert-bar');
    if (!bar) return;
    if (!hub.alerts.length) { bar.innerHTML = ''; return; }
    bar.innerHTML = `<div class="alert-bar">${hub.alerts.map(a => `
      <div class="alert-bar__item alert-bar__item--${a.type}">
        <span class="material-symbols-outlined">${a.icon}</span>
        <span>${a.text}</span>
      </div>`).join('')}</div>`;
  }

  function renderHubStatCards(hub) {
    const container = $('hub-stat-cards');
    if (!container) return;
    const { current, max, unit } = hub.capacity;
    const pct = Math.round((current / max) * 100);
    const inProgress = hub.operations.filter(o => o.status === 'in-progress').length;
    const pending    = hub.operations.filter(o => o.status === 'pending').length;
    const delayed    = hub.incoming.filter(c => c.status === 'delayed').length;

    container.innerHTML = `
      <div class="card hub-stat-card">
        ${buildCapacityGauge(pct)}
        <p class="hub-stat-card__label">Công suất</p>
        <p class="hub-stat-card__value">${current}/${max} ${unit}</p>
      </div>
      <div class="card hub-stat-card">
        <p class="hub-stat-card__big">${inProgress}</p>
        <p class="hub-stat-card__label">Lệnh đang thực hiện</p>
        <p class="hub-stat-card__sub">${pending} lệnh chờ</p>
      </div>
      <div class="card hub-stat-card">
        <p class="hub-stat-card__big">${hub.incoming.length}</p>
        <p class="hub-stat-card__label">Cont đang đến</p>
        ${delayed ? `<p class="hub-stat-card__sub hub-stat-card__sub--warn">${delayed} bị trễ</p>` : '<p class="hub-stat-card__sub">Đúng lịch</p>'}
      </div>
      <div class="card hub-stat-card">
        <p class="hub-stat-card__big">${hub.outgoing.length}</p>
        <p class="hub-stat-card__label">Cont sẵn sàng xuất</p>
        <p class="hub-stat-card__sub">${hub.equipment.filter(e => e.status === 'available').length} xe sẵn sàng</p>
      </div>`;
  }

  function buildCapacityGauge(pct) {
    const r = 36;
    const cx = 48, cy = 48;
    const full   = Math.PI * r;
    const filled = (pct / 100) * full;
    const color  = pct >= 80 ? 'var(--color-error)' : pct >= 60 ? 'var(--color-warning)' : 'var(--color-success)';
    return `<svg class="hub-gauge" viewBox="0 0 96 56" aria-hidden="true">
      <path d="M 12 48 A 36 36 0 0 1 84 48" fill="none" stroke="var(--color-outline-variant)" stroke-width="8" stroke-linecap="round"/>
      <path d="M 12 48 A 36 36 0 0 1 84 48" fill="none"
        stroke="${color}" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${filled} ${full}"
        style="transform-origin:${cx}px ${cy}px"/>
      <text x="${cx}" y="44" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--color-on-surface)">${pct}%</text>
    </svg>`;
  }

  function renderHubQueue(hub, queueType) {
    currentQueue = queueType;
    const incomingBadge = $('incoming-badge');
    const outgoingBadge = $('outgoing-badge');
    if (incomingBadge) incomingBadge.textContent = hub.incoming.length;
    if (outgoingBadge) outgoingBadge.textContent = hub.outgoing.length;

    $$('[data-queue-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.queueTab === queueType);
    });

    const thead = $('hub-queue-thead');
    const tbody = $('hub-queue-tbody');
    if (!thead || !tbody) return;

    if (queueType === 'incoming') {
      thead.innerHTML = `<tr>
        <th>Cont ID</th><th>Khách hàng</th><th>Luồng</th>
        <th>Kích thước</th><th>ETA</th><th>Trạng thái</th>
      </tr>`;
      tbody.innerHTML = hub.incoming.map(c => `<tr>
        <td><span class="cont-id">${c.contId}</span></td>
        <td>${c.client}</td>
        <td>${c.flow}</td>
        <td>${c.size}</td>
        <td>${c.eta}</td>
        <td>${c.status === 'delayed'
          ? '<span class="chip chip--warning">Trễ</span>'
          : '<span class="chip chip--info">Đang đến</span>'}</td>
      </tr>`).join('');
    } else {
      thead.innerHTML = `<tr>
        <th>Cont ID</th><th>Khách hàng</th><th>Luồng</th>
        <th>Kích thước</th><th>Sẵn sàng lúc</th><th>Điểm đến</th>
      </tr>`;
      tbody.innerHTML = hub.outgoing.map(c => `<tr>
        <td><span class="cont-id">${c.contId}</span></td>
        <td>${c.client}</td>
        <td>${c.flow}</td>
        <td>${c.size}</td>
        <td>${c.readyAt}</td>
        <td>${c.dest}</td>
      </tr>`).join('');
    }
  }

  function renderHubOpsList(hub) {
    const list    = $('hub-ops-list');
    const summary = $('hub-ops-summary');
    if (!list) return;

    const groups = [
      { key: 'in-progress', label: 'Đang thực hiện', chipClass: 'chip--info' },
      { key: 'pending',     label: 'Chờ thực hiện',  chipClass: 'chip--default' },
      { key: 'done',        label: 'Hoàn thành',      chipClass: 'chip--success' },
    ];

    if (summary) {
      summary.innerHTML = groups.map(g => {
        const n = hub.operations.filter(o => o.status === g.key).length;
        const shortLabel = g.key === 'in-progress' ? 'Đang làm' : g.key === 'pending' ? 'Chờ' : 'Xong';
        return `<span class="chip ${g.chipClass}" style="font-size:10px;padding:2px 6px">${shortLabel} ${n}</span>`;
      }).join('');
    }

    list.innerHTML = groups.map(g => {
      const ops = hub.operations.filter(o => o.status === g.key);
      if (!ops.length) return '';
      return `<div class="hub-ops-group">
        <p class="hub-ops-group__label">${g.label}</p>
        ${ops.map(op => `
          <div class="hub-ops-item hub-ops-item--${op.status}">
            <div class="hub-ops-item__top">
              <span class="hub-ops-item__id">${op.id}</span>
              <span class="hub-ops-item__type">${op.type}</span>
            </div>
            <div class="hub-ops-item__meta">
              <span>${op.contId}</span>
              <span>${op.client}</span>
              ${op.assignedTo ? `<span><span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">forklift</span> ${op.assignedTo}</span>` : ''}
              ${op.startTime  ? `<span>${op.startTime}</span>` : ''}
            </div>
          </div>`).join('')}
      </div>`;
    }).join('');
  }

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
    $('btn-hamburger').setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
    $('btn-hamburger').setAttribute('aria-expanded', 'false');
  }

  /* ── Events ── */
  function bindEvents() {
    $('btn-hamburger').addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    $$('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        navigateTo(item.dataset.view);
        if (window.innerWidth < 768) closeSidebar();
      });
    });

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab && tab.closest('#view-orders')) {
        currentTab = tab.dataset.tab;
        renderContainerTab();
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-assign');
      if (btn) {
        openModal('modal-assign');
        $('modal-assign-title').textContent = `Phân công Cont ${btn.dataset.cont}`;
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-detail');
      if (btn) {
        const item = DATA.importContainers.concat(DATA.exportContainers).find(x => x.id === btn.dataset.id);
        if (item) {
          const allTmpls = [...DATA.templates.import, ...DATA.templates.export];
          const tmpl = allTmpls.find(t => t.id === item.templateId);

          $('detail-cont-id-header').textContent = item.id;
          $('detail-client').textContent          = item.client;
          $('detail-flow').textContent            = tmpl ? tmpl.label : (item.templateId || '–');
          $('detail-flow-desc').textContent       = tmpl ? tmpl.desc : '';
          $('detail-route').textContent           = item.route;
          $('detail-status').innerHTML            = UI.chip(item.status, item.statusType, true);
          $('detail-laden-status').innerHTML      = UI.chip(item.laden === 'Empty' ? 'Rỗng' : 'Có hàng', item.laden === 'Empty' ? 'info' : 'success', false);
          $('detail-truck').textContent           = item.truck ? `· Đầu kéo: ${item.truck}` : '';
          $('detail-created').textContent         = item.createdAt || '–';
          $('detail-eta').textContent             = item.eta || '–';
          $('detail-notes').textContent           = item.notes || 'Không có ghi chú';
          $('btn-edit-container')?.setAttribute('data-id', item.id);
          openModal('modal-container-detail');
        }
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-edit-container');
      if (btn) {
        $$('.overlay.open').forEach(el => el.classList.remove('open'));
        FlowBuilder.editContainer(btn.dataset.id);
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-driver-detail');
      if (btn) {
        const driver = DATA.drivers.find(d => d.name === btn.dataset.driver);
        if (driver) {
          $('detail-driver-name').textContent = btn.dataset.driver;
          $('detail-driver-team').textContent = driver.team;
          $('detail-driver-trips').textContent = driver.trips + ' chuyến';
          $('detail-driver-points').textContent = driver.points + ' điểm';
          $('detail-driver-surcharge').textContent = driver.surcharge + ' VNĐ';
          $('detail-driver-total').textContent = driver.total + ' VNĐ';
          $('detail-driver-notes').textContent = driver.highlight ? 'Vượt giới hạn phụ phí' : 'Không có ghi chú';
          openModal('modal-driver-detail');
        }
      }
    });

    $$('button').forEach(btn => {
      if (btn.textContent.includes('Tạo Lệnh Vận Chuyển') && btn.closest('.page-header'))
        btn.addEventListener('click', () => openModal('modal-create-order'));
    });

    const autoBtn = $('btn-auto-route');
    if (autoBtn) autoBtn.addEventListener('click', () => {
      renderRoutesuggestions();
      openModal('modal-auto-route');
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-modal]');
      if (btn) openModal(btn.dataset.modal);
    });

    document.addEventListener('click', e => {
      const closeBtn = e.target.closest('.js-modal-close, .modal__close');
      if (closeBtn) {
        closeBtn.closest('.overlay')?.classList.remove('open');
      }
      if (e.target.classList.contains('overlay'))
        e.target.classList.remove('open');
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-period]');
      if (!btn) return;
      $$('#analytics-period-tabs .tab').forEach(t => t.classList.toggle('active', t === btn));
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-driver-profile');
      if (!btn) return;
      const driver = DATA.driverProfiles.find(d => d.id === btn.dataset.driverId);
      if (driver) openDriverProfile(driver);
    });

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-driver-tab]');
      if (!tab) return;
      const panel = tab.dataset.driverTab;
      $$('#modal-driver-profile .modal-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.driverTab === panel);
        t.setAttribute('aria-selected', t.dataset.driverTab === panel ? 'true' : 'false');
      });
      $$('#modal-driver-profile [data-driver-panel]').forEach(p => {
        p.hidden = p.dataset.driverPanel !== panel;
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $$('.overlay.open').forEach(el => el.classList.remove('open'));
        closeSidebar();
      }
    });

    $$('.map-dot').forEach(dot => dot.setAttribute('tabindex', '0'));

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-sys-tab]');
      if (!tab) return;
      const view = tab.dataset.sysTab;
      $$('[data-sys-tab]').forEach(t => t.classList.toggle('active', t.dataset.sysTab === view));
      $$('[data-sys-panel]').forEach(p => p.hidden = p.dataset.sysPanel !== view);
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-report-period]');
      if (!btn) return;
      currentReportPeriod = btn.dataset.reportPeriod;
      $$('[data-report-period]').forEach(t => {
        t.classList.toggle('active', t.dataset.reportPeriod === currentReportPeriod);
        t.setAttribute('aria-selected', t.dataset.reportPeriod === currentReportPeriod ? 'true' : 'false');
      });
      renderReportKPIs(currentReportPeriod);
    });

    $('btn-export-pdf')?.addEventListener('click', () => {
      alert('Đang xuất báo cáo PDF… (chức năng demo)');
    });
    $('btn-export-excel')?.addEventListener('click', () => {
      alert('Đang xuất báo cáo Excel… (chức năng demo)');
    });

    document.addEventListener('click', e => {
      const card = e.target.closest('.js-customer-open');
      if (!card) return;
      const cust = DATA.customerProfiles.find(c => c.id === card.dataset.custId);
      if (cust) openCustomerProfile(cust);
    });

    document.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('js-customer-open')) {
        e.preventDefault();
        const cust = DATA.customerProfiles.find(c => c.id === e.target.dataset.custId);
        if (cust) openCustomerProfile(cust);
      }
    });

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-cust-tab]');
      if (!tab) return;
      const panel = tab.dataset.custTab;
      $$('#overlay-customer-profile .modal-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.custTab === panel);
        t.setAttribute('aria-selected', t.dataset.custTab === panel ? 'true' : 'false');
      });
      $$('#overlay-customer-profile [data-cust-panel]').forEach(p => {
        p.hidden = p.dataset.custPanel !== panel;
      });
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-hub]');
      if (!btn || !btn.classList.contains('hub-tab')) return;
      switchHub(btn.dataset.hub);
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-queue-tab]');
      if (!btn) return;
      const hub = DATA.hubOps[currentHub];
      if (hub) renderHubQueue(hub, btn.dataset.queueTab);
    });
  }

  /* ── Number counter animation ── */
  function animateCounters() {
    $$('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      let current = 0;
      const step  = Math.ceil(target / 30);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('vi');
        if (current >= target) clearInterval(timer);
      }, 20);
    });
  }

  /* ── Init ── */
  function init() {
    renderDashboard();
    renderCosts();
    bindEvents();
    navigateTo('dashboard');
    animateCounters();
  }

  return { init, navigateTo, createContainerFromFlow, updateContainerFromFlow };
})();

document.addEventListener('DOMContentLoaded', App.init);
