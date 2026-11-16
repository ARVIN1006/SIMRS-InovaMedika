import React, { useState, useEffect } from 'react';
import { apiNode } from '../api';
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [error, setError] = useState(null);

  const fetchStats = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiNode.get(`/dashboard/stats?period=${selectedPeriod}`);
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data statistik dashboard dari Node.js Analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Title & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-sky-50/60 to-transparent pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Real-Time Feed
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Aggregated in &lt;15ms</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard &amp; Laporan Operasional</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan analitik real-time pelayanan rawat jalan yang diagregasi melalui <span className="font-semibold text-emerald-600">Node.js Express Backend Service</span>.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 z-10">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari' },
            { id: '30days', label: '30 Hari' },
            { id: 'all', label: 'Semua Periode' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === p.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
            { id: '30days', label: '30 Hari' },
            { id: 'all', label: 'Semua' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                period === p.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kunjungan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kunjungan</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : stats?.summary?.total_visits || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{stats?.summary?.completed_count || 0}</span> Selesai,{' '}
              <span className="text-amber-600 font-semibold">{stats?.summary?.waiting_count || 0}</span> Menunggu
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Billing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Nilai Tagihan</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : formatRupiah(stats?.revenue?.gross_billing)}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">
              Lunas: {stats?.revenue?.paid_invoices || 0} Invoice
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Kas Diterima */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendapatan Terbayar</div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {loading ? '...' : formatRupiah(stats?.revenue?.total_collected)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Piutang: {formatRupiah(stats?.revenue?.outstanding_balance)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Tindakan Terbanyak */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tindakan Medis</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {loading ? '...' : stats?.top_services?.[0]?.total_performed || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate max-w-[150px]">
              Top: {stats?.top_services?.[0]?.name || 'Belum ada'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Visits per Clinic & Top Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kunjungan Berdasarkan Poli */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Distribusi Kunjungan Berdasarkan Poliklinik</h2>
            <span className="text-xs font-semibold text-slate-400">Total Kunjungan</span>
          </div>
          <div className="space-y-3">
            {stats?.visits_by_clinic?.map((c) => {
              const maxVisits = Math.max(...(stats.visits_by_clinic.map((v) => parseInt(v.visit_count, 10)) || [1]), 1);
              const percentage = Math.round((parseInt(c.visit_count, 10) / maxVisits) * 100);
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-bold font-mono text-slate-900">{c.visit_count} pasien</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Obat Terbanyak Dikeluarkan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Rekap 5 Obat Terbanyak Diserahkan</h2>
            <span className="text-xs font-semibold text-slate-400">Farmasi</span>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.top_medicines?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada obat yang diserahkan pada periode ini.</p>
            ) : (
              stats?.top_medicines?.map((m, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <div className="text-slate-400 text-[11px]">Nilai: {formatRupiah(m.total_sales)}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-indigo-700 text-sm">
                      {m.total_dispensed}
                    </span>{' '}
                    <span className="text-slate-500 text-[11px]">{m.unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Registrations Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900">Aktivitas Pelayanan Pasien Terbaru</h2>
          <span className="text-xs text-slate-500">Live feed rekam medis</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NO ANTREAN</th>
                <th className="py-3 px-4">PASIEN & NO RM</th>
                <th className="py-3 px-4">POLIKLINIK & DOKTER</th>
                <th className="py-3 px-4">PENJAMIN</th>
                <th className="py-3 px-4">STATUS PELAYANAN</th>
                <th className="py-3 px-4 text-right">TAGIHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats?.recent_visits?.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                    {v.queue_number}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{v.patient_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{v.mr_number}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{v.clinic_name}</div>
                    <div className="text-[11px] text-slate-500">{v.doctor_name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-300">
                      {v.payment_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'IN_EXAMINATION' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {v.total_amount ? formatRupiah(v.total_amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
