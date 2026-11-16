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
  Filter,
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
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Data Pasien & No. Rekam Medis</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan data dasar pasien dengan penomoran rekam medis otomatis berformat <span className="font-mono font-semibold text-blue-600">RM-YYYYMM-XXXX</span>.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pasien Baru
        </button>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan No. Rekam Medis, NIK, Nama Pasien, atau No. HP..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            Cari Pasien
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Katalog Rekam Medis Pasien Terdaftar</h2>
          <span className="text-xs text-slate-500 font-semibold">{patients.length} Pasien</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">NO. REKAM MEDIS</th>
                <th className="py-3.5 px-4">NIK</th>
                <th className="py-3.5 px-5">NAMA PASIEN</th>
                <th className="py-3.5 px-4">GENDER / TGL LAHIR</th>
                <th className="py-3.5 px-4">NO. TELEPON</th>
                <th className="py-3.5 px-5">ALAMAT</th>
                <th className="py-3.5 px-4">ALERGI</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Memuat data pasien...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Tidak ada data pasien yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {p.mr_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.nik}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {p.birth_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.phone || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">
                      {p.address}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.allergies ? (
                        <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {p.allergies}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ubah Data Pasien"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Pasien"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              {isEditing ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gol. Darah</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">-</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. HP</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0812xxxxxxxx"
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Riwayat Alergi (Jika Ada)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Mis: Penisilin, Parasetamol, Seafood..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Daftarkan Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
