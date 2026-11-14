import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  UserPlus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Building,
  Stethoscope,
  Filter,
} from 'lucide-react';

export default function Registration() {
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setDoctorSchedules] = useState([]);
  const [todayQueue, setTodayQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [paymentType, setPaymentType] = useState('UMUM');
  const [notes, setNotes] = useState('');

  // New Patient Quick-Register Form Modal
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    nik: '',
    birth_date: '1995-01-01',
    gender: 'L',
    blood_type: 'O',
    phone: '',
    address: '',
    allergies: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resClinics, resDoctors, resQueue] = await Promise.all([
        apiYii.get('/clinics'),
        apiYii.get('/doctors'),
        apiYii.get('/registrations/today-queue'),
      ]);
      setClinics(resClinics.data.data || []);
      setDoctors(resDoctors.data.data || []);
      setTodayQueue(resQueue.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search Patient
  const handleSearchPatient = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await apiYii.get(`/patients?search=${encodeURIComponent(searchQuery)}`);
      setPatients(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Select Clinic -> Filter Doctors
  const handleClinicChange = (clinicId) => {
    setSelectedClinic(clinicId);
    setSelectedDoctor('');
    setSelectedSchedule('');
  };

  const filteredDoctors = doctors.filter((d) => !selectedClinic || d.clinic_id === parseInt(selectedClinic, 10));

  // Submit Visit Registration
  const handleRegisterVisit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage('Silakan cari dan pilih pasien terlebih dahulu.');
      return;
    }
    if (!selectedClinic) {
      setErrorMessage('Silakan pilih poliklinik tujuan.');
      return;
    }
    if (!selectedDoctor) {
      setErrorMessage('Silakan pilih dokter yang bertugas.');
      return;
    }

    try {
      const res = await apiYii.post('/registrations', {
        patient_id: selectedPatient.id,
        clinic_id: parseInt(selectedClinic, 10),
        doctor_id: parseInt(selectedDoctor, 10),
        schedule_id: selectedSchedule ? parseInt(selectedSchedule, 10) : null,
        payment_type: paymentType,
        notes: notes,
      });

      if (res.data?.success) {
        setMessage(`Pendaftaran Berhasil! Nomor Antrean: ${res.data.data.registration.queue_number}`);
        // Reset form
        setSelectedPatient(null);
        setSelectedClinic('');
        setSelectedDoctor('');
        setNotes('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Gagal melakukan pendaftaran kunjungan.';
      setErrorMessage(msg);
    }
  };

  // Submit Quick Create New Patient
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await apiYii.post('/patients', newPatient);
      if (res.data?.success) {
        setSelectedPatient(res.data.data);
        setShowNewPatientModal(false);
        setMessage(`Pasien baru berhasil didaftarkan dengan No. Rekam Medis: ${res.data.data.mr_number}`);
        setNewPatient({
          name: '',
          nik: '',
          birth_date: '1995-01-01',
          gender: 'L',
          blood_type: 'O',
          phone: '',
          address: '',
          allergies: '',
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pasien baru.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pendaftaran & Antrean Pasien</h1>
          <p className="text-sm text-slate-500 mt-1">
            Modul pendaftaran rawat jalan dengan penomoran antrean otomatis dan proteksi duplikasi kunjungan (<span className="font-semibold text-sky-600">Skenario D.1</span>).
          </p>
        </div>
        <button
          onClick={() => setShowNewPatientModal(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow"
        >
          <UserPlus className="w-4 h-4" /> Pasien Baru (Buat No. RM)
        </button>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Left (Form Pendaftaran) & Right (Live Queue Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Pendaftaran Kunjungan (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-sky-600" /> Formulir Pendaftaran Kunjungan Poli
          </h2>

          {/* 1. Pencarian Pasien */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">1. Cari Data Pasien (No. RM / NIK / Nama):</label>
            <form onSubmit={handleSearchPatient} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik No. RM (mis: RM-202611-0001) atau Nama Pasien..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                Cari
              </button>
            </form>

            {/* Hasil Pencarian */}
            {patients.length > 0 && !selectedPatient && (
              <div className="border border-slate-200 rounded-lg max-h-44 overflow-y-auto divide-y divide-slate-100 bg-slate-50 text-xs">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="p-2.5 hover:bg-sky-50 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>{' '}
                      <span className="text-slate-500 font-mono">({p.mr_number})</span>
                      <div className="text-[11px] text-slate-500">NIK: {p.nik} | {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                    </div>
                    <button className="bg-sky-600 text-white px-2.5 py-1 rounded text-[11px] font-bold">
                      Pilih
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Patient Card */}
            {selectedPatient && (
              <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-lg flex justify-between items-start text-xs">
                <div>
                  <div className="font-bold text-sky-950 text-sm">{selectedPatient.name}</div>
                  <div className="text-sky-800 font-mono font-semibold">No. RM: {selectedPatient.mr_number}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">NIK: {selectedPatient.nik} | Tgl Lahir: {selectedPatient.birth_date}</div>
                  <div className="text-slate-600 text-[11px]">Alamat: {selectedPatient.address}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Ganti Pasien
                </button>
              </div>
            )}
          </div>

          {/* 2. Pemilihan Poliklinik & Dokter */}
          <form onSubmit={handleRegisterVisit} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">2. Pilih Poliklinik Tujuan:</label>
                <select
                  value={selectedClinic}
                  onChange={(e) => handleClinicChange(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Poliklinik --</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">3. Pilih Dokter Praktik:</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Pilih Dokter --</option>
                  {filteredDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Penjamin:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                >
                  <option value="UMUM">UMUM (Biaya Mandiri)</option>
                  <option value="BPJS">BPJS Kesehatan</option>
                  <option value="ASURANSI_SWASTA">Asuransi Swasta</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Biaya Pendaftaran Awal:</label>
                <input
                  type="text"
                  value="Rp 25.000 (Otomatis Masuk Billing)"
                  disabled
                  className="w-full p-2 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Keluhan Awal / Catatan Kunjungan:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pasien mengeluh pusing dan demam sejak kemarin..."
                rows={2}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={!selectedPatient || !selectedClinic || !selectedDoctor}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all shadow-md"
            >
              Daftarkan Kunjungan & Terbitkan Nomor Antrean
            </button>
          </form>
        </div>

        {/* Live Antrean Hari Ini (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Antrean Hari Ini
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {todayQueue.length} Pasien
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto space-y-1">
            {todayQueue.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Belum ada pasien yang terdaftar hari ini.</p>
            ) : (
              todayQueue.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-indigo-700">{q.queue_number}</span>
                      <span className="font-bold text-slate-900">{q.patient?.name}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {q.clinic?.name} • {q.doctor?.name}
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      q.status === 'IN_EXAMINATION' ? 'bg-sky-100 text-sky-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Quick Register Pasien Baru */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" /> Pendaftaran Pasien Baru SIMRS
            </h2>
            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Contoh: Muhammad Farhan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={newPatient.nik}
                    onChange={(e) => setNewPatient({ ...newPatient, nik: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    placeholder="3204xxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={newPatient.birth_date}
                    onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Golongan Darah</label>
                  <select
                    value={newPatient.blood_type}
                    onChange={(e) => setNewPatient({ ...newPatient, blood_type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">-</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. HP Pasien</label>
                  <input
                    type="text"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="0812xxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap *</label>
                <textarea
                  required
                  rows={2}
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan..."
                ></textarea>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Riwayat Alergi (Jika Ada)</label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  placeholder="Mis: Penisilin, Amoxicillin, Seafood..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold"
                >
                  Simpan & Buat No. RM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
