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

  // Simple Add Modals
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pengelolaan Master Data SIMRS</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen master poli pelayanan, tenaga medis dokter, katalog tindakan & tarif, serta inventori obat dan stok.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Tambah Item Baru
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-xl gap-6 text-xs font-bold">
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
              className={`py-4 flex items-center gap-2 border-b-2 transition-all ${
                isActive ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
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
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">KODE TINDAKAN</th>
                <th className="py-2.5 px-3">NAMA TINDAKAN MEDIS</th>
                <th className="py-2.5 px-3">KATEGORI</th>
                <th className="py-2.5 px-3">DESKRIPSI</th>
                <th className="py-2.5 px-3 text-right">TARIF</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{s.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">{s.category}</td>
                  <td className="py-2.5 px-3 text-slate-500">{s.description || '-'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(s.price)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 2. Obat & Stok */}
        {activeSubTab === 'medicines' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">KODE OBAT</th>
                <th className="py-2.5 px-3">NAMA OBAT</th>
                <th className="py-2.5 px-3">KATEGORI</th>
                <th className="py-2.5 px-3">SATUAN</th>
                <th className="py-2.5 px-3 text-center">SISA STOK</th>
                <th className="py-2.5 px-3 text-right">HARGA JUAL</th>
                <th className="py-2.5 px-3 text-center">STATUS STOK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicines.map((m) => {
                const isLow = m.stock <= m.min_stock;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-800">{m.code}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.name}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-semibold">{m.category}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-extrabold text-slate-900">{m.stock}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatRupiah(m.price)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isLow ? 'Stok Kritis' : 'Aman'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 3. Poli */}
        {activeSubTab === 'clinics' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">KODE POLI</th>
                <th className="py-2.5 px-3">NAMA POLIKLINIK</th>
                <th className="py-2.5 px-3">LOKASI GEDUNG</th>
                <th className="py-2.5 px-3">DESKRIPSI</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-800">{c.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{c.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{c.location}</td>
                  <td className="py-2.5 px-3 text-slate-500">{c.description}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 4. Dokter */}
        {activeSubTab === 'doctors' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">NOMOR SIP</th>
                <th className="py-2.5 px-3">NAMA DOKTER</th>
                <th className="py-2.5 px-3">SPESIALISASI</th>
                <th className="py-2.5 px-3">POLIKLINIK</th>
                <th className="py-2.5 px-3">NO. TELEPON</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-600">{d.sip_number}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{d.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">{d.specialization}</td>
                  <td className="py-2.5 px-3 text-slate-700">{d.clinic?.name || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-600">{d.phone || '-'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              {activeSubTab === 'services' ? 'Tambah Master Tindakan Medis' : 'Tambah Master Obat Farmasi'}
            </h2>

            {activeSubTab === 'services' ? (
              <form onSubmit={handleCreateService} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Tindakan *</label>
                  <input
                    type="text"
                    required
                    value={newService.code}
                    onChange={(e) => setNewService({ ...newService, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                    placeholder="SRV-USG-THYROID"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Tindakan Medis *</label>
                  <input
                    type="text"
                    required
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="USG Thyroid Doppler"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori *</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="KONSULTASI">KONSULTASI</option>
                    <option value="DIAGNOSTIK">DIAGNOSTIK</option>
                    <option value="TERAPI">TERAPI</option>
                    <option value="TINDAKAN_KECIL">TINDAKAN_KECIL</option>
                    <option value="TINDAKAN_GIGI">TINDAKAN_GIGI</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tarif Tindakan (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded font-bold">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded font-bold">
                    Simpan Tindakan
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Obat *</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.code}
                    onChange={(e) => setNewMedicine({ ...newMedicine, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                    placeholder="MED-DEXA-05"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Obat *</label>
                  <input
                    type="text"
                    required
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="Dexamethasone 0.5 mg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Satuan *</label>
                    <input
                      type="text"
                      required
                      value={newMedicine.unit}
                      onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded"
                      placeholder="Tablet / Botol"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stok Awal *</label>
                    <input
                      type="number"
                      required
                      value={newMedicine.stock}
                      onChange={(e) => setNewMedicine({ ...newMedicine, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-2 border border-slate-300 rounded font-mono"
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
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded font-bold">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded font-bold">
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
