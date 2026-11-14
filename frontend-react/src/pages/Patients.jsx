import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    nik: '',
    birth_date: '1990-01-01',
    gender: 'L',
    blood_type: 'O',
    phone: '',
    email: '',
    address: '',
    allergies: '',
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const url = search ? `/patients?search=${encodeURIComponent(search)}` : '/patients';
      const res = await apiYii.get(url);
      setPatients(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pasien.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      name: '',
      nik: '',
      birth_date: '1990-01-01',
      gender: 'L',
      blood_type: 'O',
      phone: '',
      email: '',
      address: '',
      allergies: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setFormData({
      id: p.id,
      name: p.name,
      nik: p.nik,
      birth_date: p.birth_date,
      gender: p.gender,
      blood_type: p.blood_type || 'O',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address,
      allergies: p.allergies || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      if (isEditing) {
        const res = await apiYii.put(`/patients/${formData.id}`, formData);
        if (res.data?.success) {
          setMessage('Data pasien berhasil diperbarui.');
        }
      } else {
        const res = await apiYii.post('/patients', formData);
        if (res.data?.success) {
          setMessage(`Pasien berhasil didaftarkan dengan No. RM: ${res.data.data.mr_number}`);
        }
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menyimpan data pasien.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) return;
    try {
      const res = await apiYii.delete(`/patients/${id}`);
      if (res.data?.success) {
        setMessage('Data pasien berhasil dihapus.');
        fetchPatients();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data pasien.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Data Pasien & No. Rekam Medis</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan data dasar pasien dengan penomoran rekam medis otomatis berformat <span className="font-mono font-semibold text-sky-700">RM-YYYYMM-XXXX</span>.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pasien Baru
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan No. Rekam Medis, NIK, Nama, atau No. HP..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold">
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NO. REKAM MEDIS</th>
                <th className="py-3 px-4">NIK</th>
                <th className="py-3 px-4">NAMA PASIEN</th>
                <th className="py-3 px-4">GENDER / TGL LAHIR</th>
                <th className="py-3 px-4">NO. HP</th>
                <th className="py-3 px-4">ALAMAT</th>
                <th className="py-3 px-4">ALERGI</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Memuat data pasien...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Tidak ada data pasien yang cocok.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-extrabold text-sky-800">
                      {p.mr_number}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.nik}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {p.birth_date}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {p.address}
                    </td>
                    <td className="py-3 px-4">
                      {p.allergies ? (
                        <span className="text-rose-600 font-semibold">{p.allergies}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded"
                          title="Ubah Data Pasien"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                          title="Hapus Pasien"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" />
              {isEditing ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Golongan Darah</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">-</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. HP Pasien</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Riwayat Alergi (Jika Ada)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Mis: Penisilin, Dingin, Debu..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold shadow"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
