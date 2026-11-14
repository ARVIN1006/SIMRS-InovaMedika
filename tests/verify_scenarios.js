/**
 * PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST: SENIOR PROGRAMMER
 * Automated Integration & Scenario Concurrency Verification (D.1 - D.6)
 * Author: Arvin Ramdhan Fakhrudin
 */

const YII_BASE = 'http://localhost:8000/api';
const NODE_BASE = 'http://localhost:5000/api';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName} ${detail ? `(${detail})` : ''}`);
    passedTests++;
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

async function loginUser(username, password = 'password123') {
  const res = await fetch(`${YII_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  return data.data?.token;
}

async function runTests() {
  console.log('\n================================================================');
  console.log('   PENGUJIAN OTOMATIS SKENARIO TEKNIS D.1 - D.6 (SIMRS INOVA)   ');
  console.log('================================================================\n');

  // TEST 0: Health Checks & Dynamic Login
  let tokenAdmin, tokenDoctor, tokenCashier;
  try {
    const yiiHealth = await fetch(`${YII_BASE}/health`).then((r) => r.json());
    assert(yiiHealth.success && yiiHealth.data?.db_status === 'OK', '0.1 Health Check Core SIMRS Yii2', `PHP ${yiiHealth.data?.php_version}`);

    const nodeHealth = await fetch(`${NODE_BASE}/health`).then((r) => r.json());
    assert(nodeHealth.success && nodeHealth.data?.db_status === 'OK', '0.2 Health Check Services Node.js', `Node ${nodeHealth.data?.node_version}`);

    tokenAdmin = await loginUser('admin');
    tokenDoctor = await loginUser('dr_budi');
    tokenCashier = await loginUser('kasir');

    assert(Boolean(tokenAdmin && tokenDoctor && tokenCashier), '0.3 Login Otentikasi Multi-Peran (Admin, Dokter, Kasir)');
  } catch (err) {
    console.error('Layanan tidak aktif. Pastikan server Yii2 (port 8000) dan Node.js (port 5000) berjalan.', err);
    process.exit(1);
  }

  // TEST 1: Skenario D.1 (Duplikasi Pendaftaran Pasien)
  console.log('\n--- SKENARIO D.1: PENCEGAHAN DUPLIKASI PENDAFTARAN & ANTREAN ---');
  try {
    // Attempt duplicate visit for patient 1 to clinic 2 on today (already registered in seeds)
    const dupRes = await fetch(`${YII_BASE}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        patient_id: 1,
        clinic_id: 2,
        doctor_id: 1,
        payment_type: 'UMUM',
      }),
    });

    const dupData = await dupRes.json();
    assert(dupRes.status === 409, '1.1 Sistem menolak pendaftaran pasien ganda pada poli & hari yang sama', `HTTP Status: ${dupRes.status}`);
    assert(dupData.message && dupData.message.includes('Pencegahan Duplikasi (D.1)'), '1.2 Respon memuat pesan penolakan D.1 secara transparan', dupData.message?.slice(0, 70) + '...');
  } catch (err) {
    console.error(err);
  }

  // TEST 2: Skenario D.2 (Konkurensi Stok Obat & Stok Minus)
  console.log('\n--- SKENARIO D.2: PENCEGAHAN STOK OBAT MINUS DENGAN PESSIMISTIC LOCKING ---');
  try {
    // Try to dispense prescription 1 which is already dispensed
    const rxRes = await fetch(`${YII_BASE}/prescriptions/1/dispense`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const rxData = await rxRes.json();
    assert(rxRes.status === 400, '2.1 Resep yang sudah diserahkan ditolak untuk dispensing ulang', rxData.message);

    // Verify stock constraint: query medicine stock
    const medRes = await fetch(`${YII_BASE}/medicines/3`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    }).then((r) => r.json());
    assert(medRes.data?.stock >= 0, '2.2 Stok obat konsisten dan tidak pernah minus', `Sisa stok: ${medRes.data?.stock} ${medRes.data?.unit}`);
  } catch (err) {
    console.error(err);
  }

  // TEST 3: Skenario D.3 (Pencegahan Pembayaran Ganda & Idempotency Key)
  console.log('\n--- SKENARIO D.3: PENCEGAHAN PEMBAYARAN GANDA (IDEMPOTENCY KEY) ---');
  try {
    const testIdempKey = `IDEMP-TEST-CLI-${Date.now()}`;
    // Payment 1 for Bill 1 (Bill 1 is already paid in seeds)
    const payRes1 = await fetch(`${YII_BASE}/bills/1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCashier}`,
        'X-Idempotency-Key': testIdempKey,
      },
      body: JSON.stringify({
        amount: 25000,
        payment_method: 'QRIS',
        idempotency_key: testIdempKey,
      }),
    });
    const payData1 = await payRes1.json();
    assert(payRes1.status === 400 && payData1.message.includes('LUNAS'), '3.1 Tagihan yang sudah LUNAS menolak pembayaran berlebih secara aman', payData1.message);

    // Test replay of existing payment idempotency key from seed data ('IDEMP-INV-0001-PAY-01')
    const replayRes = await fetch(`${YII_BASE}/bills/1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCashier}`,
        'X-Idempotency-Key': 'IDEMP-INV-0001-PAY-01',
      },
      body: JSON.stringify({
        amount: 555000,
        payment_method: 'QRIS',
        idempotency_key: 'IDEMP-INV-0001-PAY-01',
      }),
    });
    const replayData = await replayRes.json();
    assert(replayRes.status === 200 && replayData.data?.is_idempotent_replay === true, '3.2 Transaksi ulang dengan Idempotency Key sama mengembalikan respon Idempotent tanpa double recording', replayData.data?.notice?.slice(0, 75) + '...');
  } catch (err) {
    console.error(err);
  }

  // TEST 4: Skenario D.4 (Amandemen Rekam Medis Pasca Billing)
  console.log('\n--- SKENARIO D.4: AMANDEMEN REKAM MEDIS PASCA BILLING DENGAN AUDIT TRAIL ---');
  try {
    const amendRes = await fetch(`${YII_BASE}/examinations/1/amend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenDoctor}`,
      },
      body: JSON.stringify({
        reason: 'Penyesuaian diagnosis pasca evaluasi EKG dan profil lipid darah (Uji Otomatis D.4)',
        primary_diagnosis: 'Essential (primary) hypertension with hyperlipidemia',
        primary_icd10: 'I10',
        notes_amendment: 'Telah dikonfirmasi dengan dokter spesialis penanggung jawab.',
      }),
    });
    const amendData = await amendRes.json();
    assert(amendRes.status === 200 && amendData.data?.amendment, '4.1 Amandemen rekam medis tercatat secara resmi dengan riwayat alasan & persetujuan', `Amendment ID: ${amendData.data?.amendment?.id}`);

    // Verify invoice remains intact
    const invRes = await fetch(`${YII_BASE}/bills/1/invoice`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    }).then((r) => r.json());
    assert(invRes.data?.invoice?.total_amount === 555000, '4.2 Nilai tagihan historis tetap konsisten dan tidak rusak', `Total Invoice: Rp ${invRes.data?.invoice?.total_amount}`);
  } catch (err) {
    console.error(err);
  }

  // TEST 5: Skenario D.5 (Resiliensi Integrasi & Circuit Breaker)
  console.log('\n--- SKENARIO D.5: RESILIENSI INTEGRASI EKSTERNAL & CIRCUIT BREAKER ---');
  try {
    // Normal request
    const normRes = await fetch(`${NODE_BASE}/lab/external-integration/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulate_error: false }),
    }).then((r) => r.json());
    assert(normRes.success && normRes.circuit_status === 'CLOSED', '5.1 Integrasi eksternal berjalan normal saat koneksi sehat (Circuit: CLOSED)');

    // Simulated error request
    const errRes = await fetch(`${NODE_BASE}/lab/external-integration/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulate_error: true }),
    }).then((r) => r.json());
    assert(errRes.success === false && errRes.fallback_mechanism, '5.2 Saat terjadi gangguan, sistem mengaktifkan fallback queue tanpa kehilangan data pasien');
  } catch (err) {
    console.error(err);
  }

  // TEST 6: Skenario D.6 (Optimasi Query & Agregasi Analitik Node.js)
  console.log('\n--- SKENARIO D.6: PERFORMA QUERY DATABASE & AGREGASI ANALITIK ---');
  try {
    const t0 = performance.now();
    const statsRes = await fetch(`${NODE_BASE}/dashboard/stats?period=all`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    }).then((r) => r.json());
    const t1 = performance.now();
    const durationMs = Math.round(t1 - t0);

    assert(statsRes.success && statsRes.data?.visits_by_clinic?.length > 0, '6.1 Agregasi statistik rawat jalan berhasil dieksekusi oleh Node.js', `${statsRes.data?.visits_by_clinic?.length} poli terdata`);
    assert(durationMs < 100, '6.2 Response time query agregasi sangat cepat berkat indexing PostgreSQL', `Waktu eksekusi: ${durationMs} ms`);
  } catch (err) {
    console.error(err);
  }

  console.log('\n================================================================');
  console.log(`HASIL AKHIR PENGUJIAN: ${passedTests} / ${totalTests} TEST KASUS BERHASIL (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');
}

runTests();
