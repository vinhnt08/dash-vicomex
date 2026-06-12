const DATA_ROUTES = {
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
