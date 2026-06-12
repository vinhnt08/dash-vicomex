// Mock data for demo4 – identical to demo1
const mockData = {
  stats: {
    output: { label: 'Sản lượng hôm nay', value: 124 },
    progress: { label: 'Tiến độ tháng', value: 78 },
    resources: { label: 'Nguồn lực đang chạy', value: 42 },
    clients: { label: 'Khách hàng phục vụ', value: 15 },
  },
  dispatchQueue: [
    { id: 'C001', flow: 'Import', status: 'Pending' },
    { id: 'C002', flow: 'Export', status: 'Pending' },
  ],
  alerts: [
    { type: 'warning', message: 'Xe A đang trễ' },
    { type: 'info', message: 'Cập nhật lộ trình' },
  ],
};

export default mockData;