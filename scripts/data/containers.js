const DATA_CONTAINERS = {
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
};
