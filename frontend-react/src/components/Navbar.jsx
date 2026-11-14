import React from 'react';
import { DEMO_ROLES } from '../api';
import { ShieldCheck, UserCheck, Stethoscope, Pill, FlaskConical, Receipt, RefreshCw, Activity } from 'lucide-react';

export default function Navbar({ currentUser, onSwitchRole }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'REGISTRATION': return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'DOCTOR': return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'PHARMACY': return <Pill className="w-4 h-4 text-amber-600" />;
      case 'LAB': return <FlaskConical className="w-4 h-4 text-rose-600" />;
      case 'CASHIER': return <Receipt className="w-4 h-4 text-teal-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            IM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">SIMRS RAWAT JALAN</span>
              <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded font-semibold border border-sky-200">PT Inova Medika Solusindo</span>
            </div>
            <p className="text-xs text-slate-500">Sistem Pelayanan Rawat Jalan Terintegrasi (Yii2 + Node.js + React + PostgreSQL)</p>
          </div>
        </div>

        {/* Right: Quick Role Switcher for Test Evaluator */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-xs font-medium text-slate-500 px-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-slate-400" /> Demo Role Switcher:
            </span>
            {DEMO_ROLES.map((r) => {
              const active = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => onSwitchRole(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-300 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={r.desc}
                >
                  {getRoleIcon(r.role)}
                  <span>{r.role}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name || currentUser.username}</div>
              <div className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Smaller Screen Role Switcher Strip */}
      <div className="xl:hidden px-4 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-600 text-[11px] whitespace-nowrap">Switch Role:</span>
        {DEMO_ROLES.map((r) => (
          <button
            key={r.role}
            onClick={() => onSwitchRole(r)}
            className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap flex items-center gap-1 font-semibold ${
              currentUser.role === r.role ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {getRoleIcon(r.role)} {r.role}
          </button>
        ))}
      </div>
    </header>
  );
}
