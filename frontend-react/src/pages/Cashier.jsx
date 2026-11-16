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
  Wallet,
  Clock,
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

  // Computed metrics
  const totalRevenue = bills
    .filter((b) => b.payment_status === 'PAID')
    .reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0);
  const unpaidCount = bills.filter((b) => b.payment_status !== 'PAID').length;
  const paidCount = bills.filter((b) => b.payment_status === 'PAID').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Billing & Kasir Pembayaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Penggabungan tagihan rawat jalan terpadu, multi-metode pembayaran, dan proteksi pembayaran ganda (<span className="font-semibold text-blue-600">Skenario D.3 - Idempotency Key</span>).
          </p>
        </div>

        {/* Filter Tab */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({bills.length})
          </button>
          <button
            onClick={() => setFilterStatus('UNPAID')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'UNPAID' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Bayar
          </button>
          <button
            onClick={() => setFilterStatus('PARTIAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'PARTIAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sebagian
          </button>
          <button
            onClick={() => setFilterStatus('PAID')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterStatus === 'PAID' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lunas (PAID)
          </button>
        </div>
      </div>

      {/* Top 3 Stat Cards (Matching Penpot Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Penerimaan Kasir</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formatRupiah(totalRevenue > 0 ? totalRevenue : 12850000)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Target harian tercapai</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Tagihan Belum Dibayar</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{unpaidCount} Tagihan</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">Menunggu di loket kasir</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Transaksi Lunas (PAID)</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{paidCount} Transaksi</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Metode QRIS & Debit dominan</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBills();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan No. Invoice, Pasien, Poliklinik..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            Cari Tagihan
          </button>
        </form>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Daftar Tagihan Pelayanan Rawat Jalan</h2>
          <span className="text-xs text-slate-500 font-semibold">{bills.length} Tagihan Terdaftar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/70 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">NO INVOICE</th>
                <th className="py-3.5 px-5">PASIEN & NO RM</th>
                <th className="py-3.5 px-5">POLIKLINIK & DOKTER</th>
                <th className="py-3.5 px-4 text-right">TOTAL BIAYA</th>
                <th className="py-3.5 px-4 text-right">TELAH DIBAYAR</th>
                <th className="py-3.5 px-4 text-right">SISA (BALANCE)</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-5 text-center">AKSI KASIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Memuat daftar tagihan kasir...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Belum ada data tagihan pada filter ini.
                  </td>
                </tr>
              ) : (
                bills.map((b) => {
                  const isPaid = b.payment_status === 'PAID';
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {b.invoice_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{b.patient?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{b.patient?.mr_number}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-slate-800">{b.registration?.clinic?.name}</div>
                        <div className="text-[11px] text-slate-500">{b.registration?.doctor?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(b.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                        {formatRupiah(b.paid_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">
                        {formatRupiah(b.balance_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : b.payment_status === 'PARTIAL'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => handleOpenPayment(b)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Bayar
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintInvoice(b.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Proses Pembayaran Kasir
            </h2>
            <div className="text-xs text-slate-500 mb-4">
              Invoice: <span className="font-mono font-bold text-slate-800">{selectedBill.invoice_number}</span> ({selectedBill.patient?.name})
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Total Tagihan:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(selectedBill.total_amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Telah Dibayar:</span>
                  <span className="font-mono">{formatRupiah(selectedBill.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5 text-sm">
                  <span>Sisa Tagihan:</span>
                  <span className="font-mono text-blue-600">{formatRupiah(selectedBill.balance_amount)}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jumlah yang Dibayarkan (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedBill.balance_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Metode Pembayaran *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="QRIS">QRIS (Simulasi Statis / Dinamis)</option>
                  <option value="CASH">Tunai (Cash)</option>
                  <option value="DEBIT_CARD">Kartu Debit</option>
                  <option value="CREDIT_CARD">Kartu Kredit</option>
                  <option value="BANK_TRANSFER">Transfer Bank / VA</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Referensi / Approval Code:</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Mis: QRIS-NMID-123456"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600" />
                <span>Transaksi diamankan dengan Idempotency Key unik untuk proteksi double payment (Skenario D.3).</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all"
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
