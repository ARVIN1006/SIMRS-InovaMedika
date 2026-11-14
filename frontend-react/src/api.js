import axios from 'axios';

export const YII_API_BASE = import.meta.env.VITE_YII_API || 'http://localhost:8000/api';
export const NODE_API_BASE = import.meta.env.VITE_NODE_API || 'http://localhost:5000/api';

// Pre-configured demo accounts for evaluator convenience
export const DEMO_ROLES = [
  { role: 'ADMIN', name: 'Administrator', username: 'admin', token: 'token_admin_simrs_2026', desc: 'Akses Penuh Semua Modul' },
  { role: 'REGISTRATION', name: 'Petugas Pendaftaran', username: 'pendaftaran', token: 'token_pendaftaran_simrs_2026', desc: 'Pendaftaran Pasien & Antrean' },
  { role: 'DOCTOR', name: 'dr. Budi Santoso, Sp.PD', username: 'dr_budi', token: 'token_drbudi_simrs_2026', desc: 'Pemeriksaan RME, Tindakan, Resep' },
  { role: 'PHARMACY', name: 'Apt. Dewi (Farmasi)', username: 'farmasi', token: 'token_farmasi_simrs_2026', desc: 'Validasi & Penyerahan Obat' },
  { role: 'LAB', name: 'Ahmad (Laboratorium)', username: 'lab', token: 'token_lab_simrs_2026', desc: 'Hasil Pemeriksaan Penunjang' },
  { role: 'CASHIER', name: 'Rina (Kasir)', username: 'kasir', token: 'token_kasir_simrs_2026', desc: 'Billing, Pembayaran & Struk' },
];

export const apiYii = axios.create({
  baseURL: YII_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiNode = axios.create({
  baseURL: NODE_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject active token
const attachToken = (config) => {
  const token = localStorage.getItem('simrs_token') || 'token_admin_simrs_2026';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiYii.interceptors.request.use(attachToken);
apiNode.interceptors.request.use(attachToken);
