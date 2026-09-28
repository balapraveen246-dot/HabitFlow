import axios from 'axios';
const client = axios.create({ baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api`, timeout: 10000 });
const unwrap = (p) => p.then((r) => r.data.data).catch((e) => {
  if (!e.response) throw new Error('Cannot reach the HabitFlow server. Check that the backend is running and VITE_API_BASE_URL is correct.');
  const d = e.response.data || {};
  throw new Error([d.error, ...(d.details || [])].filter(Boolean).join(': ') || `Request failed (${e.response.status})`);
});
export const habitApi = {
  list: () => unwrap(client.get('/habits')),
  create: (b) => unwrap(client.post('/habits', b)),
  update: (id, b) => unwrap(client.put(`/habits/${id}`, b)),
  remove: (id) => unwrap(client.delete(`/habits/${id}`)),
  setStatus: (id, date, status) => unwrap(client.patch(`/habits/${id}/status`, { date, status })),
  analytics: (params) => unwrap(client.get('/analytics', { params })),
  saveSettings: (b) => unwrap(client.put('/settings', b)),
  reset: () => unwrap(client.post('/reset')),
  download: async (kind) => {
    const r = await client.get(`/export/${kind}`, { responseType: 'blob' }).catch(() => { throw new Error('Export failed'); });
    const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = `habitflow.${kind}`; a.click(); URL.revokeObjectURL(a.href);
  },
};
