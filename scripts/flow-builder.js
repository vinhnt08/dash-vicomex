const FlowBuilder = (() => {
  const state = {
    nodes: [],
    edges: [],
    drawing:    null,
    dragging:   null,
    justDragged: false,
    dragStartX: 0,
    dragStartY: 0,
    counter: 0,
    template: null,    // { id, direction } | null
    modalEdges: [],    // topo-sorted, may be reordered by user in modal
    editMode: null,    // { containerId } | null when editing existing container
  };

  let dragSrcIdx = null;

  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    renderPalette();
    renderTemplateSelector();
    bindCanvasEvents();
    bindToolbarEvents();
    updateDraftButton();
  }

  /* ── PICKER DATA ─────────────────────────────────────────────── */
  const PICKER_ICON = {
    depot: 'garage', port: 'directions_boat', hub: 'warehouse',
    customer: 'storefront', driver: 'person', truck: 'local_shipping',
    trailer: 'rv_hookup', container: 'inventory_2',
  };

  function pickerItems(type) {
    const { locations, trucks, systemData, importContainers, exportContainers } = DATA;
    switch (type) {
      case 'depot':    return locations.filter(l => l.type === 'depot').map(l => ({ sourceId: l.id, label: l.label, sub: '' }));
      case 'port':     return locations.filter(l => l.type === 'port').map(l => ({ sourceId: l.id, label: l.label, sub: '' }));
      case 'hub':      return locations.filter(l => l.type === 'hub').map(l => ({ sourceId: l.id, label: l.label, sub: '' }));
      case 'customer': return locations.filter(l => l.type === 'customer').map(l => ({ sourceId: l.id, label: l.label, sub: '' }));
      case 'driver':   return DATA.driverProfiles.map(d => ({ sourceId: d.id, label: d.name, sub: d.team }));
      case 'truck':    return trucks.filter(t => t.status === 'active').map(t => ({ sourceId: t.id, label: t.plate, sub: t.team }));
      case 'trailer':  return systemData.trailers.filter(t => t.status === 'active').map(t => ({ sourceId: t.id, label: t.id, sub: t.axles }));
      case 'container': return [...importContainers, ...exportContainers].map(c => ({ sourceId: c.id, label: c.id, sub: c.client + (c.laden ? ' · ' + c.laden : '') }));
      default: return [];
    }
  }

  /* ── PALETTE (type cards only) ───────────────────────────────── */
  function renderPalette() {
    const palette = document.getElementById('flow-palette');
    if (!palette) return;

    const groups = [
      {
        title: 'Địa điểm',
        items: [
          { type: 'depot',    label: 'Depot',    icon: 'garage' },
          { type: 'port',     label: 'Cảng',     icon: 'directions_boat' },
          { type: 'hub',      label: 'Hub',      icon: 'warehouse' },
          { type: 'customer', label: 'Kho KH',   icon: 'storefront' },
        ],
      },
      {
        title: 'Nhân sự',
        items: [
          { type: 'driver', label: 'Tài Xế', icon: 'person' },
        ],
      },
      {
        title: 'Phương tiện',
        items: [
          { type: 'truck',   label: 'Đầu Kéo', icon: 'local_shipping' },
          { type: 'trailer', label: 'Rơ Mooc', icon: 'rv_hookup' },
        ],
      },
      {
        title: 'Hàng hóa',
        items: [
          { type: 'container', label: 'Container', icon: 'inventory_2' },
        ],
      },
    ];

    palette.innerHTML = groups.map(g => `
      <div class="palette-section">
        <div class="palette-section__title">${g.title}</div>
        <div class="palette-section__items">
          ${g.items.map(t => `
            <div class="palette-type-card" draggable="true"
              data-type="${t.type}" data-icon="${t.icon}" data-label="${t.label}"
              title="Kéo vào canvas">
              <div class="palette-item__icon palette-item__icon--${t.type}">
                <span class="material-symbols-outlined">${t.icon}</span>
              </div>
              <div class="palette-type-card__label">${t.label}</div>
            </div>`).join('')}
        </div>
      </div>`).join('');

    palette.querySelectorAll('.palette-type-card').forEach(el => {
      el.addEventListener('dragstart', e => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('type',  el.dataset.type);
        e.dataTransfer.setData('icon',  el.dataset.icon);
        e.dataTransfer.setData('label', el.dataset.label);
      });
    });
  }

  /* ── TEMPLATE SELECTOR ───────────────────────────────────────── */
  function renderTemplateSelector() {
    const container = document.getElementById('flow-template-selector');
    if (!container) return;

    const { templates } = DATA;

    container.innerHTML = `
      <div class="template-tabs" id="tmpl-tabs">
        <button class="template-tab active" data-dir="import">
          <span class="material-symbols-outlined">download</span>Nhập Khẩu
        </button>
        <button class="template-tab" data-dir="export">
          <span class="material-symbols-outlined">upload</span>Xuất Khẩu
        </button>
        <button class="template-tab" data-dir="custom">
          <span class="material-symbols-outlined">edit_note</span>Tùy Chỉnh
        </button>
      </div>
      <div class="template-flows" id="tmpl-flows-import">
        ${templates.import.map(t => templateCard(t, 'import')).join('')}
      </div>
      <div class="template-flows" id="tmpl-flows-export" style="display:none">
        ${templates.export.map(t => templateCard(t, 'export')).join('')}
      </div>
      <div class="template-flows" id="tmpl-flows-custom" style="display:none">
        <div class="template-custom-msg">
          <span class="material-symbols-outlined">drag_pan</span>
          <p>Kéo đối tượng từ bảng trái vào canvas để tự xây dựng lộ trình.</p>
        </div>
      </div>`;

    container.querySelectorAll('.template-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.template-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dir = btn.dataset.dir;
        ['import', 'export', 'custom'].forEach(d => {
          const el = document.getElementById(`tmpl-flows-${d}`);
          if (el) el.style.display = d === dir ? '' : 'none';
        });
        state.template = null;
        container.querySelectorAll('.template-flow-card').forEach(c => c.classList.remove('active'));
      });
    });

    container.querySelectorAll('.template-flow-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.template-flow-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const dir  = card.dataset.dir;
        const tmpl = DATA.templates[dir]?.find(t => t.id === card.dataset.id);
        if (tmpl) applyTemplate(tmpl, dir);
      });
    });
  }

  function templateCard(t, dir) {
    const routePreview = t.nodes.filter(n => n.type !== 'truck').map(n => n.label).join(' → ');
    return `<div class="template-flow-card" data-id="${t.id}" data-dir="${dir}" tabindex="0" role="button">
      <div class="template-flow-card__label">${t.label}</div>
      <div class="template-flow-card__desc">${t.desc}</div>
      <div class="template-flow-card__route">${routePreview}</div>
    </div>`;
  }

  function applyTemplate(tmpl, direction) {
    clearCanvas();
    state.template = { id: tmpl.id, direction };

    const xOffset = tmpl.nodes.some(n => n.type === 'truck') ? 165 : 0;

    const keyToId = {};
    tmpl.nodes.forEach(n => {
      if (n.type === 'truck') {
        const driverNodeId = `n${++state.counter}`;
        const truckNode = {
          id: `n${++state.counter}`,
          type: n.type, label: n.label, icon: n.icon,
          sub: '', picked: false, sourceId: null,
          x: n.x + xOffset, y: n.y,
          companionDriverId: driverNodeId,
        };
        const driverNode = {
          id: driverNodeId,
          type: 'driver', icon: 'person', label: 'Tài xế', sub: '',
          picked: false, sourceId: null,
          x: Math.max(8, truckNode.x - 172), y: truckNode.y,
          companionTruckId: truckNode.id,
        };
        keyToId[n.key] = truckNode.id;
        state.nodes.push(driverNode, truckNode);
        state.edges.push({ id: `e${++state.counter}`, from: driverNode.id, to: truckNode.id });
        mountNode(driverNode);
        mountNode(truckNode);
      } else {
        const node = {
          id: `n${++state.counter}`,
          type: n.type, label: n.label, icon: n.icon,
          sub: '', picked: false, sourceId: null,
          x: n.x + xOffset, y: n.y,
        };
        keyToId[n.key] = node.id;
        state.nodes.push(node);
        mountNode(node);
      }
    });

    tmpl.edges.forEach(e => {
      const fromId = keyToId[e.from], toId = keyToId[e.to];
      if (fromId && toId)
        state.edges.push({ id: `e${++state.counter}`, from: fromId, to: toId });
    });

    redrawEdges();
    updateEmpty();
    showToast('Template đã tải. Click vào từng node để chọn phương tiện/địa điểm cụ thể.', 'warning');
  }

  /* ── NODE PICKER ─────────────────────────────────────────────── */
  function openPicker(nodeId) {
    closePicker();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const items = pickerItems(node.type);
    if (!items.length) return;

    const canvas = document.getElementById('flow-canvas');
    const nodeEl = document.getElementById(nodeId);
    if (!canvas || !nodeEl) return;
    const cr = canvas.getBoundingClientRect();
    const nr = nodeEl.getBoundingClientRect();

    const picker = document.createElement('div');
    picker.className = 'node-picker';
    picker.id = 'node-picker';
    picker.dataset.nodeId = nodeId;

    const left = Math.min(nr.left - cr.left, cr.width - 224);
    picker.style.cssText = `left:${Math.max(4, left)}px;top:${nr.bottom - cr.top + 8}px`;

    picker.innerHTML = `
      <div class="node-picker__header">
        Chọn ${TYPE_LABELS[node.type] || node.type}
        <button class="node-picker__close" aria-label="Đóng">×</button>
      </div>
      <input class="node-picker__search" placeholder="Tìm kiếm..." autocomplete="off" />
      <ul class="node-picker__list">
        ${items.map(it => `
          <li class="node-picker__item${node.sourceId === it.sourceId ? ' active' : ''}"
            data-source-id="${it.sourceId}" data-label="${it.label}" data-sub="${it.sub || ''}">
            <span class="node-picker__item-label">${it.label}</span>
            ${it.sub ? `<span class="node-picker__item-sub">${it.sub}</span>` : ''}
          </li>`).join('')}
      </ul>`;

    canvas.appendChild(picker);

    picker.querySelector('.node-picker__close').addEventListener('click', e => {
      e.stopPropagation();
      closePicker();
    });

    const search = picker.querySelector('.node-picker__search');
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      picker.querySelectorAll('.node-picker__item').forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    search.focus();

    picker.querySelectorAll('.node-picker__item').forEach(li => {
      li.addEventListener('click', e => {
        e.stopPropagation();
        pickItem(nodeId, li.dataset.sourceId, li.dataset.label, li.dataset.sub || '');
        closePicker();
      });
    });

    picker.addEventListener('click', e => e.stopPropagation());
  }

  function closePicker() {
    document.getElementById('node-picker')?.remove();
  }

  function pickItem(nodeId, sourceId, label, sub) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.sourceId = sourceId;
    node.label    = label;
    node.sub      = sub;
    node.picked   = true;

    const el = document.getElementById(nodeId);
    if (!el) return;
    el.classList.remove('flow-node--unpicked');
    el.querySelector('.flow-node__label').textContent = label;
    let subEl = el.querySelector('.flow-node__sub');
    if (sub && !subEl) {
      subEl = document.createElement('div');
      subEl.className = 'flow-node__sub';
      el.appendChild(subEl);
    }
    if (subEl) subEl.textContent = sub || '';

  }

  /* ── CANVAS EVENTS ───────────────────────────────────────────── */
  function bindCanvasEvents() {
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;

    canvas.addEventListener('dragenter', e => e.preventDefault());
    canvas.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      canvas.classList.add('drag-over');
    });
    canvas.addEventListener('dragleave', e => {
      if (!canvas.contains(e.relatedTarget)) canvas.classList.remove('drag-over');
    });
    canvas.addEventListener('drop', onDrop);
    canvas.addEventListener('click', e => {
      if (e.target === canvas || e.target === document.getElementById('flow-svg')) {
        closePicker();
        document.getElementById('op-picker')?.remove();
      }
    });
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('mouseleave', onDrawingCancel);
  }

  function onDrop(e) {
    e.preventDefault();
    const canvas = document.getElementById('flow-canvas');
    canvas.classList.remove('drag-over');
    const rect  = canvas.getBoundingClientRect();
    const type  = e.dataTransfer.getData('type');
    const icon  = e.dataTransfer.getData('icon')  || PICKER_ICON[type] || 'help';
    const label = e.dataTransfer.getData('label') || TYPE_LABELS[type] || type;

    const x = Math.max(8, e.clientX - rect.left - 54);
    const y = Math.max(8, e.clientY - rect.top  - 44);

    if (type === 'truck') {
      const driverNode = {
        id: `n${++state.counter}`,
        type: 'driver', icon: 'person', label: 'Tài xế', sub: '',
        picked: false, sourceId: null,
        x: Math.max(8, x - 172), y,
      };
      const truckNode = {
        id: `n${++state.counter}`,
        type, icon, label, sub: '',
        picked: false, sourceId: null,
        x, y,
        companionDriverId: driverNode.id,
      };
      driverNode.companionTruckId = truckNode.id;
      state.nodes.push(driverNode, truckNode);
      state.edges.push({ id: `e${++state.counter}`, from: driverNode.id, to: truckNode.id });
      mountNode(driverNode);
      mountNode(truckNode);
      updateEmpty();
      redrawEdges();
      openPicker(truckNode.id);
    } else {
      const node = {
        id: `n${++state.counter}`,
        type, icon, label, sub: '',
        picked: false, sourceId: null,
        x, y,
      };
      state.nodes.push(node);
      mountNode(node);
      updateEmpty();
      openPicker(node.id);
    }
  }

  /* ── TOOLBAR ─────────────────────────────────────────────────── */
  function bindToolbarEvents() {
    document.getElementById('btn-save-draft')?.addEventListener('click', saveDraft);
    document.getElementById('btn-load-draft')?.addEventListener('click', loadDraft);
    document.getElementById('btn-clear-canvas')?.addEventListener('click', clearCanvas);
    document.getElementById('btn-submit-flow')?.addEventListener('click', submitFlow);
    document.getElementById('btn-confirm-flow-create')?.addEventListener('click', () => {
      const dirSelect = document.getElementById('flow-confirm-direction');
      if (dirSelect && !dirSelect.value) {
        dirSelect.focus();
        showToast('Vui lòng chọn loại vận hành trước khi xác nhận.', 'error');
        return;
      }
      const direction  = dirSelect?.value || state.template?.direction || 'import';
      const trucks     = state.nodes.filter(n => n.type === 'truck');
      const containers = state.nodes.filter(n => n.type === 'container');
      const note       = document.getElementById('flow-confirm-note')?.value || '';
      const route      = getRouteFromFlow();
      const tmplId     = state.template?.id ?? null;
      const tmplLabel  = tmplId ? (DATA.templates[direction]?.find(t => t.id === tmplId)?.label ?? null) : null;

      const flowData = {
        direction,
        templateId:    tmplId,
        templateLabel: tmplLabel,
        route,
        containerIds:  containers.map(n => n.sourceId || n.label),
        truck:         trucks[0]?.label || '',
        notes:         note,
      };

      document.getElementById('modal-flow-confirm')?.classList.remove('open');

      if (state.editMode) {
        const editId = state.editMode.containerId;
        state.editMode = null;
        App.updateContainerFromFlow(editId, flowData);
      } else {
        App.createContainerFromFlow(flowData);
      }
      clearCanvas();
    });
  }

  /* ── NODE DOM ────────────────────────────────────────────────── */
  function mountNode(node) {
    const canvas = document.getElementById('flow-canvas');
    const div = document.createElement('div');
    div.className = `flow-node flow-node--${node.type}${node.picked === false ? ' flow-node--unpicked' : ''}`;
    div.id = node.id;
    div.style.cssText = `left:${node.x}px;top:${node.y}px`;
    div.setAttribute('tabindex', '0');
    const hasOp = OPS_BY_TYPE[node.type];
    div.innerHTML = `
      <button class="flow-node__delete" aria-label="Xóa">×</button>
      <div class="flow-node__port" title="Kéo để kết nối"></div>
      <div class="flow-node__icon"><span class="material-symbols-outlined">${node.icon}</span></div>
      <div class="flow-node__label">${node.label}</div>
      ${node.sub ? `<div class="flow-node__sub">${node.sub}</div>` : ''}
      ${hasOp ? `<button class="flow-node__op${node.op ? ' flow-node__op--set' : ''}" aria-label="Chọn nghiệp vụ">${opChipHtml(node.op)}</button>` : ''}`;

    div.querySelector('.flow-node__delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteNode(node.id);
    });

    div.querySelector('.flow-node__op')?.addEventListener('click', e => {
      e.stopPropagation();
      if (state.justDragged) return;
      openOpPicker(node.id, e.currentTarget);
    });

    div.querySelector('.flow-node__port').addEventListener('mousedown', e => {
      e.stopPropagation();
      e.preventDefault();
      startDrawing(node.id);
    });

    div.addEventListener('mousedown', e => {
      if (e.target.classList.contains('flow-node__delete') ||
          e.target.classList.contains('flow-node__port')) return;
      e.preventDefault();
      state.justDragged = false;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      const nr = div.getBoundingClientRect();
      state.dragging = { nodeId: node.id, ox: e.clientX - nr.left, oy: e.clientY - nr.top };
      div.style.zIndex = 10;
      div.style.cursor = 'grabbing';
    });

    div.addEventListener('click', e => {
      e.stopPropagation();
      if (state.justDragged) { state.justDragged = false; return; }
      if (state.drawing) return;
      openPicker(node.id);
    });

    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(node.id); }
      if (e.key === 'Delete') deleteNode(node.id);
    });

    canvas.appendChild(div);
  }

  /* ── PORT HANDLE DRAWING ─────────────────────────────────────── */
  function startDrawing(fromId) {
    const canvas = document.getElementById('flow-canvas');
    const cr     = canvas.getBoundingClientRect();
    const fromEl = document.getElementById(fromId);
    const fr     = fromEl.getBoundingClientRect();
    const x1 = fr.right - cr.left;
    const y1 = fr.top + fr.height / 2 - cr.top;

    state.drawing = { fromId, x1, y1 };

    const svg  = document.getElementById('flow-svg');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.id = 'fb-drawing-line';
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x1); line.setAttribute('y2', y1);
    line.setAttribute('stroke', 'var(--color-primary)');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5 3');
    line.setAttribute('marker-end', 'url(#fb-arrow)');
    line.style.pointerEvents = 'none';
    svg.appendChild(line);
  }

  function onMouseMove(e) {
    if (state.dragging) {
      const dx = e.clientX - state.dragStartX;
      const dy = e.clientY - state.dragStartY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) state.justDragged = true;
      const canvas = document.getElementById('flow-canvas');
      const rect   = canvas.getBoundingClientRect();
      const node   = state.nodes.find(n => n.id === state.dragging.nodeId);
      if (!node) return;
      node.x = Math.max(0, e.clientX - rect.left - state.dragging.ox);
      node.y = Math.max(0, e.clientY - rect.top  - state.dragging.oy);
      const el = document.getElementById(node.id);
      if (el) { el.style.left = node.x + 'px'; el.style.top = node.y + 'px'; }
      redrawEdges();
      return;
    }

    if (state.drawing) {
      const canvas = document.getElementById('flow-canvas');
      const cr   = canvas.getBoundingClientRect();
      const line = document.getElementById('fb-drawing-line');
      if (line) {
        line.setAttribute('x2', e.clientX - cr.left);
        line.setAttribute('y2', e.clientY - cr.top);
      }
      canvas.querySelectorAll('.flow-node--drop-target').forEach(el => el.classList.remove('flow-node--drop-target'));
      const targetId = nodeAtPoint(e.clientX, e.clientY);
      if (targetId && targetId !== state.drawing.fromId) {
        document.getElementById(targetId)?.classList.add('flow-node--drop-target');
      }
    }
  }

  function onMouseUp(e) {
    if (state.dragging) {
      const el = document.getElementById(state.dragging.nodeId);
      if (el) { el.style.cursor = ''; el.style.zIndex = ''; }
      state.dragging = null;
      return;
    }

    if (state.drawing) {
      const targetId = nodeAtPoint(e.clientX, e.clientY);
      if (targetId && targetId !== state.drawing.fromId) {
        const result = validateEdge(state.drawing.fromId, targetId);
        if (!result.valid) {
          showToast(result.msg, 'error');
          flashInvalid(state.drawing.fromId);
          flashInvalid(targetId);
        } else {
          const dup = state.edges.some(ed =>
            (ed.from === state.drawing.fromId && ed.to === targetId) ||
            (ed.from === targetId && ed.to === state.drawing.fromId)
          );
          if (!dup) {
            state.edges.push({ id: `e${++state.counter}`, from: state.drawing.fromId, to: targetId });
            redrawEdges();
          }
        }
      }
      onDrawingCancel();
    }
  }

  function onDrawingCancel() {
    document.getElementById('fb-drawing-line')?.remove();
    document.querySelectorAll('.flow-node--drop-target').forEach(el => el.classList.remove('flow-node--drop-target'));
    state.drawing = null;
  }

  function nodeAtPoint(cx, cy) {
    const el = document.elementFromPoint(cx, cy);
    if (!el) return null;
    const nodeEl = el.closest('.flow-node');
    return nodeEl ? nodeEl.id : null;
  }

  /* ── OPERATION ANNOTATION ───────────────────────────────────── */
  const OPS_BY_TYPE = {
    depot:    ['cat_mooc', 'ha_cont'],
    port:     ['cat_mooc', 'ha_cont'],
    hub:      ['cat_mooc', 'ha_cont', 'swap_cont'],
    customer: ['cat_mooc'],
  };

  const OP_META = {
    cat_mooc:  { label: 'Cắt Mooc',  icon: 'content_cut' },
    ha_cont:   { label: 'Hạ Cont',   icon: 'move_down'   },
    swap_cont: { label: 'Swap Cont', icon: 'swap_horiz'  },
  };

  const OP_CASES = {
    cat_mooc: [
      { key: 'toi_uu',     label: 'Tối ưu vận hành' },
      { key: 'kh_yeu_cau', label: 'Khách hàng yêu cầu' },
      { key: 'swap_kep',   label: 'Xử lý Swap Cont / kẹp cổ' },
      { key: 'khac',       label: 'Trường hợp khác' },
    ],
    ha_cont: [
      { key: 'dong_som',  label: 'Đóng cont sớm' },
      { key: 'thieu_ro',  label: 'Thiếu rơ mooc' },
      { key: 'swap_kep',  label: 'Xử lý Swap Cont / kẹp cổ' },
    ],
    swap_cont: [
      { key: 'doi_ro',   label: 'Đổi sang rơ mooc khác' },
      { key: 'can_bang', label: 'Cân bằng tải trọng' },
    ],
  };

  function opChipHtml(op, opCase) {
    if (!op) return '<span class="material-symbols-outlined">add</span>';
    const caseLabel = opCase ? OP_CASES[op]?.find(c => c.key === opCase)?.label : null;
    return `<span class="material-symbols-outlined">${OP_META[op].icon}</span>${OP_META[op].label}${caseLabel ? ' · ' + caseLabel : ''}`;
  }

  function setNodeOp(nodeId, op, opCase) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.op     = op     || null;
    node.opCase = opCase || null;
    const btn = document.getElementById(nodeId)?.querySelector('.flow-node__op');
    if (!btn) return;
    btn.classList.toggle('flow-node__op--set', !!op);
    btn.innerHTML = opChipHtml(node.op, node.opCase);
  }

  function renderOpPickerContent(picker, nodeId, view, pendingOp) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (view === 'op') {
      const ops = OPS_BY_TYPE[node.type] ?? [];
      picker.innerHTML = `
        <div class="op-picker__header">Nghiệp vụ</div>
        <ul class="op-picker__list">
          ${ops.map(k => `<li class="op-picker__item${node.op === k ? ' active' : ''}" data-op="${k}">
            <span class="material-symbols-outlined">${OP_META[k].icon}</span>
            <span>${OP_META[k].label}</span>
            <span class="material-symbols-outlined op-picker__chevron">chevron_right</span>
          </li>`).join('')}
          ${node.op ? `<li class="op-picker__item op-picker__item--clear">
            <span class="material-symbols-outlined">close</span>Bỏ nghiệp vụ
          </li>` : ''}
        </ul>`;

      picker.querySelectorAll('.op-picker__item:not(.op-picker__item--clear)').forEach(li => {
        li.addEventListener('click', e => {
          e.stopPropagation();
          renderOpPickerContent(picker, nodeId, 'case', li.dataset.op);
        });
      });
      picker.querySelector('.op-picker__item--clear')?.addEventListener('click', e => {
        e.stopPropagation();
        setNodeOp(nodeId, null, null);
        picker.remove();
      });

    } else {
      const cases = OP_CASES[pendingOp] ?? [];
      picker.innerHTML = `
        <div class="op-picker__header op-picker__header--back">
          <button class="op-picker__back" aria-label="Quay lại">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          ${OP_META[pendingOp].label}
        </div>
        <ul class="op-picker__list">
          ${cases.map(c => `<li class="op-picker__item${node.op === pendingOp && node.opCase === c.key ? ' active' : ''}" data-case="${c.key}">
            ${c.label}
          </li>`).join('')}
          <li class="op-picker__item op-picker__item--skip">
            <span class="material-symbols-outlined">remove</span>Không chỉ định
          </li>
        </ul>`;

      picker.querySelector('.op-picker__back').addEventListener('click', e => {
        e.stopPropagation();
        renderOpPickerContent(picker, nodeId, 'op', null);
      });
      picker.querySelectorAll('.op-picker__item:not(.op-picker__item--skip)').forEach(li => {
        li.addEventListener('click', e => {
          e.stopPropagation();
          setNodeOp(nodeId, pendingOp, li.dataset.case);
          picker.remove();
        });
      });
      picker.querySelector('.op-picker__item--skip')?.addEventListener('click', e => {
        e.stopPropagation();
        setNodeOp(nodeId, pendingOp, null);
        picker.remove();
      });
    }
  }

  function openOpPicker(nodeId, triggerEl) {
    document.getElementById('op-picker')?.remove();
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node || !(OPS_BY_TYPE[node.type]?.length)) return;

    const cr = document.getElementById('flow-canvas').getBoundingClientRect();
    const br = triggerEl.getBoundingClientRect();
    const left = Math.max(4, Math.min(br.left - cr.left, cr.width - 176));

    const picker = document.createElement('div');
    picker.id = 'op-picker';
    picker.className = 'op-picker';
    picker.style.cssText = `left:${left}px;top:${br.bottom - cr.top + 4}px`;
    document.getElementById('flow-canvas').appendChild(picker);

    renderOpPickerContent(picker, nodeId, 'op', null);

    setTimeout(() => {
      document.addEventListener('click', () => document.getElementById('op-picker')?.remove(), { once: true });
    }, 0);
  }

  /* ── VALIDATION ──────────────────────────────────────────────── */
  const LOCATION_TYPES = new Set(['depot', 'port', 'hub', 'customer']);

  const VALID_EDGES = new Map([
    ['depot',    new Set(['port', 'hub', 'customer'])],
    ['port',     new Set(['depot', 'hub', 'customer'])],
    ['hub',      new Set(['depot', 'port', 'customer'])],
    ['customer', new Set(['port', 'hub', 'customer'])],
  ]);

  const TYPE_LABELS = {
    depot: 'Depot', port: 'Cảng', hub: 'Hub', customer: 'Kho KH',
    driver: 'Tài xế', truck: 'Đầu kéo', trailer: 'Rơ mooc', container: 'Container',
  };

  const VEHICLE_TYPES = new Set(['driver', 'truck', 'trailer']);

  function validateEdge(fromId, toId) {
    const from = state.nodes.find(n => n.id === fromId);
    const to   = state.nodes.find(n => n.id === toId);
    if (!from || !to) return { valid: false, msg: 'Node không tồn tại.' };

    const fromIsVehicle = VEHICLE_TYPES.has(from.type);
    const toIsVehicle   = VEHICLE_TYPES.has(to.type);

    if (!fromIsVehicle && !LOCATION_TYPES.has(from.type))
      return { valid: false, msg: `"${from.label}" (container) không thể tạo chặng.` };
    if (!toIsVehicle && !LOCATION_TYPES.has(to.type))
      return { valid: false, msg: `"${to.label}" (container) không thể tạo chặng.` };
    if (fromIsVehicle && toIsVehicle) {
      if (from.type === 'driver' && to.type === 'truck') return { valid: true };
      return { valid: false, msg: 'Không thể nối hai phương tiện với nhau.' };
    }

    if (LOCATION_TYPES.has(from.type) && LOCATION_TYPES.has(to.type)) {
      const allowed = VALID_EDGES.get(from.type);
      if (!allowed?.has(to.type))
        return { valid: false, msg: `${TYPE_LABELS[from.type]} → ${TYPE_LABELS[to.type]} không có trong sơ đồ vận hành Vicomex.` };
    }

    return { valid: true };
  }

  function validateFlow() {
    const errors = [], warnings = [];
    const locationNodes = state.nodes.filter(n => LOCATION_TYPES.has(n.type));

    if (locationNodes.length < 2)
      errors.push('Cần ít nhất 2 địa điểm (Cảng, Hub, Kho KH...) để tạo chặng.');
    if (state.edges.length === 0)
      errors.push('Chưa có chặng nào — kéo dot bên phải của node để nối với node khác.');

    if (errors.length === 0) {
      const connectedIds = new Set(state.edges.flatMap(e => [e.from, e.to]));
      const routeNodes   = locationNodes.filter(n => connectedIds.has(n.id));

      if (!routeNodes.some(n => n.type === 'port'))
        errors.push('Lộ trình thiếu điểm Cảng — mọi flow vận hành Vicomex đều đi qua Cảng.');
      if (!routeNodes.some(n => n.type === 'customer'))
        errors.push('Lộ trình thiếu Kho Khách hàng — cần ít nhất 1 điểm giao/nhận hàng.');

      locationNodes.forEach(n => {
        if (!connectedIds.has(n.id))
          warnings.push(`Địa điểm "${n.label}" chưa kết nối với chặng nào.`);
      });

      const unpicked = state.nodes.filter(n => n.picked === false);
      if (unpicked.length)
        warnings.push(`${unpicked.length} node chưa chọn item cụ thể — click vào node để chọn.`);

      const locEdges = state.edges.filter(e => {
        const fn = state.nodes.find(n => n.id === e.from);
        const tn = state.nodes.find(n => n.id === e.to);
        return fn && tn && LOCATION_TYPES.has(fn.type) && LOCATION_TYPES.has(tn.type);
      });
      const hasIn  = new Set(locEdges.map(e => e.to));
      const hasOut = new Set(locEdges.map(e => e.from));
      if (routeNodes.length > 1 && routeNodes.every(n => hasIn.has(n.id)))
        warnings.push('Không tìm thấy điểm xuất phát — lộ trình có thể tạo thành vòng lặp.');
      if (routeNodes.length > 1 && routeNodes.every(n => hasOut.has(n.id)))
        warnings.push('Không tìm thấy điểm kết thúc — lộ trình có thể tạo thành vòng lặp.');
    }

    return { errors, warnings };
  }

  /* ── TOAST & FLASH ───────────────────────────────────────────── */
  function showToast(msg, type = 'error') {
    const canvas = document.getElementById('flow-canvas');
    let toast = document.getElementById('fb-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fb-toast';
      canvas.appendChild(toast);
    }
    toast.className = `fb-toast fb-toast--${type} fb-toast--show`;
    const icons = { error: 'error', warning: 'warning', success: 'check_circle' };
    toast.innerHTML = `<span class="material-symbols-outlined">${icons[type] || 'info'}</span><span>${msg}</span>`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('fb-toast--show'), 3500);
  }

  function flashInvalid(nodeId) {
    const el = document.getElementById(nodeId);
    if (!el) return;
    el.classList.add('flow-node--invalid');
    setTimeout(() => el.classList.remove('flow-node--invalid'), 400);
  }

  /* ── SVG EDGES ───────────────────────────────────────────────── */
  function redrawEdges() {
    const svg = document.getElementById('flow-svg');
    if (!svg) return;
    svg.querySelectorAll('.fb-edge').forEach(el => el.remove());

    const canvas = document.getElementById('flow-canvas');
    const cr = canvas.getBoundingClientRect();

    state.edges.forEach(edge => {
      const fromEl = document.getElementById(edge.from);
      const toEl   = document.getElementById(edge.to);
      if (!fromEl || !toEl) return;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const x1 = fr.left + fr.width  / 2 - cr.left;
      const y1 = fr.top  + fr.height / 2 - cr.top;
      const x2 = tr.left + tr.width  / 2 - cr.left;
      const y2 = tr.top  + tr.height / 2 - cr.top;

      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ex1 = x1 + (dx / len) * (fr.width  / 2 + 2);
      const ey1 = y1 + (dy / len) * (fr.height / 2 + 2);
      const ex2 = x2 - (dx / len) * (tr.width  / 2 + 10);
      const ey2 = y2 - (dy / len) * (tr.height / 2 + 10);

      const setCoords = el => {
        el.setAttribute('x1', ex1); el.setAttribute('y1', ey1);
        el.setAttribute('x2', ex2); el.setAttribute('y2', ey2);
      };

      const vis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vis.classList.add('fb-edge');
      setCoords(vis);
      vis.setAttribute('stroke', '#000000');
      vis.setAttribute('stroke-width', '2');
      vis.setAttribute('stroke-dasharray', '6 3');
      vis.setAttribute('marker-end', 'url(#fb-arrow)');
      vis.style.pointerEvents = 'none';
      svg.appendChild(vis);

      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hit.classList.add('fb-edge');
      setCoords(hit);
      hit.setAttribute('stroke', 'transparent');
      hit.setAttribute('stroke-width', '14');
      hit.style.cursor = 'pointer';
      hit.style.pointerEvents = 'stroke';
      hit.addEventListener('mouseenter', () => {
        vis.setAttribute('stroke', '#ba1a1a');
        vis.removeAttribute('stroke-dasharray');
        vis.setAttribute('marker-end', 'url(#fb-arrow-del)');
      });
      hit.addEventListener('mouseleave', () => {
        vis.setAttribute('stroke', '#000000');
        vis.setAttribute('stroke-dasharray', '6 3');
        vis.setAttribute('marker-end', 'url(#fb-arrow)');
      });
      hit.addEventListener('click', e => {
        e.stopPropagation();
        state.edges = state.edges.filter(ed => ed.id !== edge.id);
        redrawEdges();
      });
      svg.appendChild(hit);
    });
  }

  /* ── DELETE / CLEAR ──────────────────────────────────────────── */
  function deleteNode(nodeId) {
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    state.edges = state.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    document.getElementById(nodeId)?.remove();
    closePicker();
    redrawEdges();
    updateEmpty();
  }

  function clearCanvas() {
    state.nodes    = [];
    state.edges    = [];
    state.drawing  = null;
    state.dragging = null;
    state.editMode = null;
    state.template = null;
    document.querySelectorAll('#flow-canvas .flow-node').forEach(el => el.remove());
    document.getElementById('fb-drawing-line')?.remove();
    closePicker();
    redrawEdges();
    updateEmpty();
    updateEditModeBanner();
  }

  function updateEditModeBanner() {
    const banner = document.getElementById('fb-edit-banner');
    const btn    = document.getElementById('btn-submit-flow');
    if (!banner) return;
    if (state.editMode) {
      banner.style.display = '';
      banner.innerHTML = `<span class="material-symbols-outlined">edit</span> Đang chỉnh sửa flow của <strong>${state.editMode.containerId}</strong> &nbsp;·&nbsp; <button class="btn btn--ghost btn--compact" id="fb-cancel-edit">Hủy</button>`;
      document.getElementById('fb-cancel-edit')?.addEventListener('click', () => {
        state.editMode = null;
        updateEditModeBanner();
        clearCanvas();
      });
      if (btn) btn.innerHTML = '<span class="material-symbols-outlined">update</span> Cập nhật';
    } else {
      banner.style.display = 'none';
      if (btn) btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Tạo Lệnh';
    }
  }

  function getRouteFromFlow() {
    const sorted = topoSortEdges();
    const seen   = new Set();
    const route  = [];
    sorted.forEach(edge => {
      [edge.from, edge.to].forEach(id => {
        if (!seen.has(id)) {
          const n = state.nodes.find(n => n.id === id);
          if (n && LOCATION_TYPES.has(n.type)) { seen.add(id); route.push(n.label); }
        }
      });
    });
    if (!route.length)
      state.nodes.filter(n => LOCATION_TYPES.has(n.type)).forEach(n => route.push(n.label));
    return route.join(' → ');
  }

  function editContainer(containerId) {
    const allContainers = [...DATA.importContainers, ...DATA.exportContainers];
    const cont = allContainers.find(c => c.id === containerId);
    if (!cont) return;

    const tmpl = DATA.templates[cont.direction]?.find(t => t.id === cont.templateId);
    if (tmpl) applyTemplate(tmpl, cont.direction);
    else clearCanvas();

    state.editMode = { containerId };
    updateEditModeBanner();

    App.navigateTo('orders');
    setTimeout(() => {
      document.getElementById('flow-canvas')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }

  /* ── DRAFT ───────────────────────────────────────────────────── */
  const DRAFT_KEY = 'vicomex_flow_draft';

  function saveDraft() {
    if (state.nodes.length === 0) { showToast('Canvas trống — không có gì để lưu.', 'warning'); return; }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      nodes:    state.nodes.map(n => ({ ...n })),
      edges:    state.edges.map(e => ({ ...e })),
      template: state.template,
      counter:  state.counter,
      savedAt:  Date.now(),
    }));
    updateDraftButton();
    showToast('Đã lưu nháp.', 'success');
  }

  function loadDraft() {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    if (state.nodes.length > 0 && !confirm('Canvas hiện có dữ liệu. Tải nháp sẽ ghi đè. Tiếp tục?')) return;
    const draft = JSON.parse(raw);
    clearCanvas();
    state.counter  = draft.counter;
    state.template = draft.template ?? null;
    draft.nodes.forEach(n => { state.nodes.push({ ...n }); mountNode({ ...n }); });
    draft.edges.forEach(e => state.edges.push({ ...e }));
    redrawEdges();
    updateEmpty();
    showToast('Đã tải nháp.', 'success');
  }

  function updateDraftButton() {
    const btn = document.getElementById('btn-load-draft');
    if (!btn) return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) { btn.style.display = 'none'; return; }
    const { savedAt } = JSON.parse(raw);
    const d    = new Date(savedAt);
    const hhmm = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    btn.style.display = '';
    btn.title = `Nháp lưu lúc ${hhmm} ngày ${d.getDate()}/${d.getMonth()+1}`;
    const timeEl = btn.querySelector('.draft-time');
    if (timeEl) timeEl.textContent = `(${hhmm})`;
  }

  function updateEmpty() {
    const el = document.getElementById('flow-canvas-empty');
    if (el) el.style.display = state.nodes.length ? 'none' : '';
  }

  /* ── SUBMIT ──────────────────────────────────────────────────── */
  function topoSortEdges() {
    const { nodes, edges } = state;
    const inDeg = new Map(nodes.map(n => [n.id, 0]));
    const adj   = new Map(nodes.map(n => [n.id, []]));
    edges.forEach((e, i) => {
      adj.get(e.from)?.push(i);
      inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1);
    });
    const queue  = [...inDeg.entries()].filter(([, d]) => d === 0).map(([id]) => id);
    const order  = [];
    const seen   = new Set();
    while (queue.length) {
      const nid = queue.shift();
      if (seen.has(nid)) continue;
      seen.add(nid);
      for (const i of (adj.get(nid) ?? [])) {
        order.push(i);
        const tid = edges[i].to;
        inDeg.set(tid, inDeg.get(tid) - 1);
        if (inDeg.get(tid) === 0) queue.push(tid);
      }
    }
    edges.forEach((_, i) => { if (!order.includes(i)) order.push(i); });
    return order.map(i => edges[i]);
  }

  function renderRouteRows(container) {
    container.innerHTML = state.modalEdges.map((edge, idx) => {
      const from = state.nodes.find(n => n.id === edge.from);
      const to   = state.nodes.find(n => n.id === edge.to);
      const caseLabel = to?.opCase ? OP_CASES[to.op]?.find(c => c.key === to.opCase)?.label : null;
      const opHtml = to?.op
        ? `<span class="flow-summary-op">
            <span class="material-symbols-outlined">${OP_META[to.op].icon}</span>
            ${OP_META[to.op].label}${caseLabel ? `<span class="flow-summary-op__case"> · ${caseLabel}</span>` : ''}
           </span>`
        : '';
      return `<div class="flow-summary-route" draggable="true" data-idx="${idx}">
        <span class="material-symbols-outlined flow-summary-route__handle">drag_indicator</span>
        <span style="font-weight:600">${from?.label ?? '–'}</span>
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--color-primary)">arrow_forward</span>
        <span style="font-weight:600">${to?.label ?? '–'}</span>
        ${opHtml}
      </div>`;
    }).join('');

    container.querySelectorAll('.flow-summary-route').forEach(row => {
      row.addEventListener('dragstart', e => {
        dragSrcIdx = +e.currentTarget.dataset.idx;
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('flow-summary-route--dragging');
      });
      row.addEventListener('dragend', e => {
        e.currentTarget.classList.remove('flow-summary-route--dragging');
        container.querySelectorAll('.flow-summary-route--over')
          .forEach(r => r.classList.remove('flow-summary-route--over'));
      });
      row.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        container.querySelectorAll('.flow-summary-route--over')
          .forEach(r => r.classList.remove('flow-summary-route--over'));
        e.currentTarget.classList.add('flow-summary-route--over');
      });
      row.addEventListener('drop', e => {
        e.preventDefault();
        const destIdx = +e.currentTarget.dataset.idx;
        if (dragSrcIdx === null || dragSrcIdx === destIdx) return;
        const arr = [...state.modalEdges];
        const [item] = arr.splice(dragSrcIdx, 1);
        arr.splice(destIdx, 0, item);
        state.modalEdges = arr;
        renderRouteRows(container);
        dragSrcIdx = null;
      });
    });
  }

  function submitFlow() {
    if (state.nodes.length === 0) {
      showToast('Canvas trống. Chọn template hoặc kéo đối tượng vào canvas.', 'error');
      return;
    }
    const { errors, warnings } = validateFlow();
    if (errors.length > 0) { showToast(errors[0], 'error'); return; }

    const drivers    = state.nodes.filter(n => n.type === 'driver');
    const vehicles   = state.nodes.filter(n => n.type === 'truck');
    const trailers   = state.nodes.filter(n => n.type === 'trailer');
    const containers = state.nodes.filter(n => n.type === 'container');

    const dirLabel = state.template?.direction === 'import' ? 'Nhập Khẩu'
                   : state.template?.direction === 'export' ? 'Xuất Khẩu'
                   : null;
    const isCustom = !state.template || state.template.direction === 'custom';

    const summary = document.getElementById('flow-confirm-summary');
    if (summary) {
      const warningBanner = warnings.length
        ? `<div class="alert alert--warning" style="margin-bottom:var(--space-16)">
            <span class="material-symbols-outlined">warning</span>
            <div>${warnings.map(w => `<p>${w}</p>`).join('')}</div>
           </div>` : '';

      state.modalEdges = topoSortEdges();

      const tagRow = arr => arr.map(n => `<span class="chip chip--neutral" style="margin:2px">${n.label}</span>`).join('');

      summary.innerHTML = warningBanner + `
        <div class="stack stack--16">
          <div class="input-group" style="margin-bottom:0">
            <label style="color:var(--color-on-surface-variant);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase">
              Loại vận hành${isCustom ? ' <span style="color:var(--color-error)">*</span>' : ''}
            </label>
            ${isCustom
              ? `<select class="input" id="flow-confirm-direction">
                  <option value="">Chọn loại vận hành...</option>
                  <option value="import">Nhập Khẩu</option>
                  <option value="export">Xuất Khẩu</option>
                </select>`
              : `<input class="input" type="text" value="${dirLabel}" readonly style="background:var(--color-surface-container-low);color:var(--color-on-surface-variant);cursor:default" />`
            }
          </div>
          <div>
            <p class="label-caps" style="color:var(--color-on-surface-variant);margin-bottom:var(--space-8)">Lộ trình (${state.edges.length} chặng)</p>
            ${state.edges.length ? `<div id="flow-route-rows-container"></div>` : '<p style="font-size:13px;color:var(--color-on-surface-variant)">Chưa kết nối node nào</p>'}
          </div>
          ${drivers.length    ? `<div><p class="label-caps" style="color:var(--color-on-surface-variant);margin-bottom:4px">Tài xế</p><div style="display:flex;flex-wrap:wrap">${tagRow(drivers)}</div></div>` : ''}
          ${vehicles.length   ? `<div><p class="label-caps" style="color:var(--color-on-surface-variant);margin-bottom:4px">Đầu kéo</p><div style="display:flex;flex-wrap:wrap">${tagRow(vehicles)}</div></div>` : ''}
          ${trailers.length   ? `<div><p class="label-caps" style="color:var(--color-on-surface-variant);margin-bottom:4px">Rơ mooc</p><div style="display:flex;flex-wrap:wrap">${tagRow(trailers)}</div></div>` : ''}
          ${containers.length ? `<div><p class="label-caps" style="color:var(--color-on-surface-variant);margin-bottom:4px">Container</p><div style="display:flex;flex-wrap:wrap">${tagRow(containers)}</div></div>` : ''}
        </div>`;

      const routeContainer = document.getElementById('flow-route-rows-container');
      if (routeContainer) renderRouteRows(routeContainer);
    }

    const modalTitle = document.getElementById('modal-flow-confirm-title');
    if (modalTitle) {
      modalTitle.textContent = state.editMode
        ? `Cập nhật Flow — ${state.editMode.containerId}`
        : 'Xác nhận Tạo Lệnh Vận Chuyển';
    }
    const confirmBtn = document.getElementById('btn-confirm-flow-create');
    if (confirmBtn) {
      confirmBtn.innerHTML = state.editMode
        ? '<span class="material-symbols-outlined">update</span> Xác nhận Cập nhật'
        : '<span class="material-symbols-outlined">check</span> Xác nhận Tạo Lệnh';
    }

    document.getElementById('modal-flow-confirm')?.classList.add('open');
  }

  return { init, clearCanvas, editContainer };
})();
