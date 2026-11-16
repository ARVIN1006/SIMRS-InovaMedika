import React, { useState, useEffect } from 'react';
import { apiNode } from '../api';
import {
  FlaskConical,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileCheck,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  X,
} from 'lucide-react';

export default function Laboratory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Input Results State
  const [testResults, setTestResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Circuit Breaker Simulation State (Scenario D.5)
  const [circuitResponse, setCircuitResponse] = useState(null);

  const fetchLabRequests = async () => {
    setLoading(true);
    try {
      const res = await apiNode.get('/lab/requests');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar permintaan laboratorium dari Node.js Service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabRequests();
  }, []);

  const handleOpenResultModal = async (reqItem) => {
    try {
      const res = await apiNode.get(`/lab/requests/${reqItem.id}`);
      const fullData = res.data.data;
      setSelectedRequest(fullData);

      if (fullData.results && fullData.results.length > 0) {
        setTestResults(fullData.results);
      } else {
        // Pre-fill standard templates based on test type
        if (fullData.test_type?.includes('Lipid')) {
          setTestResults([
            { test_name: 'Kolesterol Total', result_value: '190', normal_range: '< 200', unit: 'mg/dL', interpretation: 'NORMAL' },
            { test_name: 'Trigliserida', result_value: '140', normal_range: '< 150', unit: 'mg/dL', interpretation: 'NORMAL' },
            { test_name: 'Kolesterol HDL', result_value: '52', normal_range: '> 40', unit: 'mg/dL', interpretation: 'NORMAL' },
            { test_name: 'Kolesterol LDL', result_value: '98', normal_range: '< 100', unit: 'mg/dL', interpretation: 'NORMAL' },
          ]);
        } else if (fullData.test_type?.includes('Darah Rutin')) {
          setTestResults([
            { test_name: 'Hemoglobin (Hb)', result_value: '14.2', normal_range: '13.0 - 17.5', unit: 'g/dL', interpretation: 'NORMAL' },
            { test_name: 'Leukosit', result_value: '7500', normal_range: '4500 - 11000', unit: '/uL', interpretation: 'NORMAL' },
            { test_name: 'Trombosit', result_value: '260000', normal_range: '150000 - 450000', unit: '/uL', interpretation: 'NORMAL' },
            { test_name: 'Hematokrit', result_value: '42', normal_range: '40 - 52', unit: '%', interpretation: 'NORMAL' },
          ]);
        } else {
          setTestResults([
            { test_name: 'Hasil Pemeriksaan Utama', result_value: 'Negatif', normal_range: 'Negatif', unit: '-', interpretation: 'NORMAL' },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil detail lab request.');
    }
  };

  const handleAddResultRow = () => {
    setTestResults([
      ...testResults,
      { test_name: '', result_value: '', normal_range: '', unit: '', interpretation: 'NORMAL' },
    ]);
  };

  const handleRemoveResultRow = (idx) => {
    setTestResults(testResults.filter((_, i) => i !== idx));
  };

  // Submit Results to Node.js Service
  const handleSubmitResults = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await apiNode.put(`/lab/results/${selectedRequest.id}`, {
        results: testResults,
      });
      if (res.data?.success) {
        setMessage(`Hasil laboratorium untuk ${selectedRequest.patient_name} berhasil disimpan dan diverifikasi.`);
        setSelectedRequest(null);
        fetchLabRequests();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal menyimpan hasil laboratorium.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger External Integration Webhook Test (Scenario D.5)
  const handleTestIntegration = async (simulateError = false) => {
    setCircuitResponse(null);
    try {
      const res = await apiNode.post('/lab/external-integration/webhook', {
        simulate_error: simulateError,
        payload: {
          device: 'Sysmex XN-550 Hematology Analyzer',
          timestamp: new Date().toISOString(),
          status: simulateError ? 'FAIL' : 'OK',
        },
      });
      setCircuitResponse(res.data);
    } catch (err) {
      setCircuitResponse(err.response?.data || { message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pemeriksaan Penunjang (Laboratorium)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Modul analis laboratorium dan integrasi data LIS eksternal dengan <span className="font-semibold text-blue-600">Circuit Breaker & Fallback Protocol (Skenario D.5)</span>.
          </p>
        </div>

        {/* Integration Test Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTestIntegration(false)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Uji transmisi normal ke LIS eksternal"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Test Integrasi LIS
          </button>
          <button
            onClick={() => handleTestIntegration(true)}
            className="bg-rose-700 hover:bg-rose-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Simulasikan gangguan jaringan eksternal untuk menguji Circuit Breaker D.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" /> Simulasi Error (D.5)
          </button>
        </div>
      </div>

      {/* LIS Connection Status Strip (Matching Penpot Laboratory Board) */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-emerald-900">LIS Status: Terhubung (Online)</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-800 font-medium">Sysmex XN-550 Hematology Analyzer (Ready, Sync setiap 30 detik)</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 bg-white px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
          Node.js Service :5000
        </span>
      </div>

      {/* Circuit Breaker Response Banner (If Triggered) */}
      {circuitResponse && (
        <div className={`p-4 rounded-xl text-xs border font-mono ${
          circuitResponse.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="font-bold flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4" /> Respon Integrasi Eksternal (Circuit Status: {circuitResponse.circuit_status}):
          </div>
          <p>{circuitResponse.message}</p>
          {circuitResponse.fallback_mechanism && (
            <p className="mt-1 font-semibold text-rose-700">{circuitResponse.fallback_mechanism}</p>
          )}
        </div>
      )}

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

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Daftar Permintaan Uji Laboratorium Rawat Jalan</h2>
          <span className="text-xs text-slate-500 font-semibold">{requests.length} Permintaan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">NO PERMINTAAN</th>
                <th className="py-3.5 px-5">PASIEN & NO RM</th>
                <th className="py-3.5 px-5">JENIS PEMERIKSAAN</th>
                <th className="py-3.5 px-5">INDIKASI KLINIS</th>
                <th className="py-3.5 px-5">DOKTER PENGIRIM</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Memuat data permintaan laboratorium...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Belum ada permintaan laboratorium terdaftar.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {req.request_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{req.patient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{req.mr_number}</div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {req.test_type}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 max-w-xs truncate">
                      {req.clinical_indication || '-'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {req.doctor_name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'COMPLETED' ? 'Selesai Diuji' : 'Menunggu Sampel'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleOpenResultModal(req)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                          req.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {req.status === 'COMPLETED' ? 'Lihat / Edit Hasil' : 'Input Hasil Lab'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input / View Results Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" /> Input Hasil Uji Laboratorium
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Pasien: <span className="font-semibold text-slate-800">{selectedRequest.patient_name}</span> ({selectedRequest.mr_number}) • No: <span className="font-mono font-medium">{selectedRequest.request_number}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResults} className="mt-4 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Rincian Parameter Uji Laboratorium:</span>
                <button
                  type="button"
                  onClick={handleAddResultRow}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Parameter
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {testResults.map((r, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl grid grid-cols-12 gap-2.5 items-center">
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nama Parameter</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Hemoglobin"
                        value={r.test_name}
                        onChange={(e) => {
                          const updated = [...testResults];
                          updated[idx].test_name = e.target.value;
                          setTestResults(updated);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nilai Hasil</label>
                      <input
                        type="text"
                        required
                        placeholder="Nilai"
                        value={r.result_value}
                        onChange={(e) => {
                          const updated = [...testResults];
                          updated[idx].result_value = e.target.value;
                          setTestResults(updated);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nilai Rujukan</label>
                      <input
                        type="text"
                        placeholder="Rujukan"
                        value={r.normal_range || ''}
                        onChange={(e) => {
                          const updated = [...testResults];
                          updated[idx].normal_range = e.target.value;
                          setTestResults(updated);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Satuan</label>
                      <input
                        type="text"
                        placeholder="Unit"
                        value={r.unit || ''}
                        onChange={(e) => {
                          const updated = [...testResults];
                          updated[idx].unit = e.target.value;
                          setTestResults(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-center focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Interpretasi</label>
                      <select
                        value={r.interpretation || 'NORMAL'}
                        onChange={(e) => {
                          const updated = [...testResults];
                          updated[idx].interpretation = e.target.value;
                          setTestResults(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="ABNORMAL_HIGH">TINGGI</option>
                        <option value="ABNORMAL_LOW">RENDAH</option>
                        <option value="CRITICAL">KRITIS</option>
                      </select>
                    </div>
                    <div className="col-span-1 text-center pt-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveResultRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  {isSubmitting ? 'Menyimpan...' : 'Verifikasi & Simpan Hasil Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
