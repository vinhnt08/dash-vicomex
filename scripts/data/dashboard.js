const DATA_DASHBOARD = {
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
};
