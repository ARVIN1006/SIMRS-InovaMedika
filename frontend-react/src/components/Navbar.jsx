import React, { useState } from 'react';
import { DEMO_ROLES } from '../api';
import {
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  User,
  Plus
} from 'lucide-react';

export default function Navbar({ currentUser, onSwitchRole }) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
      case 'REGISTRATION': return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'DOCTOR': return <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />;
      case 'PHARMACY': return <Pill className="w-3.5 h-3.5 text-amber-600" />;
      case 'LAB': return <FlaskConical className="w-3.5 h-3.5 text-rose-600" />;
      case 'CASHIER': return <Receipt className="w-3.5 h-3.5 text-teal-600" />;
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'BS';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* 1. Left: Brand with Medical Cross Logo */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white relative shadow-sm">
          {/* Native medical cross shape */}
          <div className="absolute w-5 h-1 bg-white rounded-sm"></div>
          <div className="absolute w-1 h-5 bg-white rounded-sm"></div>
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">
            Inova Medika SIMRS
          </h1>
          <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
            Pelayanan Rawat Jalan
          </p>
        </div>
      </div>

      {/* 2. Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Cari pasien (nama, no. RM, NIK) atau dokter..."
            className="w-full bg-slate-100/90 border border-slate-200/90 rounded-lg pl-3.5 pr-16 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Date, Role Switcher, & Doctor Profile */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden lg:block text-xs font-medium text-slate-500">
          Senin, 16 Nov 2026
        </div>

        <div className="hidden lg:block w-px h-5 bg-slate-200"></div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
            title="Ganti Peran Pengguna Demo"
          >
            {getRoleIcon(currentUser.role)}
            <span>{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pilih Peran Demo Penguji
              </div>
              {DEMO_ROLES.map((r) => {
                const active = currentUser.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      onSwitchRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(r.role)}
                      <span>{r.role}</span>
                    </div>
                    {active && <span className="text-[10px] text-blue-600 font-semibold">Aktif</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile Cluster */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
            {getInitials(currentUser.name || currentUser.username)}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.name || 'dr. Budi Santoso, Sp.PD'}
            </div>
            <div className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
              {currentUser.role === 'DOCTOR' ? 'Klinik Penyakit Dalam' : `${currentUser.role} Staff`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
