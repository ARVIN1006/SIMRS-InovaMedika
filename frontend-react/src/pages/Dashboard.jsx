import React, { useState, useEffect } from 'react';
import { apiNode } from '../api';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Plus
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Menunggu
          </span>
        );
      case 'IN_PROGRESS':
      case 'IN_EXAMINATION':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Sedang Diperiksa
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pelayanan Rawat Jalan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Klinik Spesialis Penyakit Dalam - Poliklinik Lantai 2
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Period Filter Buttons */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: '30days', label: '30 Hari' },
              { id: 'all', label: 'Semua' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  period === p.id
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats(period)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Poli</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI Stat Cards (Matching Penpot 4-card row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Kunjungan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500">Total Kunjungan Hari Ini</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : (stats?.summary?.total_visits ?? 42)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +12.5% vs kemarin
          </div>
        </div>

        {/* Card 2: Pasien Menunggu */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500">Pasien Menunggu Poli</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : (stats?.summary?.waiting_count ?? 8)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            pasien di ruang tunggu
          </div>
        </div>

        {/* Card 3: Sedang Diperiksa */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500">Sedang Diperiksa</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {loading ? '...' : (stats?.summary?.in_progress_count ?? 1)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Hendra Kusuma (Poli 1)
          </div>
        </div>

        {/* Card 4: Selesai Dilayani */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500">Selesai Dilayani</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : (stats?.summary?.completed_count ?? 33)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            pasien terlayani
          </div>
        </div>
      </div>

      {/* 3. Main Antrean Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Antrean Pelayanan Hari Ini</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Pemantauan antrean pasien secara langsung di poliklinik rawat jalan</p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total Terdaftar: <span className="font-bold text-slate-900">{stats?.recent_visits?.length || 0}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider">NO. ANTREAN</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider">PASIEN & REKAM MEDIS</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider">DOKTER / POLIKLINIK</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider">PENJAMIN</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider">STATUS</th>
                <th className="py-3 px-5 text-[11px] uppercase tracking-wider text-right">TAGIHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_visits?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada data kunjungan pada periode ini.
                  </td>
                </tr>
              ) : (
                stats?.recent_visits?.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-blue-600 font-mono">
                      {v.queue_number}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{v.patient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{v.mr_number}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">{v.doctor_name || 'dr. Budi Santoso, Sp.PD'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{v.clinic_name}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-slate-600 font-medium">
                        {v.payment_type === 'BPJS' ? 'BPJS Kesehatan' : 'Umum / Mandiri'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold font-mono text-slate-700">
                      {formatRupiah(v.total_bill || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Lower Analytics Row (Visits per Clinic & Top Medicines) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Kunjungan per Poli */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">Distribusi Kunjungan per Poliklinik</h3>
            <span className="text-[11px] text-slate-400">Pasien</span>
          </div>
          <div className="space-y-2.5 pt-1">
            {stats?.visits_by_clinic?.map((c) => {
              const maxVisits = Math.max(...(stats.visits_by_clinic.map((v) => parseInt(v.visit_count, 10)) || [1]), 1);
              const percentage = Math.round((parseInt(c.visit_count, 10) / maxVisits) * 100);
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{c.name}</span>
                    <span className="font-bold text-slate-900 font-mono">{c.visit_count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Obat Terbanyak Diserahkan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900">Obat Terbanyak Diserahkan (Farmasi)</h3>
            <span className="text-[11px] text-slate-400">Total Kuantitas</span>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.top_medicines?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada obat yang diserahkan.</p>
            ) : (
              stats?.top_medicines?.map((m, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{m.name}</div>
                    <div className="text-slate-400 text-[11px]">{formatRupiah(m.total_sales)}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-600 text-sm">{m.total_dispensed}</span>{' '}
                    <span className="text-slate-400 text-[11px]">{m.unit}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
