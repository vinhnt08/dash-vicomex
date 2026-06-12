const DATA_RESOURCES = {
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

  locations: [
    { id: 'L-depot', label: 'Depot',          icon: 'garage',          type: 'depot'    },
    { id: 'L-port',  label: 'Cảng',           icon: 'directions_boat', type: 'port'     },
    { id: 'L-hub1',  label: 'Hub KCN Lớn',    icon: 'warehouse',       type: 'hub'      },
    { id: 'L-hub2',  label: 'Hub KCN 2',      icon: 'warehouse',       type: 'hub'      },
    { id: 'L-hub3',  label: 'Hub KCN 3',      icon: 'warehouse',       type: 'hub'      },
    { id: 'L-khA',   label: 'Kho KH A',       icon: 'storefront',      type: 'customer' },
    { id: 'L-khB',   label: 'Kho KH B',       icon: 'storefront',      type: 'customer' },
  ],

  trucks: [
    { id: 'T-001', plate: '51H-12345', status: 'active',      driver: 'Nguyễn Văn A', team: 'Đội 1' },
    { id: 'T-002', plate: '51H-67890', status: 'active',      driver: 'Trần Văn B',   team: 'Đội 2' },
    { id: 'T-003', plate: '51H-11122', status: 'maintenance', driver: 'Lê Văn C',     team: 'Đội 1' },
    { id: 'T-004', plate: '51H-33344', status: 'active',      driver: 'Phạm Thị D',   team: 'Đội 2' },
    { id: 'T-005', plate: '51H-55566', status: 'active',      driver: 'Hoàng Văn E',  team: 'Đội 1' },
  ],
};
