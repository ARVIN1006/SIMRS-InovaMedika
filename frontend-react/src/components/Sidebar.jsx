import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  Database,
  FileText,
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, userRole }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Laporan',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'REGISTRATION', 'DOCTOR', 'PHARMACY', 'LAB', 'CASHIER'],
      badge: 'Node.js',
    },
    {
      id: 'registration',
      label: 'Pendaftaran & Antrean',
      icon: UserPlus,
      roles: ['ADMIN', 'REGISTRATION'],
      badge: 'Yii2',
    },
    {
      id: 'patients',
      label: 'Data Pasien (No. RM)',
      icon: Users,
      roles: ['ADMIN', 'REGISTRATION', 'DOCTOR'],
      badge: 'Yii2',
    },
    {
      id: 'doctor',
      label: 'Pemeriksaan & RME Dokter',
      icon: Stethoscope,
      roles: ['ADMIN', 'DOCTOR'],
      badge: 'Yii2',
    },
    {
      id: 'pharmacy',
      label: 'Farmasi & Resep Obat',
      icon: Pill,
      roles: ['ADMIN', 'PHARMACY'],
      badge: 'Yii2',
    },
    {
      id: 'lab',
      label: 'Pemeriksaan Penunjang Lab',
      icon: FlaskConical,
      roles: ['ADMIN', 'LAB', 'DOCTOR'],
      badge: 'Node.js',
    },
    {
      id: 'cashier',
      label: 'Billing & Kasir Pembayaran',
      icon: Receipt,
      roles: ['ADMIN', 'CASHIER'],
      badge: 'Yii2',
    },
    {
      id: 'master',
      label: 'Pengelolaan Master Data',
      icon: Database,
      roles: ['ADMIN'],
      badge: 'Yii2',
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => userRole === 'ADMIN' || item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-65px)] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
          Menu Pelayanan Rawat Jalan
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isActive ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Tech Stack Status
          </div>
          <div className="text-[11px] space-y-0.5 text-slate-300">
            <div>Core SIMRS: <span className="text-sky-400 font-semibold">Yii 2.0 (PHP 8.5)</span></div>
            <div>Services: <span className="text-emerald-400 font-semibold">Node.js (Express)</span></div>
            <div>Database: <span className="text-indigo-400 font-semibold">PostgreSQL 18</span></div>
            <div>Frontend: <span className="text-cyan-400 font-semibold">React.js + Tailwind</span></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
