import React, { useState, useEffect } from 'react';
import { apiYii } from '../api';
import {
  Receipt,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Printer,
  DollarSign,
  ShieldCheck,
  Search,
} from 'lucide-react';
import InvoiceModal from '../components/InvoiceModal';

export default function Cashier() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Payment Form Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [paymentReference, setPaymentReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      let url = '/bills';
      const params = [];
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await apiYii.get(url);
      setBills(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat daftar tagihan kasir.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [filterStatus]);

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.balance_amount || bill.total_amount);
    setPaymentReference(`REF-${Date.now().toString().slice(-6)}`);
    setShowPaymentModal(true);
  };

  // Process Payment with Idempotency Key (Scenario D.3)
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    setIsProcessing(true);
    setMessage(null);
    setError(null);

    // Generate unique idempotency key for this payment attempt
    const idempotencyKey = `IDEMP-${selectedBill.invoice_number.replace(/\//g, '-')}-${Date.now()}`;

    try {
      const res = await apiYii.post(
        `/bills/${selectedBill.id}/pay`,
        {
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          idempotency_key: idempotencyKey,
        },
        {
          headers: {
            'X-Idempotency-Key': idempotencyKey,
          },
        }
      );

      if (res.data?.success) {
        setMessage(`Pembayaran berhasil diproses! Status tagihan saat ini: ${res.data.data.payment_status}`);
        setShowPaymentModal(false);
        fetchBills();
        // Load invoice modal
        handlePrintInvoice(selectedBill.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memproses pembayaran kasir.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Full Printable Invoice
  const handlePrintInvoice = async (billId) => {
    try {
      const res = await apiYii.get(`/bills/${billId}/invoice`);
      if (res.data?.success) {
        setInvoiceData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil detail invoice.');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Kasir Pembayaran</h1>
          <p className="text-sm text-slate-500 mt-1">
            Penggabungan tagihan rawat jalan terpadu, multi-metode pembayaran, dan proteksi pembayaran ganda (<span className="font-semibold text-teal-600">Skenario D.3 - Idempotency Key</span>).
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === '' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-600'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('UNPAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === 'UNPAID' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-600'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setFilterStatus('PARTIAL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === 'PARTIAL' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-600'
            }`}
          >
            Sebagian
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              filterStatus === 'PAID' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-600'
            }`}
          >
            Lunas (PAID)
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

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-extrabold text-slate-900">Daftar Tagihan Pelayanan Rawat Jalan</h2>
          <span className="text-xs text-slate-500 font-semibold">{bills.length} Tagihan Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NO INVOICE</th>
                <th className="py-3 px-4">PASIEN & NO RM</th>
                <th className="py-3 px-4">POLIKLINIK & DOKTER</th>
                <th className="py-3 px-4 text-right">TOTAL BIAYA</th>
                <th className="py-3 px-4 text-right">TELAH DIBAYAR</th>
                <th className="py-3 px-4 text-right">SISA (BALANCE)</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-center">AKSI KASIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Memuat daftar tagihan...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Belum ada tagihan pada filter ini.
                  </td>
                </tr>
              ) : (
                bills.map((b) => {
                  const isPaid = b.payment_status === 'PAID';
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                        {b.invoice_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.patient?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{b.patient?.mr_number}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{b.registration?.clinic?.name}</div>
                        <div className="text-[11px] text-slate-500">{b.registration?.doctor?.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(b.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                        {formatRupiah(b.paid_amount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sky-800">
                        {formatRupiah(b.balance_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          b.payment_status === 'PARTIAL' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => handleOpenPayment(b)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Bayar
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintInvoice(b.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm"
                            title="Cetak Invoice / Struk Pembayaran"
                          >
                            <Printer className="w-3.5 h-3.5" /> Struk
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" /> Proses Pembayaran Kasir
            </h2>
            <div className="text-xs text-slate-500 mb-4">
              Invoice: <span className="font-mono font-bold text-slate-800">{selectedBill.invoice_number}</span> ({selectedBill.patient?.name})
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total Tagihan:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(selectedBill.total_amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Telah Dibayar:</span>
                  <span className="font-mono">{formatRupiah(selectedBill.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-sm">
                  <span>Sisa Tagihan:</span>
                  <span className="font-mono text-sky-800">{formatRupiah(selectedBill.balance_amount)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah yang Dibayarkan (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedBill.balance_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-base text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Metode Pembayaran *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                >
                  <option value="QRIS">QRIS (Simulasi Statis / Dinamis)</option>
                  <option value="CASH">Tunai (Cash)</option>
                  <option value="DEBIT_CARD">Kartu Debit</option>
                  <option value="CREDIT_CARD">Kartu Kredit</option>
                  <option value="BANK_TRANSFER">Transfer Bank / VA</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Referensi / Approval Code:</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                  placeholder="Mis: QRIS-NMID-123456"
                />
              </div>

              <div className="bg-sky-50 border border-sky-200 p-2.5 rounded text-[11px] text-sky-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600" />
                <span>Transaksi diamankan dengan Idempotency Key unik untuk mencegah pembayaran ganda (Skenario D.3).</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      {invoiceData && (
        <InvoiceModal invoiceData={invoiceData} onClose={() => setInvoiceData(null)} />
      )}
    </div>
  );
}
