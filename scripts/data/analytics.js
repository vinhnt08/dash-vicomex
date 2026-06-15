const ANALYTICS_DATA = {
  kpis: [
    { id: 'ontime',     label: 'Tỉ lệ Đúng giờ',        value: 87,    unit: '%',    trend: +2.3, trendGood: true,  barPct: 87 },
    { id: 'capacity',   label: 'Sử dụng Năng lực',       value: 73,    unit: '%',    trend: -1.2, trendGood: false, barPct: 73 },
    { id: 'cost',       label: 'Chi phí / Container',    value: '2.4M',unit: 'VNĐ',  trend: -4.8, trendGood: true,  barPct: 52 },
    { id: 'revenue',    label: 'Doanh thu / Chuyến',     value: '4.8M',unit: 'VNĐ',  trend: +5.1, trendGood: true,  barPct: 68 },
    { id: 'efficiency', label: 'Hiệu suất Đội xe',       value: 91,    unit: '/100', trend: +3.0, trendGood: true,  barPct: 91 },
  ],

  daily: [
    { label: '02/06', containers: 38, onTime: 33 },
    { label: '03/06', containers: 45, onTime: 40 },
    { label: '04/06', containers: 52, onTime: 44 },
    { label: '05/06', containers: 41, onTime: 36 },
    { label: '06/06', containers: 48, onTime: 43 },
    { label: '07/06', containers: 35, onTime: 29 },
    { label: '08/06', containers: 55, onTime: 49 },
    { label: '09/06', containers: 60, onTime: 52 },
    { label: '10/06', containers: 47, onTime: 41 },
    { label: '11/06', containers: 53, onTime: 47 },
    { label: '12/06', containers: 42, onTime: 37 },
    { label: '13/06', containers: 58, onTime: 52 },
    { label: '14/06', containers: 65, onTime: 58 },
    { label: '15/06', containers: 61, onTime: 54 },
  ],

  monthly: [
    { label: 'T1', revenue: 820,  expenses: 590 },
    { label: 'T2', revenue: 740,  expenses: 540 },
    { label: 'T3', revenue: 890,  expenses: 625 },
    { label: 'T4', revenue: 950,  expenses: 682 },
    { label: 'T5', revenue: 1020, expenses: 714 },
    { label: 'T6', revenue: 980,  expenses: 698 },
  ],

  hubBreakdown: [
    { label: 'KCN Lớn', pct: 47, amount: '124M VNĐ' },
    { label: 'KCN 2',   pct: 31, amount: '82M VNĐ'  },
    { label: 'KCN 3',   pct: 22, amount: '58M VNĐ'  },
  ],

  vehicleRanking: [
    { rank: 1, plate: '51H-12345', driver: 'Nguyễn Văn A', trips: 48, onTime: 96, util: 95 },
    { rank: 2, plate: '51H-67890', driver: 'Trần Văn B',   trips: 43, onTime: 91, util: 88 },
    { rank: 3, plate: '51H-11122', driver: 'Lê Văn C',     trips: 38, onTime: 89, util: 82 },
    { rank: 4, plate: '51H-33344', driver: 'Phạm Thị D',   trips: 35, onTime: 85, util: 79 },
    { rank: 5, plate: '51H-55566', driver: 'Hoàng Văn E',  trips: 29, onTime: 78, util: 71 },
  ],
};
