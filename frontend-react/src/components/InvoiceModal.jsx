import React from 'react';
import { Printer, X, CheckCircle, Clock } from 'lucide-react';

export default function InvoiceModal({ invoiceData, onClose }) {
  if (!invoiceData) return null;

  const { hospital, invoice, patient, registration, items, payments } = invoiceData;

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <span className="font-semibold text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-sky-400" /> Pratinjau Invoice & Bukti Pembayaran Resmi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-invoice" className="p-8 bg-white text-slate-800 text-xs font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{hospital?.name || 'RS INOVA MEDIKA SOLUSINDO'}</h1>
              <p className="text-slate-600 text-[11px] mt-0.5">{hospital?.address}</p>
              <p className="text-slate-600 text-[11px]">Telp: {hospital?.phone} | Email: {hospital?.email}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                invoice?.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {invoice?.payment_status === 'PAID' ? 'LUNAS (PAID)' : 'BELUM LUNAS'}
              </span>
              <div className="mt-1 font-mono font-bold text-slate-900 text-sm">{invoice?.invoice_number}</div>
              <div className="text-[11px] text-slate-500">{new Date(invoice?.created_at).toLocaleString('id-ID')}</div>
            </div>
          </div>

          {/* Patient & Clinic Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 text-[11px]">
            <div>
              <div className="text-slate-500 font-semibold">IDENTITAS PASIEN:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{patient?.name}</div>
              <div>No. Rekam Medis: <span className="font-mono font-semibold text-sky-700">{patient?.mr_number}</span></div>
              <div>NIK: {patient?.nik} | Gender: {patient?.gender}</div>
              <div>Alamat: {patient?.address}</div>
            </div>
            <div>
              <div className="text-slate-500 font-semibold">PELAYANAN KUNJUNGAN:</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">{registration?.clinic_name}</div>
              <div>Dokter: {registration?.doctor_name}</div>
              <div>No. Antrean: <span className="font-mono font-bold text-indigo-700">{registration?.queue_number}</span></div>
              <div>Penjamin: <span className="font-semibold">{registration?.payment_type}</span></div>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-600 bg-slate-100">
                <th className="py-1.5 px-2">KATEGORI</th>
                <th className="py-1.5 px-2">RINCIAN LAYANAN / ITEM</th>
                <th className="py-1.5 px-2 text-center">QTY</th>
                <th className="py-1.5 px-2 text-right">TARIF</th>
                <th className="py-1.5 px-2 text-right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 px-2 font-semibold text-slate-500 text-[10px]">{item.type}</td>
                  <td className="py-1.5 px-2 text-slate-800">{item.name}</td>
                  <td className="py-1.5 px-2 text-center">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{formatRupiah(item.unit_price)}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-semibold text-slate-900">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Summary */}
          <div className="border-t-2 border-slate-900 pt-3 flex justify-end">
            <div className="w-64 space-y-1 text-[11px]">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-600">Total Biaya Pelayanan:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{formatRupiah(invoice?.total_amount)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-emerald-700 font-semibold">
                <span>Total Telah Dibayar:</span>
                <span className="font-mono">{formatRupiah(invoice?.paid_amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-300 font-bold text-slate-900 text-sm">
                <span>Sisa Tagihan (Balance):</span>
                <span className="font-mono text-sky-800">{formatRupiah(invoice?.balance_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {payments && payments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Riwayat Transaksi Kasir:
              </div>
              <div className="space-y-1">
                {payments.map((p, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 rounded text-[10px] flex justify-between border border-slate-200">
                    <div>
                      <span className="font-mono font-bold">{p.payment_number}</span> ({p.payment_method}) - Kasir: {p.cashier}
                      <div className="text-slate-500">Ref: {p.reference || '-'} | Idempotency Key: {p.idempotency_key}</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-700 text-xs">
                      {formatRupiah(p.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature & Disclaimer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p>Struk ini merupakan bukti pembayaran sah RS Inova Medika Solusindo.</p>
              <p>Dicetak secara digital oleh sistem SIMRS Terpadu.</p>
            </div>
            <div className="text-center w-40">
              <p>Petugas Kasir,</p>
              <div className="h-12"></div>
              <p className="font-bold text-slate-800 border-t border-slate-400 pt-1">
                {payments?.[0]?.cashier || 'Petugas Kasir'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
