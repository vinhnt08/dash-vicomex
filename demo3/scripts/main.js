// Main Application Logic for Demo 3

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Logic (SPA Routing)
  const navItems = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.view');
  
  function navigateTo(viewId) {
    // Update active nav item
    navItems.forEach(nav => {
      if(nav.dataset.view === viewId) nav.classList.add('active');
      else nav.classList.remove('active');
    });

    // Show active view
    views.forEach(view => {
      if(view.id === `view-${viewId}`) {
        view.classList.add('active');
        // Re-trigger animations by cloning and replacing
        const main = view.querySelector('.page');
        if(main) {
          const clone = main.cloneNode(true);
          main.parentNode.replaceChild(clone, main);
          // Re-bind modal triggers in the new clone
          bindModals();
        }
      } else {
        view.classList.remove('active');
      }
    });
  }

  navItems.forEach(nav => {
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(nav.dataset.view);
    });
  });

  // 2. Modal Logic
  function bindModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeBtns = document.querySelectorAll('.js-modal-close');
    
    modalTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if(modal) {
          modal.classList.add('open');
          
          // If it's container detail, populate dummy data
          if(modalId === 'modal-container-detail') {
            const contId = btn.getAttribute('data-id');
            const item = DATA.importContainers.concat(DATA.exportContainers).find(x => x.id === contId);
            if (item) {
              document.getElementById('detail-cont-id-header').textContent = item.id;
              document.getElementById('detail-client').textContent = item.client;
              document.getElementById('detail-route').textContent = item.route;
              document.getElementById('detail-status').innerHTML = `<span class="status-pill chip--${item.statusType}"><span class="chip__dot"></span>${item.status}</span>`;
            }
          }
        }
      });
    });

    closeBtns.forEach(btn => {
      // prevent multiple bindings by removing old event listeners if needed
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', (e) => {
        const modal = newBtn.closest('.overlay');
        if(modal) modal.classList.remove('open');
      });
    });

    // Close on background click
    document.querySelectorAll('.overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.classList.remove('open');
      });
    });
  }

  // 3. Render Data from DATA object (assumes window.DATA exists from data.js)
  function initData() {
    if(typeof DATA === 'undefined' || typeof UI === 'undefined') return;
    
    UI.renderStats(DATA.stats);
    UI.renderDispatchQueue(DATA.dispatchQueue);
    UI.renderAlerts(DATA.alerts);
    UI.renderFlows(DATA.flows);
    UI.renderContainers(DATA.importContainers);
    UI.renderKanban(DATA.kanban);
    UI.renderHubCosts(DATA.hubCosts);
    UI.renderDrivers(DATA.drivers);
    UI.renderTrailers(DATA.systemData.trailers);

    // Bind tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const parent = tab.closest('.tabs');
        parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Handle logic if needed (e.g. toggle container lists)
        if(tab.dataset.tab === 'export') {
          UI.renderContainers(DATA.exportContainers);
          bindModals();
        } else if (tab.dataset.tab === 'import') {
          UI.renderContainers(DATA.importContainers);
          bindModals();
        }

        // Handle System Data Tabs
        if(tab.dataset.sysTab) {
          document.querySelectorAll('[data-sys-panel]').forEach(panel => {
            if(panel.dataset.sysPanel === tab.dataset.sysTab) {
              panel.removeAttribute('hidden');
            } else {
              panel.setAttribute('hidden', '');
            }
          });
        }
      });
    });

    bindModals();
  }

  // Auto Route Demo
  const autoRouteBtn = document.getElementById('btn-auto-route');
  if(autoRouteBtn) {
    autoRouteBtn.addEventListener('click', () => {
      const modal = document.getElementById('modal-auto-route');
      const sugg = document.getElementById('route-suggestions');
      if(sugg) {
        sugg.innerHTML = DATA.routeSuggestions.map(r => `
          <div class="card" style="padding:16px; background:rgba(255,255,255,0.8); border:1px solid var(--color-accent-cyan)">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px">
              <span class="status-pill chip--success" style="font-size:10px">${r.priority}</span>
              <span style="font-weight:600; color:var(--color-accent-cyan)">${r.cost}</span>
            </div>
            <div style="font-size:14px; margin-bottom:4px"><strong>${r.vehicle}</strong> (Tải: ${r.load})</div>
            <div class="text-muted" style="font-size:12px; margin-bottom:8px">Lộ trình: ${r.route} (${r.time})</div>
            <div style="font-size:12px">Ghép cont: <span style="color:#fff">${r.containers}</span></div>
          </div>
        `).join('');
      }
      if(modal) modal.classList.add('open');
    });
  }

  // Initialize
  initData();
});
