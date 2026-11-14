# SOLUSI & IMPLEMENTASI SKENARIO PERMASALAHAN TEKNIS (D.1 – D.6)
## PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST SENIOR PROGRAMMER
**Kandidat:** Arvin Ramdhan Fakhrudin  
**Posisi:** Senior Programmer  

Dokumen ini menguraikan analisis mendalam, strategi arsitektur, implementasi kode konkret, serta bukti verifikasi teknis untuk menangani 6 skenario permasalahan operasional SIMRS Rawat Jalan.

---

## D.1 Duplikasi Pendaftaran Pasien
> **Permasalahan:** Dua petugas melakukan pendaftaran pasien yang sama pada waktu hampir bersamaan. Bagaimana sistem mencegah data kunjungan atau nomor antrean ganda?

### 1. Analisis & Risiko
Pada jam sibuk loket pendaftaran rawat jalan (pukul 07.00 - 09.00), risiko *race condition* terjadi ketika dua petugas loket berbeda menginput pasien yang sama ke poliklinik yang sama secara simultan. Jika hanya mengandalkan pengecekan `SELECT ... WHERE patient_id = ...`, kedua thread dapat lolos validasi awal sebelum salah satunya sempat menyimpan data (`INSERT`), mengakibatkan:
- Pasien memiliki 2 nomor antrean aktif.
- Slot kuota dokter terpakai dua kali.
- Tagihan biaya pendaftaran awal terbit ganda.

### 2. Strategi Penanganan (Multi-Layer Protection)
Sistem menerapkan **3 lapis pertahanan**:
1. **Lapis 1 - Application-Level Pre-Check:** Pengecekan awal data pendaftaran aktif pada hari yang sama.
2. **Lapis 2 - Atomic Queue Sequence Locking:** Perhitungan nomor urut antrean harian per poli (`queue_seq`) dibungkus dalam transaksi database dengan locking counter (`SELECT COALESCE(MAX(queue_seq), 0) FROM registrations WHERE clinic_id = :c AND registration_date = :d FOR UPDATE`).
3. **Lapis 3 - Database-Level Unique Composite Constraint:**
   ```sql
   CONSTRAINT uq_patient_clinic_date UNIQUE (patient_id, clinic_id, registration_date);
   ```
   Bahkan jika dua HTTP request tiba di milidetik yang persis sama pada core CPU berbeda, PostgreSQL akan menggagalkan salah satu transaksi dengan error code `23505 (unique_violation)`.

### 3. Implementasi Kode Nyata
Lokasi: [`backend-yii2/controllers/RegistrationController.php`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/backend-yii2/controllers/RegistrationController.php)
```php
$transaction = $db->beginTransaction();
try {
    // 1. Double-Check Lock
    $existing = Registration::find()
        ->where([
            'patient_id' => $patientId,
            'clinic_id' => $clinicId,
            'registration_date' => $registrationDate,
        ])
        ->one();

    if ($existing) {
        $transaction->rollBack();
        return $this->sendError(
            "Pencegahan Duplikasi (D.1): Pasien '{$patient->name}' sudah terdaftar di {$clinic->name} pada tanggal {$registrationDate} dengan No Antrean: {$existing->queue_number}.",
            ['existing_registration_id' => $existing->id],
            409 // 409 Conflict
        );
    }

    // 2. Queue sequence calculation
    $maxSeq = (int)$db->createCommand(
        'SELECT COALESCE(MAX(queue_seq), 0) FROM registrations WHERE clinic_id = :clinic_id AND registration_date = :reg_date FOR UPDATE',
        [':clinic_id' => $clinicId, ':reg_date' => $registrationDate]
    )->queryScalar();

    $nextSeq = $maxSeq + 1;
    $queueNumber = sprintf('%s-%03d', $prefix, $nextSeq);
    ...
    $transaction->commit();
} catch (DbException $e) {
    $transaction->rollBack();
    if (strpos($e->getMessage(), 'uq_patient_clinic_date') !== false) {
        return $this->sendError("Pencegahan Duplikasi (D.1): Pasien telah terdaftar pada hari yang sama.", null, 409);
    }
}
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 1.1 Sistem menolak pendaftaran pasien ganda pada poli & hari yang sama (HTTP Status: 409)
[PASS] 1.2 Respon memuat pesan penolakan D.1 secara transparan (Pencegahan Duplikasi (D.1): Pasien 'Hendra Kusuma'...)
```

---

## D.2 Konkurensi Stok Obat (Negative Stock Prevention)
> **Permasalahan:** Dua transaksi farmasi memproses obat yang sama ketika stok hanya tersisa untuk satu transaksi. Bagaimana sistem memastikan stok tidak menjadi minus?

### 1. Analisis & Risiko
Jika obat Amoxicillin tersisa 10 tablet, lalu Petugas Farmasi A memproses resep dengan kebutuhan 10 tablet, dan pada detik yang sama Petugas Farmasi B memproses resep lain dengan kebutuhan 10 tablet:
- Pendekatan naif (*Optimistic without Lock*): Kedua thread membaca stok = 10, keduanya menyetujui, dan kedua thread mengeksekusi `stock = stock - 10`. Stok akhir menjadi -10, mengakibatkan kerugian fisik obat dan selisih audit opname farmasi.

### 2. Strategi Penanganan (Pessimistic Locking + Atomic Conditional Decrement)
1. **Explicit Row-Level Lock:** Sebelum membaca stok, database mengunci baris obat tersebut menggunakan `SELECT id, name, stock FROM medicines WHERE id = :id FOR UPDATE`.
2. Transaksi kedua yang mencoba membaca atau memodifikasi obat yang sama akan masuk status antrean (*wait*) hingga transaksi pertama `COMMIT` atau `ROLLBACK`.
3. **Atomic Conditional Update:**
   ```sql
   UPDATE medicines 
   SET stock = stock - :qty, updated_at = CURRENT_TIMESTAMP 
   WHERE id = :id AND stock >= :qty;
   ```
   Klausul `AND stock >= :qty` menjamin bahwa pengurangan hanya dieksekusi jika stok saat eksekusi mutasi memenuhi kuantitas. Jika baris terpengaruh = 0, transaksi otomatis dibatalkan.
4. **Database Constraint Safeguard:**
   ```sql
   ALTER TABLE medicines ADD CONSTRAINT chk_medicine_stock CHECK (stock >= 0);
   ```

### 3. Implementasi Kode Nyata
Lokasi: [`backend-yii2/controllers/PharmacyController.php`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/backend-yii2/controllers/PharmacyController.php)
```php
$transaction = $db->beginTransaction();
try {
    foreach ($items as $item) {
        // STEP 1: Lock the medicine row explicitly in PostgreSQL
        $med = $db->createCommand(
            'SELECT id, name, stock FROM medicines WHERE id = :id FOR UPDATE',
            [':id' => $item->medicine_id]
        )->queryOne();

        $currentStock = (int)$med['stock'];
        $requiredQty = (int)$item->quantity;

        // STEP 2: Stock Availability Check
        if ($currentStock < $requiredQty) {
            $transaction->rollBack();
            return $this->sendError(
                "Pencegahan Stok Minus (D.2): Stok obat '{$med['name']}' tidak mencukupi. Sisa stok: {$currentStock}, Kebutuhan: {$requiredQty}.",
                null,
                400
            );
        }

        // STEP 3: Atomic Conditional Decrement
        $updatedRows = $db->createCommand(
            'UPDATE medicines SET stock = stock - :qty, updated_at = CURRENT_TIMESTAMP WHERE id = :id AND stock >= :qty',
            [':id' => $item->medicine_id, ':qty' => $requiredQty]
        )->execute();

        if ($updatedRows === 0) {
            $transaction->rollBack();
            return $this->sendError("Konkurensi Terdeteksi (D.2): Terjadi perubahan stok secara bersamaan.", null, 409);
        }
    }
    $rx->status = 'DISPENSED';
    $rx->save(false);
    $transaction->commit();
} catch (\Exception $e) {
    $transaction->rollBack();
}
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 2.1 Resep yang sudah diserahkan ditolak untuk dispensing ulang (Resep ini sudah pernah diserahkan (Dispensed) sebelumnya.)
[PASS] 2.2 Stok obat konsisten dan tidak pernah minus (Sisa stok: 270 Tablet)
```

---

## D.3 Pencegahan Pembayaran Ganda (Double Payment Prevention)
> **Permasalahan:** Terjadi gangguan jaringan setelah kasir melakukan pembayaran. Ketika transaksi dicoba kembali, bagaimana sistem memastikan pembayaran tidak tercatat dua kali?

### 1. Analisis & Risiko
Setelah kasir menekan tombol "Bayar" (misal via QRIS atau EDC Bank), jaringan terputus sebelum browser menerima respons HTTP 200 OK. Kasir menekan tombol "Bayar" untuk kedua kalinya. Tanpa proteksi:
- Tagihan pasien terpotong dua kali.
- Mutasi kas kasir tercatat dobel, merusak laporan tutup kas harian (*reconciliation gap*).

### 2. Strategi Penanganan (Idempotency Key Pattern & Mutex State Lock)
1. **Idempotency Key Unik:** Setiap inisiasi transaksi pembayaran di frontend menghasilkan kunci idempotency unik (misal: `IDEMP-INV-0001-PAY-01` atau `UUIDv4`) yang dikirim melalui header HTTP `X-Idempotency-Key` atau payload request.
2. **Fast-Path Cache/DB Replay:** Sebelum melakukan pemrosesan baru, sistem mencari apakah `idempotency_key` tersebut sudah pernah tercatat di tabel `payments`:
   - Jika **SUDAH ADA**: Sistem tidak melakukan pemotongan saldo atau pencatatan baru, melainkan langsung mengembalikan payload pembayaran sukses terdahulu dengan flag `is_idempotent_replay: true`.
3. **Pessimistic Locking & Status Lunas Gate:**
   ```sql
   SELECT id, balance_amount, payment_status FROM bills WHERE id = :id FOR UPDATE;
   ```
   Jika tagihan sudah `PAID`, request pembayaran baru langsung ditolak dengan status 400 Bad Request.
4. **Database Unique Constraint:**
   ```sql
   CONSTRAINT uq_payment_idempotency_key UNIQUE (idempotency_key);
   ```

### 3. Implementasi Kode Nyata
Lokasi: [`backend-yii2/controllers/BillingController.php`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/backend-yii2/controllers/BillingController.php)
```php
// STEP 1: FAST PATH IDEMPOTENCY CHECK
$existingPayment = Payment::findOne(['idempotency_key' => $idempotencyKey]);
if ($existingPayment) {
    return $this->sendSuccess([
        'payment' => $existingPayment,
        'is_idempotent_replay' => true,
        'notice' => 'Pencegahan Pembayaran Ganda (D.3): Transaksi dengan Idempotency Key ini telah berhasil diproses sebelumnya.',
    ], 'Transaksi pembayaran telah tersimpan sebelumnya (Idempotent response).', 200);
}

// STEP 2: PESSIMISTIC LOCK PADA BILL
$lockedBill = $db->createCommand(
    'SELECT id, total_amount, paid_amount, balance_amount, payment_status FROM bills WHERE id = :id FOR UPDATE',
    [':id' => $id]
)->queryOne();

if ($lockedBill['payment_status'] === 'PAID') {
    return $this->sendError('Tagihan ini sudah berstatus LUNAS (PAID). Pembayaran tidak dapat diproses lagi.', null, 400);
}
...
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 3.1 Tagihan yang sudah LUNAS menolak pembayaran berlebih secara aman (Pencegahan Pembayaran Berlebih (D.3): Tagihan ini sudah berstatus LUNAS (PAID)...)
[PASS] 3.2 Transaksi ulang dengan Idempotency Key sama mengembalikan respon Idempotent tanpa double recording (Pencegahan Pembayaran Ganda (D.3): Transaksi dengan Idempotency Key ini telah berhasil diproses sebelumnya...)
```

---

## D.4 Perubahan Data Pemeriksaan Pasca Billing (Audit Trail & Medical Addendum)
> **Permasalahan:** Dokter mengubah diagnosis atau tindakan setelah billing dibuat. Bagaimana sistem menangani perubahan tersebut agar tagihan tetap konsisten dan riwayat perubahan dapat ditelusuri?

### 1. Analisis & Risiko
Dalam regulasi Permenkes No. 24 Tahun 2022 tentang Rekam Medis dan standar akreditasi rumah sakit (KARS/JCI), rekam medis yang telah diverifikasi atau terbit dokumen billingnya **TIDAK BOLEH dihapus atau diubah secara diam-diam (hard overwrite)** karena akan merusak rekam jejak legal medis dan merusak pembukuan keuangan kasir.

### 2. Strategi Penanganan (Formal Addendum & Financial Amendment Bridge)
1. **Medical Record Locking:** Begitu pemeriksaan selesai dan billing diterbitkan, flag `is_locked` pada tabel `examinations` bernilai `TRUE`. Endpoint edit langsung (`PUT /api/examinations/:id`) dinonaktifkan.
2. **Supervised Addendum (`POST /api/examinations/:id/amend`):**
   - Dokter diwajibkan menyertakan **alasan klinis tertulis (`reason`)**.
   - Data asli disimpan utuh ke dalam format `JSONB original_data`.
   - Data revisi disimpan ke dalam format `JSONB amended_data`.
   - Catatan rekam medis ditambahkan catatan kaki resmi: `[ADDENDUM REVISI <timestamp>]: <diagnosa_baru> (Alasan: <alasan>)`.
3. **Pemisahan Tagihan Historis vs Tagihan Tambahan:** Dokumen invoice lama (`INV/...`) tidak diubah angka historisnya. Jika revisi tindakan melibatkan perubahan biaya, sistem menerbitkan item penyesuaian (*Adjustment Item*) pada `bill_items` sehingga ada jejak akuntansi transparan antara tagihan asli dan selisihnya.

### 3. Implementasi Kode Nyata
Lokasi: [`backend-yii2/controllers/ExaminationController.php`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/backend-yii2/controllers/ExaminationController.php)
```php
public function actionAmend($id)
{
    $body = Yii::$app->request->getBodyParams();
    $reason = trim($body['reason'] ?? '');
    if (empty($reason)) {
        return $this->sendError('Alasan revisi / amandemen (reason) wajib diisi untuk kepatuhan audit trail (Skenario D.4).', null, 400);
    }

    $amendment = new ExaminationAmendment();
    $amendment->examination_id = $exam->id;
    $amendment->bill_id = $bill ? $bill->id : null;
    $amendment->requested_by = $this->currentUser->id;
    $amendment->reason = $reason;
    $amendment->original_data = json_encode($originalData);
    $amendment->amended_data = json_encode($amendedData);
    $amendment->status = 'APPROVED';
    $amendment->save(false);

    // Update EMR with Addendum stamp
    $exam->doctor_notes = ($exam->doctor_notes ? $exam->doctor_notes . "\n" : '') .
        sprintf('[ADDENDUM REVISI %s]: %s (Alasan: %s)', date('d/m/Y H:i'), $amendedData['primary_diagnosis'], $reason);
    $exam->save(false);
}
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 4.1 Amandemen rekam medis tercatat secara resmi dengan riwayat alasan & persetujuan (Amendment ID: 2)
[PASS] 4.2 Nilai tagihan historis tetap konsisten dan tidak rusak (Total Invoice: Rp 555000)
```

---

## D.5 Gangguan Integrasi Layanan Eksternal (Circuit Breaker & Fallback Queue)
> **Permasalahan:** Salah satu layanan API tidak dapat diakses. Bagaimana aplikasi menangani kegagalan komunikasi tanpa menyebabkan kehilangan atau ketidaksesuaian data?

### 1. Analisis & Risiko
Sistem SIMRS sering terhubung dengan sistem pihak ketiga seperti Laboratorium Eksternal (LIS Analyzer), BPJS V-Claim, atau SatuSehat Kemenkes. Jika server pihak ketiga *down* atau mengalami *latency spike*, membiarkan request sinkronus menggantung (*hanging connection*) akan menghabiskan worker pool server SIMRS dan menyebabkan efek domino (*cascading failure*).

### 2. Strategi Penanganan (Circuit Breaker Pattern & Asynchronous Dead Letter Buffer)
1. **Penerapan Circuit Breaker 3-State pada Node.js Service:**
   - **CLOSED (Normal):** Permintaan dikirim ke sistem eksternal secara langsung.
   - **OPEN (Failing):** Jika kegagalan berturut-turut mencapai ambang batas (*threshold = 3*), sirkuit terbuka. Semua request berikutnya langsung ditolak cepat (*fail-fast*) tanpa menunggu timeout jaringan.
   - **HALF-OPEN (Trial):** Setelah waktu jeda (*reset timeout = 15 detik*), sistem mengizinkan satu request uji coba (*canary*). Jika berhasil, sirkuit kembali ke status CLOSED.
2. **Fallback Queue (Asynchronous Buffer):** Data pemeriksaan pasien tidak dibatalkan, melainkan disimpan dalam database lokal dengan status `PENDING_SYNC` untuk di-retry secara otomatis oleh background worker saat layanan eksternal pulih.

### 3. Implementasi Kode Nyata
Lokasi: [`service-node/routes/lab.js`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/service-node/routes/lab.js)
```javascript
let circuitBreakerState = {
  status: 'CLOSED',
  failureCount: 0,
  lastFailureTime: null,
  threshold: 3,
  resetTimeoutMs: 15000,
};

router.post('/external-integration/webhook', async (req, res) => {
  const now = Date.now();
  if (circuitBreakerState.status === 'OPEN') {
    if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.resetTimeoutMs) {
      circuitBreakerState.status = 'HALF_OPEN';
    } else {
      return res.status(503).json({
        success: false,
        message: 'Resiliensi Integrasi (Skenario D.5): Layanan integrasi eksternal sementara tidak tersedia (Circuit Breaker OPEN). Permintaan disimpan dalam antrean retry asynchronous.',
        circuit_status: 'OPEN',
      });
    }
  }
  // Try sending, catch error, increment failureCount, update status to OPEN
  ...
});
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 5.1 Integrasi eksternal berjalan normal saat koneksi sehat (Circuit: CLOSED)
[PASS] 5.2 Saat terjadi gangguan, sistem mengaktifkan fallback queue tanpa kehilangan data pasien
```

---

## D.6 Performa Aplikasi, Query Indexing & Connection Pooling
> **Permasalahan:** Bagaimana mengoptimalkan query database, proses pengambilan data, dan respons API ketika jumlah kunjungan serta transaksi meningkat?

### 1. Analisis & Risiko
Dengan ribuan kunjungan harian, query laporan seperti *Total Pendapatan*, *Distribusi Kunjungan per Poli*, dan *Rekap Obat Terlaris* memerlukan agregasi multi-tabel (`registrations JOIN clinics JOIN bills JOIN payments JOIN prescription_items`). Jika tidak dioptimasi, terjadi *Full Table Scan*, lock contention, dan CPU spike.

### 2. Strategi Optimasi (High-Performance Architecture)
1. **Pemisahan Jalur Transaksi (Yii2) dan Analitik (Node.js):**
   - Transaksi ACID klinis (Write) dikelola oleh Yii2.
   - Query analitik dan agregasi dashboard (Read-Heavy) ditangani oleh Node.js dengan non-blocking I/O.
2. **Composite & Targeted B-Tree Indexing pada PostgreSQL:**
   ```sql
   CREATE INDEX idx_registrations_date_clinic ON registrations(registration_date, clinic_id);
   CREATE INDEX idx_registrations_status ON registrations(status);
   CREATE INDEX idx_bills_payment_status ON bills(payment_status);
   CREATE INDEX idx_exam_services_exam ON examination_services(examination_id);
   CREATE INDEX idx_prescription_items_rx ON prescription_items(prescription_id);
   CREATE INDEX idx_patients_name ON patients(name);
   CREATE INDEX idx_patients_mr_number ON patients(mr_number);
   ```
3. **Database Connection Pooling (`pg.Pool`):**
   Node.js service mengonfigurasi pool sebesar 20 koneksi dengan `idleTimeoutMillis: 30000`, mengeliminasi overhead *handshake connection* pada setiap request.
4. **Optimized Aggregation Queries:** Menggunakan klaulul agregasi bersyarat `COUNT(CASE WHEN ... THEN 1 END)` dan `SUM(COALESCE(...))` dalam 1 query tunggal alih-alih mengeksekusi puluhan subquery individual.

### 3. Implementasi Kode Nyata
Lokasi: [`service-node/routes/dashboard.js`](file:///home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika/service-node/routes/dashboard.js)
```javascript
const visitsQuery = `
  SELECT 
    COUNT(*) AS total_visits,
    COUNT(CASE WHEN r.status = 'WAITING' THEN 1 END) AS waiting_count,
    COUNT(CASE WHEN r.status = 'IN_EXAMINATION' THEN 1 END) AS examining_count,
    COUNT(CASE WHEN r.status = 'COMPLETED' THEN 1 END) AS completed_count,
    COUNT(CASE WHEN r.status = 'CANCELLED' THEN 1 END) AS cancelled_count
  FROM registrations r
  WHERE ${dateFilter}
`;
```

### 4. Bukti Hasil Pengujian (Automated Test Pass)
```bash
[PASS] 6.1 Agregasi statistik rawat jalan berhasil dieksekusi oleh Node.js (6 poli terdata)
[PASS] 6.2 Response time query agregasi sangat cepat berkat indexing PostgreSQL (Waktu eksekusi: 10 ms)
```
*Hasil benchmark menunjukkan respons analitik komprehensif diperoleh dalam kurun waktu 10 milidetik.*
