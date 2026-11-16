import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  Database,
  Building,
  Stethoscope,
  Activity,
  Pill,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function MasterData() {
  const [activeSubTab, setActiveSubTab] = useState('services');
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Add Item Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ code: '', name: '', category: 'DIAGNOSTIK', price: 100000, description: '' });
  const [newMedicine, setNewMedicine] = useState({ code: '', name: '', category: 'ANALGESIK', unit: 'Tablet', stock: 100, min_stock: 10, price: 5000 });

  const fetchAllMaster = async () => {
    setLoading(true);
    try {
      const [resC, resD, resS, resM] = await Promise.all([
        apiYii.get('/clinics'),
        apiYii.get('/doctors'),
        apiYii.get('/services'),
        apiYii.get('/medicines'),
      ]);
      setClinics(resC.data.data || []);
      setDoctors(resD.data.data || []);
      setServices(resS.data.data || []);
      setMedicines(resM.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat master data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMaster();
  }, []);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const res = await apiYii.post('/services', newService);
      if (res.data?.success) {
        setMessage('Tindakan medis berhasil ditambahkan.');
        setShowAddModal(false);
        fetchAllMaster();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan tindakan medis.');
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await apiYii.post('/medicines', newMedicine);
      if (res.data?.success) {
        setMessage('Obat baru berhasil ditambahkan.');
        setShowAddModal(false);
        fetchAllMaster();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan obat baru.');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pengelolaan Master Data SIMRS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen master poli pelayanan, tenaga medis dokter, katalog tindakan & tarif, serta inventori obat dan stok.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Item Baru
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-xl gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'services', label: 'Tindakan Medis & Tarif', icon: Activity, count: services.length },
          { id: 'medicines', label: 'Obat & Stok Farmasi', icon: Pill, count: medicines.length },
          { id: 'clinics', label: 'Poli Pelayanan', icon: Building, count: clinics.length },
          { id: 'doctors', label: 'Dokter & Tenaga Medis', icon: Stethoscope, count: doctors.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {/* 1. Tindakan Medis */}
        {activeSubTab === 'services' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">KODE TINDAKAN</th>
                  <th className="py-3 px-5">NAMA TINDAKAN MEDIS</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-5">DESKRIPSI</th>
                  <th className="py-3 px-4 text-right">TARIF</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {s.code}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{s.category}</td>
                    <td className="py-3 px-5 text-slate-500">{s.description || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatRupiah(s.price)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Obat & Stok */}
        {activeSubTab === 'medicines' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">KODE OBAT</th>
                  <th className="py-3 px-5">NAMA OBAT</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4">SATUAN</th>
                  <th className="py-3 px-4 text-center">SISA STOK</th>
                  <th className="py-3 px-4 text-right">HARGA JUAL</th>
                  <th className="py-3 px-4 text-center">STATUS STOK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((m) => {
                  const isLow = m.stock <= m.min_stock;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {m.code}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-semibold text-slate-900">{m.name}</td>
                      <td className="py-3 px-4 font-medium text-slate-500">{m.category}</td>
                      <td className="py-3 px-4 text-slate-600">{m.unit}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{m.stock}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatRupiah(m.price)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isLow
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isLow ? 'Stok Kritis' : 'Aman'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Poli */}
        {activeSubTab === 'clinics' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">KODE POLI</th>
                  <th className="py-3 px-5">NAMA POLIKLINIK</th>
                  <th className="py-3 px-5">LOKASI GEDUNG</th>
                  <th className="py-3 px-5">DESKRIPSI</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinics.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3 px-5 text-slate-600">{c.location}</td>
                    <td className="py-3 px-5 text-slate-500">{c.description}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Dokter */}
        {activeSubTab === 'doctors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NOMOR SIP</th>
                  <th className="py-3 px-5">NAMA DOKTER</th>
                  <th className="py-3 px-5">SPESIALISASI</th>
                  <th className="py-3 px-5">POLIKLINIK</th>
                  <th className="py-3 px-4">NO. TELEPON</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">{d.sip_number}</td>
                    <td className="py-3 px-5 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3 px-5 font-semibold text-blue-600">{d.specialization}</td>
                    <td className="py-3 px-5 text-slate-700">{d.clinic?.name || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{d.phone || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Tambah Item Master Baru
            </h2>
            {activeSubTab === 'services' ? (
              <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Tindakan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mis: SRV-005"
                    value={newService.code}
                    onChange={(e) => setNewService({ ...newService, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Tindakan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: USG Abdomen Lengkap"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="KONSULTASI">KONSULTASI</option>
                    <option value="DIAGNOSTIK">DIAGNOSTIK</option>
                    <option value="TERAPI">TERAPI</option>
                    <option value="LABORATORIUM">LABORATORIUM</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tarif Layanan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                  >
                    Simpan Tindakan
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateMedicine} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Obat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mis: MED-005"
                    value={newMedicine.code}
                    onChange={(e) => setNewMedicine({ ...newMedicine, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Obat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Metformin 500mg"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Satuan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tablet / Strip"
                      value={newMedicine.unit}
                      onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stok Awal *</label>
                    <input
                      type="number"
                      required
                      value={newMedicine.stock}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newMedicine.price}
                    onChange={(e) => setNewMedicine({ ...newMedicine, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all"
                  >
                    Simpan Obat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
