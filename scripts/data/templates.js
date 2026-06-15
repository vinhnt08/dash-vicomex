const DATA_TEMPLATES = {
  import: [
    {
      id: 'imp-1', label: 'Phương án 1 – Lưu Hub',
      desc: 'Khi kho KH không đủ sức chứa',
      nodes: [
        { key: 'truck',    type: 'truck',    label: 'Đầu kéo', icon: 'local_shipping',  x: 30,  y: 110 },
        { key: 'port',     type: 'port',     label: 'Cảng',    icon: 'directions_boat', x: 190, y: 110 },
        { key: 'hub',      type: 'hub',      label: 'Hub',     icon: 'warehouse',       x: 370, y: 110 },
        { key: 'customer', type: 'customer', label: 'Kho KH',  icon: 'storefront',      x: 550, y: 110 },
      ],
      edges: [
        { from: 'truck', to: 'port' },
        { from: 'port',  to: 'hub'  },
        { from: 'hub',   to: 'customer' },
      ],
    },
    {
      id: 'imp-2', label: 'Phương án 2 – Giao Thẳng',
      desc: 'KH yêu cầu GẤP hoặc kho đủ sức chứa',
      nodes: [
        { key: 'truck',    type: 'truck',    label: 'Đầu kéo', icon: 'local_shipping',  x: 30,  y: 110 },
        { key: 'port',     type: 'port',     label: 'Cảng',    icon: 'directions_boat', x: 220, y: 110 },
        { key: 'customer', type: 'customer', label: 'Kho KH',  icon: 'storefront',      x: 420, y: 110 },
      ],
      edges: [
        { from: 'truck', to: 'port' },
        { from: 'port',  to: 'customer' },
      ],
    },
    {
      id: 'imp-3', label: 'Phương án 3 – Ghép 2 Cont 20',
      desc: 'Tận dụng xe chở 2 cont 20, giao 2 KH cùng lộ trình',
      nodes: [
        { key: 'truck',     type: 'truck',    label: 'Đầu kéo',  icon: 'local_shipping',  x: 20,  y: 120 },
        { key: 'depot',     type: 'depot',    label: 'Depot',    icon: 'garage',          x: 170, y: 120 },
        { key: 'port',      type: 'port',     label: 'Cảng',     icon: 'directions_boat', x: 320, y: 120 },
        { key: 'hub',       type: 'hub',      label: 'Hub',      icon: 'warehouse',       x: 470, y: 60  },
        { key: 'customerA', type: 'customer', label: 'Kho KH A', icon: 'storefront',      x: 620, y: 20  },
        { key: 'customerB', type: 'customer', label: 'Kho KH B', icon: 'storefront',      x: 620, y: 130 },
      ],
      edges: [
        { from: 'truck',  to: 'depot'     },
        { from: 'depot',  to: 'port'      },
        { from: 'port',   to: 'hub'       },
        { from: 'hub',    to: 'customerA' },
        { from: 'hub',    to: 'customerB' },
      ],
    },
    {
      id: 'imp-4', label: 'Phương án 4 – Reuse Cont Rỗng',
      desc: 'Dùng cont rỗng sau rút hàng, chuyển đóng hàng xuất',
      nodes: [
        { key: 'truck',     type: 'truck',    label: 'Đầu kéo',  icon: 'local_shipping',  x: 20,  y: 110 },
        { key: 'port',      type: 'port',     label: 'Cảng',     icon: 'directions_boat', x: 175, y: 110 },
        { key: 'hub',       type: 'hub',      label: 'Hub',      icon: 'warehouse',       x: 330, y: 110 },
        { key: 'customerA', type: 'customer', label: 'Kho KH A', icon: 'storefront',      x: 485, y: 110 },
        { key: 'customerB', type: 'customer', label: 'Kho KH B', icon: 'storefront',      x: 640, y: 110 },
      ],
      edges: [
        { from: 'truck',     to: 'port'      },
        { from: 'port',      to: 'hub'       },
        { from: 'hub',       to: 'customerA' },
        { from: 'customerA', to: 'customerB' },
      ],
    },
  ],
  export: [
    {
      id: 'exp-1', label: 'Phương án 1 – Tận Dụng Cont Rỗng',
      desc: 'Kết hợp chặng xuất/nhập, dùng cont rỗng và xe nhập khẩu',
      nodes: [
        { key: 'truck',     type: 'truck',    label: 'Đầu kéo',  icon: 'local_shipping',  x: 20,  y: 110 },
        { key: 'customerA', type: 'customer', label: 'Kho KH A', icon: 'storefront',      x: 170, y: 110 },
        { key: 'customerB', type: 'customer', label: 'Kho KH B', icon: 'storefront',      x: 330, y: 110 },
        { key: 'hub',       type: 'hub',      label: 'Hub',      icon: 'warehouse',       x: 490, y: 110 },
        { key: 'port',      type: 'port',     label: 'Cảng',     icon: 'directions_boat', x: 650, y: 110 },
      ],
      edges: [
        { from: 'truck',     to: 'customerA' },
        { from: 'customerA', to: 'customerB' },
        { from: 'customerB', to: 'hub'       },
        { from: 'hub',       to: 'port'      },
      ],
    },
    {
      id: 'exp-2', label: 'Phương án 2 – Xuất Khẩu Thông Thường',
      desc: 'Xe từ Depot lấy cont, đến KH đóng hàng, về Cảng',
      nodes: [
        { key: 'truck',    type: 'truck',    label: 'Đầu kéo',  icon: 'local_shipping',  x: 20,  y: 110 },
        { key: 'depot',    type: 'depot',    label: 'Depot',    icon: 'garage',          x: 170, y: 110 },
        { key: 'customer', type: 'customer', label: 'Kho KH B', icon: 'storefront',      x: 330, y: 110 },
        { key: 'hub',      type: 'hub',      label: 'Hub',      icon: 'warehouse',       x: 490, y: 110 },
        { key: 'port',     type: 'port',     label: 'Cảng',     icon: 'directions_boat', x: 650, y: 110 },
      ],
      edges: [
        { from: 'truck',    to: 'depot'    },
        { from: 'depot',    to: 'customer' },
        { from: 'customer', to: 'hub'      },
        { from: 'hub',      to: 'port'     },
      ],
    },
    {
      id: 'exp-3', label: 'Phương án 3 – Kho Chưa Đủ Sức Chứa',
      desc: 'Lưu tạm tại Hub trước khi KH sẵn sàng nhận hàng đóng',
      nodes: [
        { key: 'truck',    type: 'truck',    label: 'Đầu kéo',  icon: 'local_shipping',  x: 20,  y: 110 },
        { key: 'depot',    type: 'depot',    label: 'Depot',    icon: 'garage',          x: 165, y: 110 },
        { key: 'hub1',     type: 'hub',      label: 'Hub',      icon: 'warehouse',       x: 310, y: 110 },
        { key: 'customer', type: 'customer', label: 'Kho KH B', icon: 'storefront',      x: 455, y: 110 },
        { key: 'port',     type: 'port',     label: 'Cảng',     icon: 'directions_boat', x: 600, y: 110 },
      ],
      edges: [
        { from: 'truck',    to: 'depot'    },
        { from: 'depot',    to: 'hub1'     },
        { from: 'hub1',     to: 'customer' },
        { from: 'customer', to: 'port'     },
      ],
    },
  ],
};
