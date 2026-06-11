const DATA = {
  stats: {
    output:    { current: 55, target: 60, unit: 'Cont',      pct: 91, label: 'Sản lượng hôm nay' },
    progress:  { current: 2150, target: 2000, unit: 'Chuyến', label: 'Tiến độ tháng' },
    resources: {
      trucks: { active: 45, total: 50 },
      trailers: { active: 80, total: 100 },
      special: { active: 6, total: 6 },
      label: 'Nguồn lực đang chạy'
    },
    clients: { count: 10, route: 'Tây Ninh ↔ Hồ Chí Minh', label: 'Khách hàng phục vụ' }
  },

  alerts: [
    { type: 'warning', icon: 'error',         text: 'Tài xế Nguyễn Văn A đang trong khung giờ cấm cảng' },
    { type: 'info',    icon: 'info',           text: 'Phát sinh hạ cont tại Hub: +150,000 VNĐ (Phí hạ) & +100,000 VNĐ (Lưu cont/ngày)' },
    { type: 'success', icon: 'check_circle',   text: 'Đã cộng 300,000 VNĐ phụ phí lấy/trả hàng cho chuyến #892' },
  ],

  dispatchQueue: [
    {
      id: '#1234',
      flow: 'Nhập khẩu',
      flowSub: '(Giao gấp - Flow 2)',
      flowSubColor: 'error',
      status: 'Chờ ghép xe',
      statusType: 'warning'
    },
    {
      id: '#5678',
      flow: 'Nhập khẩu',
      flowSub: '(Qua Hub - Flow 3)',
      flowSubColor: null,
      status: 'Cần ghép 2 cont 20ft',
      statusType: 'info'
    },
    {
      id: '#9012',
      flow: 'Xuất khẩu',
      flowSub: '(Tận dụng cont rỗng - Flow 1)',
      flowSubColor: 'success',
      status: 'Sẵn sàng',
      statusType: 'success'
    },
    {
      id: '#3456',
      flow: 'Xuất khẩu',
      flowSub: '(Qua Hub - Flow 1)',
      flowSubColor: null,
      status: 'Chờ lệnh',
      statusType: 'neutral'
    },
  ],

  flows: [
    {
      id: 'flow1',
      icon: '→',
      name: 'Flow 1 – Lưu Hub',
      desc: 'Áp dụng khi khách hàng không đủ sức chứa.',
      route: 'CẢNG → HUB → KH',
      color: '#eff6ff',
      borderColor: '#bfdbfe',
      textColor: '#1d4ed8',
    },
    {
      id: 'flow2',
      icon: '⚡',
      name: 'Flow 2 – Giao Thẳng',
      desc: 'Khách yêu cầu GẤP hoặc kho đủ sức chứa.',
      route: 'CẢNG → KH',
      color: '#fffbeb',
      borderColor: '#fde68a',
      textColor: '#b45309',
    },
    {
      id: 'flow3',
      icon: '⇌',
      name: 'Flow 3 – Ghép 2 Cont 20',
      desc: 'Kết hợp chặng xuất/nhập, tránh quá tải.',
      route: 'DEPOT → CẢNG → HUB → KH',
      color: '#f0fdf4',
      borderColor: '#a7f3d0',
      textColor: '#047857',
    },
    {
      id: 'flow4',
      icon: '↺',
      name: 'Flow 4 – Reuse Cont Rỗng',
      desc: 'Tận dụng phí DEM/DET, dùng cont rỗng chuyển sau đóng hàng xuất.',
      route: 'CẢNG → KH (ĐÓNG HÀNG)',
      color: '#f0fdf4',
      borderColor: '#a7f3d0',
      textColor: '#047857',
    },
  ],

  importContainers: [
    { id: 'CONT112233', client: 'Khách hàng A', flow: 'Flow 1', flowDesc: 'Lưu Hub khi khách không đủ sức chứa', route: 'Cảng → Hub → KH', status: 'Đang lưu Hub',   statusType: 'warning', laden: 'Loaded' },
    { id: 'CONT445566', client: 'Khách hàng B', flow: 'Flow 2', flowDesc: 'Giao thẳng hoặc kho đủ sức chứa', route: 'Cảng → KH',        status: 'Đang giao thẳng', statusType: 'info', laden: 'Loaded' },
    { id: 'CONT778899', client: 'Khách hàng C', flow: 'Flow 4', flowDesc: 'Tận dụng cont rỗng DEM/DET', route: 'Cảng → Hub → KH', status: 'Chờ Reuse',     statusType: 'neutral', laden: 'Empty' },
    { id: 'CONT334455', client: 'Khách hàng D', flow: 'Flow 3', flowDesc: 'Ghép 2 cont 20ft cùng lộ trình', route: 'Depot → Cảng → KH', status: 'Sẵn sàng',   statusType: 'success', laden: 'Loaded' },
  ],

  exportContainers: [
    { id: 'CONT998877', client: 'Khách hàng E', flow: 'Flow 1', flowDesc: 'Lưu Hub khi không đủ sức chứa xuất', route: 'KH → Hub → Cảng', status: 'Đang lưu Hub',   statusType: 'warning', laden: 'Loaded' },
    { id: 'CONT665544', client: 'Khách hàng F', flow: 'Flow 2', flowDesc: 'Giao thẳng tới cảng nhanh nhất', route: 'KH → Cảng',        status: 'Đang giao thẳng', statusType: 'info', laden: 'Empty' },
    { id: 'CONT221133', client: 'Khách hàng A', flow: 'Flow 4', flowDesc: 'Reuse cont rỗng cho chuyến tiếp', route: 'KH → Cảng',         status: 'Sẵn sàng',    statusType: 'success', laden: 'Loaded' },
  ],

  kanban: {
    catMooc: [
      {
        title: 'Đổi đầu kéo – Tài xế cấm cảng',
        body: 'Tài xế Nguyễn Văn A bị cấm giờ vào cảng. Cần cắt mooc tại Hub 1.',
        action: 'Điều phối Đầu kéo mới',
        modal: 'modal-cat-mooc',
      },
      {
        title: 'Đóng cont sớm',
        body: 'Cont #112233 đã đóng xong nhưng chưa đến ngày nộp cảng. Cắt mooc lưu tại Hub.',
        action: 'Xác nhận lưu Hub',
        modal: 'modal-cat-mooc',
      },
    ],
    haCont: [
      {
        title: 'Thiếu rơ mooc vận hành',
        body: 'Hạ tạm Cont #445566 tại Hub chuyên dụng để lấy rơ mooc đi chuyến khác.',
        alert: 'Lưu ý: Phí hạ dự kiến 150,000 VNĐ',
        action: 'Duyệt lệnh hạ',
        modal: 'modal-ha-cont',
      },
      {
        title: 'Đóng cont sớm chờ nộp cảng',
        body: 'Hạ Cont #778899 tại Hub thuê ngoài.',
        alert: 'Lưu ý: Phí lưu cont 100,000 VNĐ/ngày',
        action: 'Duyệt lệnh hạ',
        modal: 'modal-ha-cont',
      },
    ],
    swapCont: [
      {
        title: 'Ghép 2 Cont 20 (Kẹp cổ)',
        body: 'Ghép Cont #123 (Nhập) và Cont #456 (Xuất) để tiện đường giao Depot 2.',
        action: 'Tiến hành Swap',
        modal: 'modal-swap-cont',
      },
      {
        title: 'Cân bằng tải trọng',
        body: 'Đổi chéo rơ mooc để tránh quá tải trên tuyến Tây Ninh → HCM.',
        action: 'Tiến hành Swap',
        modal: 'modal-swap-cont',
      },
    ],
  },

  resources: {
    vehicles: { trucks: 50, trailers: 100, special: 6 },
    hubs: [
      { name: 'Hub KCN Lớn', vehicles: 4 },
      { name: 'Hub KCN 2',   vehicles: 1 },
      { name: 'Hub KCN 3',   vehicles: 1 },
    ],
  },

  drivers: [
    { name: 'Nguyễn Văn A', team: 'Đội 1', trips: 45, points: 12, surcharge: '3,600,000', total: '18,500,000', highlight: false },
    { name: 'Trần Văn B',   team: 'Đội 2', trips: 50, points: 15, surcharge: '4,500,000', total: '22,100,000', highlight: true },
    { name: 'Lê Văn C',     team: 'Đội 1', trips: 42, points: 10, surcharge: '3,000,000', total: '16,800,000', highlight: true },
    { name: 'Phạm Thị D',   team: 'Đội 2', trips: 38, points: 8,  surcharge: '2,400,000', total: '14,200,000', highlight: false },
    { name: 'Hoàng Văn E',  team: 'Đội 1', trips: 55, points: 14, surcharge: '4,200,000', total: '20,700,000', highlight: false },
  ],

  systemData: {
    trailers: [
      { id: 'SIR-01', type: 'Rơ mooc', axles: '1 trục',  capacity: 'Hàng nhẹ (ít 15 tấn)',     status: 'active' },
      { id: 'SIR-02', type: 'Rơ mooc', axles: '1 trục',  capacity: 'Hàng trung bình (< 15 tấn)', status: 'active' },
      { id: 'SIR-333', type: 'Rơ mooc', axles: '3 trục', capacity: 'Hàng nặng (> 25 tấn)',      status: 'broken' },
      { id: 'SIR-004', type: 'Rơ mooc', axles: '2 trục', capacity: 'Hàng trung bình',           status: 'maintenance' },
    ],
    hubs: [
      { name: 'Hub KCN Lớn', capacity: '4 xe chuyên dụng', features: ['Cắt Mooc', 'Hạ Cont', 'Swap Cont'] },
      { name: 'Hub KCN 2',   capacity: '1 xe chuyên dụng', features: ['Cắt Mooc', 'Hạ Cont'] },
      { name: 'Hub KCN 3',   capacity: '1 xe chuyên dụng', features: ['Cắt Mooc', 'Hạ Cont'] },
    ],
    clients: [
      { id: 'C1', name: 'Client Corp Alpha',      reuseEnabled: true },
      { id: 'C2', name: 'Beta Logistics Solutions', reuseEnabled: false },
      { id: 'C3', name: 'Gamma Imports Ltd',       reuseEnabled: true },
    ],
  },

  routeSuggestions: [
    {
      id: 1,
      priority: 'Tối ưu chi phí',
      route: 'CẢNG → Hub KCN Lớn → KH A & KH B',
      time: '~4h 30m',
      cost: '2,850,000 VNĐ',
      vehicle: 'Truck #001 (Tài xế Nguyễn Văn A)',
      load: '78%',
      containers: ['CONT#1234', 'CONT#5678'],
      notes: 'Giao cùng lộ trình, tiết kiệm 450,000 VNĐ phí phân tán'
    },
    {
      id: 2,
      priority: 'Giao hàng nhanh nhất',
      route: 'CẢNG → KH A (thẳng) & KH B (Hub KCN)',
      time: '~3h 15m',
      cost: '3,200,000 VNĐ',
      vehicle: 'Truck #003 (Tài xế Trần Văn B)',
      load: '65%',
      containers: ['CONT#1234'],
      notes: 'Giao thẳng tới KH A, nhanh nhất nhưng chi phí cao hơn'
    },
    {
      id: 3,
      priority: 'Cân bằng tải',
      route: 'DEPOT → CẢNG → Hub KCN 2 → KH C',
      time: '~5h 00m',
      cost: '2,950,000 VNĐ',
      vehicle: 'Truck #005 (Tài xế Lê Văn C)',
      load: '82%',
      containers: ['CONT#5678', 'CONT#9012'],
      notes: 'Ghép 2 cont, tận dụng công suất xe, cân bằng nguồn lực'
    },
  ],

  hubCosts: [
    { hub: 'Hub KCN Lớn', operations: 12, dropFee: '150,000 VNĐ/lần', storageFee: '100,000 VNĐ/ngày', monthlyTotal: '2,850,000 VNĐ' },
    { hub: 'Hub KCN 2',   operations: 5,  dropFee: '120,000 VNĐ/lần', storageFee: '80,000 VNĐ/ngày',  monthlyTotal: '1,200,000 VNĐ' },
    { hub: 'Hub KCN 3',   operations: 3,  dropFee: '120,000 VNĐ/lần', storageFee: '80,000 VNĐ/ngày',  monthlyTotal: '680,000 VNĐ' },
  ],
};
