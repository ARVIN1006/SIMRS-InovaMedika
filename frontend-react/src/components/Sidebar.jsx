import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Users,
  Pill,
  FlaskConical,
  Receipt,
  Database
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab, userRole }) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'REGISTRATION', 'DOCTOR', 'PHARMACY', 'LAB', 'CASHIER'],
    },
    {
      id: 'registration',
      label: 'Pendaftaran Pasien',
      icon: UserPlus,
      roles: ['ADMIN', 'REGISTRATION'],
    },
    {
      id: 'doctor',
      label: 'Pemeriksaan RME',
      icon: Stethoscope,
      roles: ['ADMIN', 'DOCTOR'],
    },
    {
      id: 'patients',
      label: 'Data Pasien & RM',
      icon: Users,
      roles: ['ADMIN', 'REGISTRATION', 'DOCTOR'],
    },
    {
      id: 'pharmacy',
      label: 'Resep & Farmasi',
      icon: Pill,
      roles: ['ADMIN', 'PHARMACY'],
    },
    {
      id: 'lab',
      label: 'Laboratorium LIS',
      icon: FlaskConical,
      roles: ['ADMIN', 'LAB', 'DOCTOR'],
    },
    {
      id: 'cashier',
      label: 'Kasir Pembayaran',
      icon: Receipt,
      roles: ['ADMIN', 'CASHIER'],
    },
    {
      id: 'master',
      label: 'Master Data & Tarif',
      icon: Database,
      roles: ['ADMIN'],
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => userRole === 'ADMIN' || item.roles.includes(userRole)
  );

  return (
    <aside className="w-56 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] flex flex-col justify-between shrink-0 select-none">
      <div className="py-4">
        {/* Section Header */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 pb-2.5">
          MENU PELAYANAN
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-0.5 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                {/* Active Indicator Bar on the left */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r"></span>
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="mx-4 my-3 border-t border-slate-100"></div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100">
        <div className="text-[10px] text-slate-400 font-medium">
          PT Inova Medika Solusindo
        </div>
        <div className="text-[10px] text-slate-400/80">
          v1.0.0 (Production Ready)
        </div>
      </div>
    </aside>
  );
}
