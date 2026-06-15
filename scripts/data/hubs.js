const DATA_HUBS_OPS = {
  hubOps: {
    'kcn-lon': {
      name: 'Hub KCN Lớn',
      capacity: { current: 18, max: 24, unit: 'Cont' },
      equipment: [
        { id: 'Xe CĐ-1', status: 'busy',      task: 'Đang cẩu Cont #7821' },
        { id: 'Xe CĐ-2', status: 'busy',      task: 'Đang cẩu Cont #7834' },
        { id: 'Xe CĐ-3', status: 'available', task: null },
        { id: 'Xe CĐ-4', status: 'maintenance', task: 'Bảo dưỡng định kỳ' },
      ],
      incoming: [
        { contId: 'CONT-7851', client: 'Client Alpha',  eta: '14:30', flow: 'Flow 1', size: '40ft', status: 'on-way' },
        { contId: 'CONT-7852', client: 'Client Beta',   eta: '15:00', flow: 'Flow 3', size: '20ft', status: 'on-way' },
        { contId: 'CONT-7853', client: 'Client Alpha',  eta: '15:45', flow: 'Flow 1', size: '20ft', status: 'on-way' },
        { contId: 'CONT-7854', client: 'Client Gamma',  eta: '16:20', flow: 'Flow 2', size: '40ft', status: 'delayed' },
        { contId: 'CONT-7855', client: 'Client Beta',   eta: '17:00', flow: 'Flow 4', size: '20ft', status: 'on-way' },
      ],
      outgoing: [
        { contId: 'CONT-7821', client: 'Client Alpha', readyAt: '11:00', dest: 'Tây Ninh',   flow: 'Flow 2', size: '40ft' },
        { contId: 'CONT-7803', client: 'Client Gamma', readyAt: '09:30', dest: 'HCM',         flow: 'Flow 1', size: '20ft' },
        { contId: 'CONT-7798', client: 'Client Beta',  readyAt: '10:15', dest: 'Bình Dương', flow: 'Flow 3', size: '20ft' },
        { contId: 'CONT-7790', client: 'Client Alpha', readyAt: '08:45', dest: 'Tây Ninh',   flow: 'Flow 2', size: '40ft' },
        { contId: 'CONT-7785', client: 'Client Gamma', readyAt: '13:00', dest: 'HCM',         flow: 'Flow 1', size: '40ft' },
        { contId: 'CONT-7780', client: 'Client Beta',  readyAt: '13:30', dest: 'Bình Dương', flow: 'Flow 4', size: '20ft' },
        { contId: 'CONT-7774', client: 'Client Alpha', readyAt: '14:00', dest: 'Tây Ninh',   flow: 'Flow 2', size: '40ft' },
      ],
      operations: [
        { id: 'OP-041', type: 'Hạ Cont',   contId: 'CONT-7834', status: 'in-progress', assignedTo: 'Xe CĐ-2', startTime: '13:15', client: 'Client Beta' },
        { id: 'OP-042', type: 'Cắt Mooc',  contId: 'CONT-7821', status: 'in-progress', assignedTo: 'Xe CĐ-1', startTime: '13:40', client: 'Client Alpha' },
        { id: 'OP-043', type: 'Swap Cont', contId: 'CONT-7780', status: 'pending',     assignedTo: null,        startTime: null,    client: 'Client Beta' },
        { id: 'OP-044', type: 'Hạ Cont',   contId: 'CONT-7855', status: 'pending',     assignedTo: null,        startTime: null,    client: 'Client Beta' },
        { id: 'OP-045', type: 'Cắt Mooc',  contId: 'CONT-7852', status: 'pending',     assignedTo: null,        startTime: null,    client: 'Client Beta' },
        { id: 'OP-038', type: 'Hạ Cont',   contId: 'CONT-7803', status: 'done',        assignedTo: 'Xe CĐ-1',  startTime: '09:30', client: 'Client Gamma' },
        { id: 'OP-039', type: 'Swap Cont', contId: 'CONT-7798', status: 'done',        assignedTo: 'Xe CĐ-2',  startTime: '10:15', client: 'Client Beta' },
        { id: 'OP-040', type: 'Cắt Mooc',  contId: 'CONT-7790', status: 'done',        assignedTo: 'Xe CĐ-3',  startTime: '11:00', client: 'Client Alpha' },
      ],
      alerts: [
        { type: 'warning', icon: 'warning', text: 'Công suất đạt 75% – Nên điều phối xuất cont trước 16:00' },
        { type: 'info',    icon: 'info',    text: 'Xe CĐ-4 đang bảo dưỡng – Chỉ còn 3 xe hoạt động' },
      ],
    },

    'kcn-2': {
      name: 'Hub KCN 2',
      capacity: { current: 9, max: 15, unit: 'Cont' },
      equipment: [
        { id: 'Xe CĐ-5', status: 'available', task: null },
      ],
      incoming: [
        { contId: 'CONT-7860', client: 'Client Alpha',  eta: '15:30', flow: 'Flow 1', size: '40ft', status: 'on-way' },
        { contId: 'CONT-7861', client: 'Client Gamma',  eta: '16:45', flow: 'Flow 3', size: '20ft', status: 'on-way' },
        { contId: 'CONT-7862', client: 'Client Beta',   eta: '17:30', flow: 'Flow 1', size: '20ft', status: 'delayed' },
      ],
      outgoing: [
        { contId: 'CONT-7841', client: 'Client Alpha', readyAt: '10:00', dest: 'Tây Ninh',   flow: 'Flow 2', size: '40ft' },
        { contId: 'CONT-7843', client: 'Client Beta',  readyAt: '11:30', dest: 'Bình Dương', flow: 'Flow 1', size: '20ft' },
        { contId: 'CONT-7845', client: 'Client Gamma', readyAt: '12:00', dest: 'HCM',         flow: 'Flow 4', size: '40ft' },
        { contId: 'CONT-7847', client: 'Client Alpha', readyAt: '13:45', dest: 'Tây Ninh',   flow: 'Flow 2', size: '20ft' },
      ],
      operations: [
        { id: 'OP-051', type: 'Hạ Cont',  contId: 'CONT-7862', status: 'pending',     assignedTo: null,        startTime: null,    client: 'Client Beta' },
        { id: 'OP-052', type: 'Cắt Mooc', contId: 'CONT-7860', status: 'pending',     assignedTo: null,        startTime: null,    client: 'Client Alpha' },
        { id: 'OP-048', type: 'Hạ Cont',  contId: 'CONT-7841', status: 'done',        assignedTo: 'Xe CĐ-5',  startTime: '10:00', client: 'Client Alpha' },
        { id: 'OP-049', type: 'Cắt Mooc', contId: 'CONT-7843', status: 'done',        assignedTo: 'Xe CĐ-5',  startTime: '11:30', client: 'Client Beta' },
        { id: 'OP-050', type: 'Hạ Cont',  contId: 'CONT-7845', status: 'done',        assignedTo: 'Xe CĐ-5',  startTime: '12:00', client: 'Client Gamma' },
      ],
      alerts: [
        { type: 'warning', icon: 'schedule', text: 'CONT-7862 bị trễ ETA – Điều chỉnh lịch cẩu' },
      ],
    },

    'kcn-3': {
      name: 'Hub KCN 3',
      capacity: { current: 5, max: 12, unit: 'Cont' },
      equipment: [
        { id: 'Xe CĐ-6', status: 'available', task: null },
      ],
      incoming: [
        { contId: 'CONT-7870', client: 'Client Gamma', eta: '16:00', flow: 'Flow 1', size: '40ft', status: 'on-way' },
        { contId: 'CONT-7871', client: 'Client Alpha', eta: '17:15', flow: 'Flow 2', size: '20ft', status: 'on-way' },
      ],
      outgoing: [
        { contId: 'CONT-7863', client: 'Client Alpha', readyAt: '12:30', dest: 'HCM',       flow: 'Flow 1', size: '40ft' },
        { contId: 'CONT-7865', client: 'Client Gamma', readyAt: '13:15', dest: 'Tây Ninh',  flow: 'Flow 2', size: '20ft' },
      ],
      operations: [
        { id: 'OP-061', type: 'Cắt Mooc', contId: 'CONT-7870', status: 'pending', assignedTo: null,       startTime: null,    client: 'Client Gamma' },
        { id: 'OP-058', type: 'Hạ Cont',  contId: 'CONT-7863', status: 'done',    assignedTo: 'Xe CĐ-6', startTime: '12:30', client: 'Client Alpha' },
        { id: 'OP-059', type: 'Cắt Mooc', contId: 'CONT-7865', status: 'done',    assignedTo: 'Xe CĐ-6', startTime: '13:15', client: 'Client Gamma' },
      ],
      alerts: [],
    },
  },
};
