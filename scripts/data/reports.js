const DATA_REPORTS = {
  reports: {
    summary: {
      month:   { totalConts: 49, revenue: 612500000, onTimeRate: 94.8, activeDrivers: 5, prevTotalConts: 43, prevRevenue: 537500000, prevOnTimeRate: 93.1, prevActiveDrivers: 5 },
      quarter: { totalConts: 143, revenue: 1787500000, onTimeRate: 94.2, activeDrivers: 5, prevTotalConts: 128, prevRevenue: 1600000000, prevOnTimeRate: 92.8, prevActiveDrivers: 4 },
      year:    { totalConts: 588, revenue: 7350000000, onTimeRate: 93.7, activeDrivers: 5, prevTotalConts: 512, prevRevenue: 6400000000, prevOnTimeRate: 91.5, prevActiveDrivers: 4 },
    },

    monthly: [
      { month: 'T1', conts: 36, revenue: 450000000, onTime: 92.1 },
      { month: 'T2', conts: 44, revenue: 550000000, onTime: 93.4 },
      { month: 'T3', conts: 40, revenue: 500000000, onTime: 91.8 },
      { month: 'T4', conts: 52, revenue: 650000000, onTime: 95.2 },
      { month: 'T5', conts: 43, revenue: 537500000, onTime: 93.1 },
      { month: 'T6', conts: 49, revenue: 612500000, onTime: 94.8 },
      { month: 'T7', conts: 0,  revenue: 0,          onTime: 0 },
      { month: 'T8', conts: 0,  revenue: 0,          onTime: 0 },
      { month: 'T9', conts: 0,  revenue: 0,          onTime: 0 },
      { month: 'T10', conts: 0, revenue: 0,           onTime: 0 },
      { month: 'T11', conts: 0, revenue: 0,           onTime: 0 },
      { month: 'T12', conts: 0, revenue: 0,           onTime: 0 },
    ],

    byClient: [
      { name: 'Client Alpha', initials: 'CA', conts: 312, revenue: 3900000000, onTimeRate: 97.2, pct: 53 },
      { name: 'Client Beta',  initials: 'CB', conts: 187, revenue: 2337500000, onTimeRate: 91.5, pct: 32 },
      { name: 'Client Gamma', initials: 'CG', conts: 89,  revenue: 1112500000, onTimeRate: 94.8, pct: 15 },
    ],

    byHub: [
      { name: 'Hub KCN Lớn', conts: 312, pct: 53, throughputPct: 75 },
      { name: 'Hub KCN 2',   conts: 160, pct: 27, throughputPct: 60 },
      { name: 'Hub KCN 3',   conts: 116, pct: 20, throughputPct: 42 },
    ],

    byRoute: [
      { route: 'Cảng → KCN Lớn',       type: 'Import', conts: 145, onTime: 96.5, avgDays: 1.8 },
      { route: 'KCN Lớn → Tây Ninh',   type: 'Export', conts: 112, onTime: 97.3, avgDays: 2.1 },
      { route: 'Cảng → KCN 2',         type: 'Import', conts: 98,  onTime: 92.8, avgDays: 2.0 },
      { route: 'KCN Lớn → HCM',        type: 'Export', conts: 87,  onTime: 94.2, avgDays: 1.5 },
      { route: 'KCN Lớn → Bình Dương', type: 'Export', conts: 74,  onTime: 90.5, avgDays: 1.9 },
      { route: 'Cảng → KCN 3',         type: 'Import', conts: 72,  onTime: 95.8, avgDays: 2.3 },
    ],

    monthlyBreakdown: [
      { month: 'Tháng 1/2026', alpha: 18, beta: 12, gamma: 6,  total: 36 },
      { month: 'Tháng 2/2026', alpha: 22, beta: 14, gamma: 8,  total: 44 },
      { month: 'Tháng 3/2026', alpha: 20, beta: 11, gamma: 9,  total: 40 },
      { month: 'Tháng 4/2026', alpha: 25, beta: 16, gamma: 11, total: 52 },
      { month: 'Tháng 5/2026', alpha: 21, beta: 13, gamma: 9,  total: 43 },
      { month: 'Tháng 6/2026', alpha: 24, beta: 15, gamma: 10, total: 49 },
    ],
  },
};
