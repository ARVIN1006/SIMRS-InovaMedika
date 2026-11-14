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
} from 'lucide-react';

export default function Pharmacy() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [dispensingId, setDispensingId] = useState(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `/prescriptions?status=${filterStatus}` : '/prescriptions';
      const res = await apiYii.get(url);
      setPrescriptions(res.data.data || []);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Farmasi & Pelayanan Resep Obat</h1>
          <p className="text-sm text-slate-500 mt-1">
            Validasi stok, dispensing obat, dan proteksi konkurensi stok minus menggunakan <span className="font-semibold text-amber-600">Pessimistic Locking & Atomic Decrement (Skenario D.2)</span>.
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === 'PENDING'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resep Menunggu (Pending)
          </button>
          <button
            onClick={() => setFilterStatus('DISPENSED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === 'DISPENSED'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sudah Diserahkan (Dispensed)
          </button>
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === ''
                ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Resep
          </button>
        </div>
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

      {/* Prescriptions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
            Memuat daftar resep farmasi...
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200 space-y-2">
            <Pill className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-semibold text-slate-600">Tidak ada resep pada status ini.</div>
          </div>
        ) : (
          prescriptions.map((rx) => {
            const isPending = rx.status === 'PENDING';
            return (
              <div
                key={rx.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  isPending ? 'border-amber-200/80 hover:border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Header Bar */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm text-indigo-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                      {rx.prescription_number}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{rx.patient?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        No. RM: {rx.patient?.mr_number} • Dokter: {rx.doctor?.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rx.status}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handleDispense(rx.id)}
                        disabled={dispensingId === rx.id}
                        className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow"
                      >
                        <PackageCheck className="w-4 h-4" />
                        {dispensingId === rx.id ? 'Memproses...' : 'Serahkan Obat (Dispense)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Daftar Rincian Obat yang Diresepkan:
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">NAMA OBAT</th>
                        <th className="py-2.5 px-3">DOSIS & ATURAN PAKAI</th>
                        <th className="py-2.5 px-3 text-center">JUMLAH (QTY)</th>
                        <th className="py-2.5 px-3 text-right">HARGA SATUAN</th>
                        <th className="py-2.5 px-3 text-right">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rx.items?.map((item) => {
                        const medStock = item.medicine?.stock ?? 0;
                        const isShortage = isPending && item.quantity > medStock;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {item.medicine?.name}
                              {isPending && (
                                <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  isShortage ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  Stok Tersedia: {medStock} {item.medicine?.unit}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {item.dosage} • {item.frequency}
                              {item.instructions && <div className="text-[11px] text-slate-400 italic">{item.instructions}</div>}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                              {item.quantity} {item.medicine?.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {formatRupiah(item.unit_price)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatRupiah(item.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Footer Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div className="text-slate-500">
                      {rx.dispensed_at ? (
                        <span>Diserahkan pada: {new Date(rx.dispensed_at).toLocaleString('id-ID')}</span>
                      ) : (
                        <span>Menunggu verifikasi dan penyerahan oleh staf farmasi</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 mr-2">Total Biaya Obat:</span>
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        {formatRupiah(rx.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
