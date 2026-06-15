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
  }

  const NAV_TITLES = {
    dashboard: 'Control Tower – Bảng điều khiển trung tâm',
    orders:    'Quản lý Luồng Vận Hành',
    resources: 'Điều phối Nghiệp vụ & Nguồn lực',
    data:      'Quản trị Dữ liệu Hệ thống',
    costs:     'Quản lý Nguồn lực & Chi phí',
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
