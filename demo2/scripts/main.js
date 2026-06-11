const App = (() => {
  /* ── State ── */
  let currentView = 'dashboard';
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
    currentView = view;

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
    const { flows, importContainers, exportContainers } = DATA;

    $('flow-cards').innerHTML = flows.map((f, i) => UI.flowCard(f, i === 0)).join('');

    renderContainerTab();

    /* Flow card click */
    $$('.flow-card').forEach(card => {
      card.addEventListener('click', () => {
        $$('.flow-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') card.click();
      });
    });
  }

  function renderContainerTab() {
    const items = currentTab === 'import' ? DATA.importContainers : DATA.exportContainers;
    $('container-tbody').innerHTML = UI.renderContainerTable(items);

    $$('#view-orders .tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === currentTab);
    });
  }

  /* ── Resources / Nghiệp vụ ── */
  function renderResources() {
    const { kanban, resources } = DATA;

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
  function closeModal(id) {
    const el = $(id);
    if (el) el.classList.remove('open');
  }

  /* ── Sidebar (mobile) ── */
  const sidebar  = document.querySelector('.sidebar');
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
    /* Hamburger */
    $('btn-hamburger').addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    /* Overlay click → close sidebar */
    sidebarOverlay.addEventListener('click', closeSidebar);

    /* Nav */
    $$('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        navigateTo(item.dataset.view);
        if (window.innerWidth < 768) closeSidebar();
      });
    });

    /* Tabs (order management) */
    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab && tab.closest('#view-orders')) {
        currentTab = tab.dataset.tab;
        renderContainerTab();
      }
    });

    /* Dispatch "assign" button */
    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-assign');
      if (btn) {
        const contId = btn.dataset.cont;
        openModal('modal-assign');
        $('modal-assign-title').textContent = `Phân công Cont ${contId}`;
      }
    });

    /* Container detail button */
    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-detail');
      if (btn) {
        const contId = btn.dataset.id;
        const item = DATA.importContainers.concat(DATA.exportContainers).find(x => x.id === contId);
        if (item) {
          $('detail-cont-id-header').textContent = item.id;
          $('detail-client').textContent = item.client;
          $('detail-flow').textContent = item.flow;
          $('detail-flow-desc').textContent = item.flowDesc || '';
          $('detail-route').textContent = item.route;
          $('detail-status').innerHTML = UI.chip(item.status, item.statusType, true);
          $('detail-laden-status').innerHTML = UI.chip(item.laden, item.laden === 'Empty' ? 'info' : 'success', false);
          $('detail-created').textContent = '23/06/2024 08:30';
          $('detail-eta').textContent = '25/06/2024 18:00';
          $('detail-notes').textContent = 'Ưu tiên giao tại Hồ Chí Minh trước 18h';
          openModal('modal-container-detail');
        }
      }
    });

    /* Driver detail button */
    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-driver-detail');
      if (btn) {
        const driverName = btn.dataset.driver;
        const driver = DATA.drivers.find(d => d.name === driverName);
        if (driver) {
          $('detail-driver-name').textContent = driverName;
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

    /* Create order button */
    $$('button').forEach(btn => {
      if (btn.textContent.includes('Tạo Lệnh Vận Chuyển') && btn.closest('.page-header')) {
        btn.addEventListener('click', () => openModal('modal-create-order'));
      }
    });

    /* Auto-route button */
    const autoBtn = $('btn-auto-route');
    if (autoBtn) autoBtn.addEventListener('click', () => {
      renderRoutesuggestions();
      openModal('modal-auto-route');
    });

    /* Kanban action buttons → modal */
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-modal]');
      if (btn) openModal(btn.dataset.modal);
    });

    /* Modal close buttons */
    document.addEventListener('click', e => {
      const closeBtn = e.target.closest('.js-modal-close, .modal__close');
      if (closeBtn) {
        const overlay = closeBtn.closest('.overlay');
        if (overlay) overlay.classList.remove('open');
      }
      /* Click outside modal */
      if (e.target.classList.contains('overlay')) {
        e.target.classList.remove('open');
      }
    });

    /* Keyboard ESC */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        $$('.overlay.open').forEach(el => el.classList.remove('open'));
        closeSidebar();
      }
    });

    /* Map dots tooltip placeholder */
    $$('.map-dot').forEach(dot => {
      dot.setAttribute('tabindex', '0');
    });

    /* Tab view in system data */
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

  return { init, navigateTo };
})();

document.addEventListener('DOMContentLoaded', App.init);
