import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  Pill,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  ShieldAlert,
  ArrowRight,
  PackageCheck,
  Search,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';

export default function Pharmacy() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedRx, setSelectedRx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [dispensingId, setDispensingId] = useState(null);

  // 7-Benar Telaah Checklist State
  const [checklist, setChecklist] = useState({
    benarPasien: true,
    benarObatDosis: true,
    tidakAdaInteraksi: true,
  });

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `/prescriptions?status=${filterStatus}` : '/prescriptions';
      const res = await apiYii.get(url);
      const items = res.data.data || [];
      setPrescriptions(items);
      if (items.length > 0 && !selectedRx) {
        setSelectedRx(items[0]);
      } else if (selectedRx) {
        // Keep updated item selected
        const updated = items.find((i) => i.id === selectedRx.id);
        if (updated) setSelectedRx(updated);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar resep farmasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [filterStatus]);

  // Dispense Prescription (Scenario D.2)
  const handleDispense = async (prescriptionId) => {
    setMessage(null);
    setError(null);
    setDispensingId(prescriptionId);
    try {
      const res = await apiYii.post(`/prescriptions/${prescriptionId}/dispense`);
      if (res.data?.success) {
        setMessage(`Penyerahan Obat Berhasil! ${res.data.message}`);
        fetchPrescriptions();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memproses penyerahan obat.');
    } finally {
      setDispensingId(null);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  // Filtered list by search query
  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rx.prescription_number?.toLowerCase().includes(q) ||
      rx.patient?.name?.toLowerCase().includes(q) ||
      rx.patient?.mr_number?.toLowerCase().includes(q) ||
      rx.doctor?.name?.toLowerCase().includes(q)
    );
  });

  // Calculate Stat Counts
  const totalCount = prescriptions.length;
  const pendingCount = prescriptions.filter((r) => r.status === 'PENDING').length;
  const dispensedCount = prescriptions.filter((r) => r.status === 'DISPENSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Farmasi & Pelayanan Resep Obat</h1>
          <p className="text-xs text-slate-500 mt-1">
            Validasi stok, telaah resep 7 benar, dan proteksi konkurensi dengan <span className="font-semibold text-blue-600">Pessimistic Locking & Atomic Decrement (Skenario D.2)</span>.
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menunggu Telaah ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('DISPENSED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'DISPENSED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai Dispensing ({dispensedCount})
          </button>
        </div>
      </div>

      {/* Top 3 Stat Cards (Matching Penpot Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Resep Masuk Hari Ini</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalCount} Resep</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Sinkron antrean dokter</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Menunggu Telaah</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{pendingCount} Resep</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Antrean masuk poli</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Selesai Dispensing</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{dispensedCount} Resep</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Stok terpotong otomatis</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
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

      {/* Two Column Layout: Left (Prescription List) & Right (Detail & Telaah Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Daftar Resep Masuk (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Daftar Resep Masuk</h2>
            <span className="text-xs text-slate-500 font-semibold">{filteredPrescriptions.length} Resep</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Resep, Pasien, Dokter..."
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat resep...</div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Tidak ada resep pada status ini.</div>
            ) : (
              filteredPrescriptions.map((rx) => {
                const isSelected = selectedRx?.id === rx.id;
                const isPending = rx.status === 'PENDING';
                return (
                  <div
                    key={rx.id}
                    onClick={() => setSelectedRx(rx)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-600 text-xs">
                          {rx.prescription_number}
                        </span>
                        <div className="font-semibold text-slate-900 text-sm mt-0.5">{rx.patient?.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          No. RM: {rx.patient?.mr_number} • {rx.doctor?.name} ({rx.items?.length || 0} Item)
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isPending ? 'Menunggu Telaah' : 'Diserahkan'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Resep & Telaah Farmasi (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          {!selectedRx ? (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <Pill className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
              <div className="font-semibold text-slate-600 text-sm">Pilih Resep dari Daftar Masuk</div>
              <p className="text-xs max-w-sm mx-auto">
                Lakukan telaah resep 7 benar dan verifikasi ketersediaan stok fisik sebelum melakukan penyerahan obat (dispense).
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Card Header & Patient Identity */}
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Detail Resep & Telaah Farmasi</h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    No. Resep: <span className="font-mono font-bold text-blue-600">{selectedRx.prescription_number}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedRx.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {selectedRx.status === 'PENDING' ? 'Menunggu Telaah & Dispensing' : 'Obat Telah Diserahkan (Lengkap)'}
                </span>
              </div>

              {/* Patient Meta Strip */}
              <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Pasien:</span>
                  <span className="font-bold text-slate-900">{selectedRx.patient?.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">No. Rekam Medis:</span>
                  <span className="font-mono font-semibold text-blue-600">{selectedRx.patient?.mr_number}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Dokter Peresep:</span>
                  <span className="font-semibold text-slate-800">{selectedRx.doctor?.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Status Alergi:</span>
                  <span className="font-semibold text-rose-600">{selectedRx.patient?.allergies || 'Tidak Ada'}</span>
                </div>
              </div>

              {/* Telaah 7 Benar Checklist Strip (Matching Penpot Design) */}
              <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-blue-600" /> Checklist Telaah Farmasi (7 Benar Resep):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={checklist.benarPasien}
                      onChange={(e) => setChecklist({ ...checklist, benarPasien: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>1. Benar Pasien & RM</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={checklist.benarObatDosis}
                      onChange={(e) => setChecklist({ ...checklist, benarObatDosis: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>2. Benar Obat & Dosis</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={checklist.tidakAdaInteraksi}
                      onChange={(e) => setChecklist({ ...checklist, tidakAdaInteraksi: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>3. Tidak Ada Interaksi</span>
                  </label>
                </div>
              </div>

              {/* Rincian Obat Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rincian Obat & Aturan Pakai:
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">NAMA OBAT</th>
                        <th className="py-2.5 px-4">DOSIS & ATURAN PAKAI</th>
                        <th className="py-2.5 px-4 text-center">QTY</th>
                        <th className="py-2.5 px-4 text-right">HARGA SATUAN</th>
                        <th className="py-2.5 px-4 text-right">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRx.items?.map((item) => {
                        const medStock = item.medicine?.stock ?? 0;
                        const isShortage = selectedRx.status === 'PENDING' && item.quantity > medStock;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              <div>{item.medicine?.name}</div>
                              <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-semibold ${
                                isShortage ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                Stok: {medStock} {item.medicine?.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div>{item.dosage} • {item.frequency}</div>
                              {item.instructions && <div className="text-[11px] text-slate-400 italic mt-0.5">{item.instructions}</div>}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                              {item.quantity} {item.medicine?.unit}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-600">
                              {formatRupiah(item.unit_price)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(item.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total & Action Footer (Matching Penpot Spacing with Generous Padding) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-[11px] text-slate-500">Total Biaya Obat Resep:</div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {formatRupiah(selectedRx.total_amount)}
                  </div>
                </div>

                {selectedRx.status === 'PENDING' ? (
                  <button
                    onClick={() => handleDispense(selectedRx.id)}
                    disabled={dispensingId === selectedRx.id || !checklist.benarPasien || !checklist.benarObatDosis}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <PackageCheck className="w-4 h-4" />
                    {dispensingId === selectedRx.id ? 'Memproses Dispensing...' : 'Proses Dispensing Obat'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-4 h-4" />
                    <span>Diserahkan: {new Date(selectedRx.dispensed_at || Date.now()).toLocaleTimeString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
