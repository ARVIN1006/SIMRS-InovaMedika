import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  Stethoscope,
  Activity,
  User,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  History,
  Edit3,
} from 'lucide-react';

export default function DoctorQueue() {
  const [waitingList, setWaitingList] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [masterServices, setMasterServices] = useState([]);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // EMR Form State
  const [anamnesis, setAnamnesis] = useState('');
  const [complaints, setComplaints] = useState('');
  const [systolicBp, setSystolicBp] = useState('120');
  const [diastolicBp, setDiastolicBp] = useState('80');
  const [pulseRate, setPulseRate] = useState('78');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [bodyTemp, setBodyTemp] = useState('36.5');
  const [weightKg, setWeightKg] = useState('65');
  const [heightCm, setHeightCm] = useState('168');
  const [physicalExam, setPhysicalExam] = useState('Keadaan umum baik, compos mentis.');
  const [primaryDiag, setPrimaryDiag] = useState('Hipertensi Primer');
  const [primaryIcd10, setPrimaryIcd10] = useState('I10');
  const [secondaryDiag, setSecondaryDiag] = useState('');
  const [secondaryIcd10, setSecondaryIcd10] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  // Dynamic lists in consultation
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [labTestType, setLabTestType] = useState('');
  const [labIndication, setLabIndication] = useState('');

  // Amendment Modal State (Scenario D.4)
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendReason, setAmendReason] = useState('');
  const [amendNewDiag, setAmendNewDiag] = useState('');
  const [amendNewIcd, setAmendNewIcd] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [resQueue, resServices, resMeds] = await Promise.all([
        apiYii.get('/registrations?status=WAITING'),
        apiYii.get('/services'),
        apiYii.get('/medicines'),
      ]);
      setWaitingList(resQueue.data.data?.items || []);
      setMasterServices(resServices.data.data || []);
      setMasterMedicines(resMeds.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSelectPatient = (reg) => {
    setSelectedReg(reg);
    setComplaints(reg.notes || '');
    setAnamnesis(`Pasien datang mengeluh ${reg.notes || 'keluhan umum'}.`);
    // Preload consultation fee action
    const defaultConsul = masterServices.find((s) => s.category === 'KONSULTASI');
    if (defaultConsul) {
      setSelectedServices([{ service_id: defaultConsul.id, name: defaultConsul.name, price: defaultConsul.price, quantity: 1 }]);
    } else {
      setSelectedServices([]);
    }
    setSelectedMedicines([]);
    setLabTestType('');
    setLabIndication('');
  };

  const handleAddService = (serviceId) => {
    const srv = masterServices.find((s) => s.id === parseInt(serviceId, 10));
    if (srv && !selectedServices.some((item) => item.service_id === srv.id)) {
      setSelectedServices([...selectedServices, { service_id: srv.id, name: srv.name, price: srv.price, quantity: 1 }]);
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => s.service_id !== serviceId));
  };

  const handleAddMedicine = (medId) => {
    const med = masterMedicines.find((m) => m.id === parseInt(medId, 10));
    if (med && !selectedMedicines.some((item) => item.medicine_id === med.id)) {
      setSelectedMedicines([
        ...selectedMedicines,
        {
          medicine_id: med.id,
          name: med.name,
          unit: med.unit,
          stock: med.stock,
          price: med.price,
          quantity: 10,
          dosage: '500 mg',
          frequency: '3 x 1 hari sesudah makan',
          instructions: 'Minum teratur setelah makan.',
        },
      ]);
    }
  };

  const handleRemoveMedicine = (medId) => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.medicine_id !== medId));
  };

  // Submit Complete Medical Examination
  const handleSubmitExamination = async (e) => {
    e.preventDefault();
    if (!selectedReg) return;
    setMessage(null);
    setError(null);

    // Validate medicine stock before submitting
    for (const med of selectedMedicines) {
      if (med.quantity > med.stock) {
        setError(`Peringatan Stok Obat: Permintaan ${med.name} (${med.quantity}) melebihi stok yang tersedia (${med.stock}). Silakan sesuaikan jumlah.`);
        return;
      }
    }

    try {
      const payload = {
        registration_id: selectedReg.id,
        anamnesis,
        complaints,
        systolic_bp: parseInt(systolicBp, 10),
        diastolic_bp: parseInt(diastolicBp, 10),
        pulse_rate: parseInt(pulseRate, 10),
        respiratory_rate: parseInt(respiratoryRate, 10),
        body_temperature: parseFloat(bodyTemp),
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        physical_examination: physicalExam,
        primary_diagnosis: primaryDiag,
        primary_icd10: primaryIcd10,
        secondary_diagnosis: secondaryDiag,
        secondary_icd10: secondaryIcd10,
        doctor_notes: doctorNotes,
        services: selectedServices.map((s) => ({ service_id: s.service_id, quantity: s.quantity })),
        medicines: selectedMedicines.map((m) => ({
          medicine_id: m.medicine_id,
          quantity: m.quantity,
          dosage: m.dosage,
          frequency: m.frequency,
          instructions: m.instructions,
        })),
        lab_test_type: labTestType || null,
        lab_clinical_indication: labIndication || null,
        lab_priority: 'ROUTINE',
        lab_fee: 150000.0,
      };

      const res = await apiYii.post('/examinations', payload);
      if (res.data?.success) {
        setMessage(`Pemeriksaan dan Rekam Medis untuk ${selectedReg.patient?.name} berhasil disimpan. Komponen tindakan, resep, dan lab otomatis terhubung ke billing pasien.`);
        setSelectedReg(null);
        fetchQueue();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menyimpan pemeriksaan dokter.');
    }
  };

  // Submit Amendment / Addendum (Scenario D.4)
  const handleAmendDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedReg?.examination) return;
    try {
      const res = await apiYii.post(`/examinations/${selectedReg.examination.id}/amend`, {
        reason: amendReason,
        primary_diagnosis: amendNewDiag,
        primary_icd10: amendNewIcd,
        notes_amendment: 'Revisi diagnosis berdasarkan konfirmasi hasil klinis lanjutan.',
      });
      if (res.data?.success) {
        alert('Amandemen Berhasil: ' + res.data.message);
        setShowAmendModal(false);
        fetchQueue();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal melakukan amandemen rekam medis.');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pemeriksaan & Rekam Medis Elektronik (RME)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Modul dokter untuk anamnesis, tanda-tanda vital, diagnosis ICD-10, tindakan medis, e-resep farmasi, dan permintaan laboratorium.
          </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Antrean Pasien Menunggu (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Antrean Pasien Poli
            </h2>
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
              {waitingList.length} Menunggu
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {waitingList.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Tidak ada pasien dalam antrean menunggu saat ini.</p>
            ) : (
              waitingList.map((q) => {
                const isSelected = selectedReg?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectPatient(q)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-600 text-xs px-1.5 py-0.5 rounded bg-white border border-blue-100">{q.queue_number}</span>
                        <div className="font-bold text-slate-900 mt-1">{q.patient?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">No. RM: {q.patient?.mr_number}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {q.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 border-t border-slate-200/60 pt-1">
                      Poli: <span className="font-semibold">{q.clinic?.name}</span> • Keluhan: {q.notes || '-'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Formulir Pemeriksaan Medis (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {!selectedReg ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Stethoscope className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
              <div className="font-semibold text-slate-600 text-sm">Pilih Pasien dari Antrean untuk Memulai Pemeriksaan</div>
              <p className="text-xs max-w-sm mx-auto">
                Sistem akan memuat data identitas, rekam medis sebelumnya, dan membuka form rekam medis elektronik terpadu.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitExamination} className="space-y-6 text-xs">
              {/* Patient Banner (Matching Penpot RME Patient Strip) */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedReg.patient?.name ? selectedReg.patient.name.slice(0, 2).toUpperCase() : 'PS'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {selectedReg.queue_number}
                      </span>
                      <span className="font-bold text-sm text-slate-900">{selectedReg.patient?.name}</span>
                      <span className="text-slate-400 font-mono text-xs">({selectedReg.patient?.mr_number})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {selectedReg.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'} | NIK: {selectedReg.patient?.nik} | Penjamin: <span className="font-semibold text-slate-700">{selectedReg.payment_type}</span> | Alergi: <span className="text-rose-600 font-semibold">{selectedReg.patient?.allergies || 'Tidak ada'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Tanda-Tanda Vital (Vital Signs) */}
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-blue-700">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> 1. Tanda-Tanda Vital (Vital Signs)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">TD Sistolik (mmHg)</label>
                    <input
                      type="number"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">TD Diastolik (mmHg)</label>
                    <input
                      type="number"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nadi / Pulse (x/mnt)</label>
                    <input
                      type="number"
                      value={pulseRate}
                      onChange={(e) => setPulseRate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Suhu Tubuh (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bodyTemp}
                      onChange={(e) => setBodyTemp(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Respirasi (x/mnt)</label>
                    <input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono font-bold text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">IMT (kg/m²)</label>
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 text-xs">
                      {((parseFloat(weightKg) || 0) / Math.pow((parseFloat(heightCm) || 100) / 100, 2)).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Anamnesis & Pemeriksaan Fisik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Anamnesis & Keluhan Pasien *</label>
                  <textarea
                    rows={3}
                    required
                    value={anamnesis}
                    onChange={(e) => setAnamnesis(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="Anamnesis riwayat penyakit sekarang..."
                  ></textarea>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hasil Pemeriksaan Fisik</label>
                  <textarea
                    rows={3}
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="Keadaan umum, kepala/leher, cor/pulmo, abdomen, ekstremitas..."
                  ></textarea>
                </div>
              </div>

              {/* 3. Diagnosis Utama & Sekunder (ICD-10) */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-emerald-700">
                  2. Penetapan Diagnosis (ICD-10)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <label className="font-bold text-slate-800 block">Diagnosis Utama *</label>
                    <input
                      type="text"
                      required
                      value={primaryDiag}
                      onChange={(e) => setPrimaryDiag(e.target.value)}
                      placeholder="Misal: Essential (primary) hypertension"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Kode ICD-10:</span>
                      <input
                        type="text"
                        required
                        value={primaryIcd10}
                        onChange={(e) => setPrimaryIcd10(e.target.value)}
                        placeholder="I10"
                        className="w-24 p-1 border border-slate-300 rounded font-mono uppercase font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <label className="font-bold text-slate-800 block">Diagnosis Sekunder (Komorbid)</label>
                    <input
                      type="text"
                      value={secondaryDiag}
                      onChange={(e) => setSecondaryDiag(e.target.value)}
                      placeholder="Misal: Tension-type headache"
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Kode ICD-10:</span>
                      <input
                        type="text"
                        value={secondaryIcd10}
                        onChange={(e) => setSecondaryIcd10(e.target.value)}
                        placeholder="G44.2"
                        className="w-24 p-1 border border-slate-300 rounded font-mono uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Tindakan Medis (Tarif Otomatis Masuk Billing) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-emerald-700">
                    3. Tindakan Medis Poliklinik
                  </h3>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddService(e.target.value);
                      e.target.value = '';
                    }}
                    className="p-1 border border-slate-300 rounded text-xs bg-white font-semibold"
                  >
                    <option value="">+ Tambah Tindakan Medis</option>
                    {masterServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatRupiah(s.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50">
                  {selectedServices.length === 0 ? (
                    <p className="p-3 text-slate-400 text-center">Belum ada tindakan medis yang dipilih.</p>
                  ) : (
                    selectedServices.map((s) => (
                      <div key={s.service_id} className="p-2.5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-800">{s.name}</span>
                          <span className="text-slate-500 font-mono ml-2">@ {formatRupiah(s.price)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{formatRupiah(s.price * s.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(s.service_id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 5. Resep Obat Farmasi (E-Prescription) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-emerald-700">
                    4. Resep Obat Elektronik
                  </h3>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddMedicine(e.target.value);
                      e.target.value = '';
                    }}
                    className="p-1 border border-slate-300 rounded text-xs bg-white font-semibold"
                  >
                    <option value="">+ Tambah Obat ke Resep</option>
                    {masterMedicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Stok: {m.stock} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50">
                  {selectedMedicines.length === 0 ? (
                    <p className="p-3 text-slate-400 text-center">Belum ada obat yang diresepkan.</p>
                  ) : (
                    selectedMedicines.map((m, idx) => (
                      <div key={m.medicine_id} className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{m.name}</span>
                            <span className="text-emerald-700 font-semibold ml-2 text-[11px]">
                              Tersedia: {m.stock} {m.unit}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(m.medicine_id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Dosis (mis: 500 mg)"
                            value={m.dosage}
                            onChange={(e) => {
                              const updated = [...selectedMedicines];
                              updated[idx].dosage = e.target.value;
                              setSelectedMedicines(updated);
                            }}
                            className="p-1.5 border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Aturan Pakai (mis: 3 x 1 hari)"
                            value={m.frequency}
                            onChange={(e) => {
                              const updated = [...selectedMedicines];
                              updated[idx].frequency = e.target.value;
                              setSelectedMedicines(updated);
                            }}
                            className="p-1.5 border border-slate-300 rounded"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-500 font-semibold">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max={m.stock}
                              value={m.quantity}
                              onChange={(e) => {
                                const updated = [...selectedMedicines];
                                updated[idx].quantity = parseInt(e.target.value, 10) || 1;
                                setSelectedMedicines(updated);
                              }}
                              className="w-16 p-1.5 border border-slate-300 rounded font-mono font-bold"
                            />
                            <span className="text-[11px] text-slate-500">{m.unit}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 6. Permintaan Pemeriksaan Penunjang (Lab) */}
              <div className="space-y-2 p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-rose-800">
                  5. Permintaan Pemeriksaan Penunjang (Laboratorium)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Jenis Pemeriksaan Lab:</label>
                    <select
                      value={labTestType}
                      onChange={(e) => setLabTestType(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    >
                      <option value="">-- Tidak Ada Permintaan Lab --</option>
                      <option value="Darah Rutin Lengkap (CBC)">Darah Rutin Lengkap (CBC)</option>
                      <option value="Profil Lipid & Kolesterol Total">Profil Lipid & Kolesterol Total</option>
                      <option value="Gula Darah Sewaktu (GDS) & HbA1c">Gula Darah Sewaktu (GDS) & HbA1c</option>
                      <option value="Fungsi Ginjal (Ureum & Kreatinin)">Fungsi Ginjal (Ureum & Kreatinin)</option>
                      <option value="Fungsi Hati (SGOT & SGPT)">Fungsi Hati (SGOT & SGPT)</option>
                      <option value="Urinalisis Lengkap">Urinalisis Lengkap</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Indikasi Klinis:</label>
                    <input
                      type="text"
                      value={labIndication}
                      onChange={(e) => setLabIndication(e.target.value)}
                      placeholder="Contoh: Evaluasi risiko kardiovaskular / hipertensi..."
                      className="w-full p-2 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Selesaikan Pemeriksaan & Simpan RME
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
