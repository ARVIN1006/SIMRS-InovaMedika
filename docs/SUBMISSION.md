# SUBMISSION LETTER / FORMAT PENGUMPULAN REAL CASE TEST
## PT INOVA MEDIKA SOLUSINDO

**Kepada Yth.**  
Tim Rekrutmen & Tim Teknis  
**PT Inova Medika Solusindo**  
Email Tujuan: `inovamedika.career@gmail.com`  

**Format Subjek Email:**  
`Senior Programmer_Pengumpulan Real Case Test_Arvin Ramdhan Fakhrudin`

---

### Lampiran Isi Email:

**Yth. Tim Rekrutmen PT Inova Medika Solusindo,**

Perkenalkan, saya **Arvin Ramdhan Fakhrudin**, kandidat pelamar posisi **Senior Programmer**. Bersama dengan email ini, saya menyampaikan hasil pengerjaan studi kasus teknis:

**"Pengembangan Sistem Informasi Manajemen Rumah Sakit (SIMRS) - Pelayanan Rawat Jalan Terintegrasi"**

Solusi ini dikembangkan secara penuh (*end-to-end*) sesuai dengan arsitektur teknologi yang disyaratkan:
1. **Frontend Application:** React.js (Vite + Tailwind CSS + Lucide Icons).
2. **Backend Utama / SIMRS Business Logic:** Yii 2.0 (PHP 8.5) RESTful API dengan isolasi transaksi ACID dan Pessimistic Locking.
3. **Backend Services & API:** Node.js Express (v22) untuk Pemeriksaan Penunjang (Laboratorium), Analitik Agregasi Kinerja, dan Proteksi Circuit Breaker.
4. **Database:** PostgreSQL 16+ dengan 19 tabel terstruktur, constraint unik, check stok, dan B-Tree indexing.
5. **API Testing & Verification:** Postman Collection JSON lengkap dengan pengujian 100% lulus untuk skenario konkurensi teknis (D.1 hingga D.6).
6. **Containerization & Deployment:** Docker Compose untuk inisialisasi satu perintah (`docker compose up --build -d`).

---

### Ringkasan Output Deliverables:

| Kategori Deliverable | Lokasi File / Direktori | Keterangan |
| :--- | :--- | :--- |
| **Source Code Backend Utama (Yii2)** | `backend-yii2/` | CRUD Master, Pendaftaran, RME, Tindakan, Farmasi, Billing |
| **Source Code Services (Node.js)** | `service-node/` | API Lab, Analytics, Webhook Eksternal, Circuit Breaker |
| **Source Code Frontend (React)** | `frontend-react/` | Modern Outpatient Dashboard, Role Switcher, Cetak Struk |
| **Database Schema & Seeder** | `database/schema.sql`<br>`database/seeds.sql` | DDL 19 Tabel, Foreign Keys, Unique Indexes, Dummy Data Lengkap |
| **Entity Relationship Diagram (ERD)** | `docs/ERD.md` | Diagram relasi entitas Mermaid & Data Dictionary |
| **Diagram & Dokumen Arsitektur** | `docs/ARCHITECTURE.md` | Alur komunikasi React, Yii2, Node.js, Postgres |
| **Solusi Skenario Teknis (D.1 - D.6)** | `docs/TECHNICAL_SCENARIOS.md` | Analisis mendalam & implementasi konkret 6 skenario |
| **Dokumentasi REST API** | `docs/API_DOCUMENTATION.md` | Spesifikasi lengkap seluruh endpoint Yii2 & Node.js |
| **Postman API Collection** | `postman/SIMRS_Inova_Medika.postman_collection.json` | 8 Modul pengujian terstruktur siap impor |
| **Automated Test Suite (100% Pass)** | `tests/verify_scenarios.js`<br>`test_full_crud_manual.py` | 15 Test kasus skenario D.1 - D.6 & 26 Test kasus CRUD End-to-End (100% Pass) |
| **Panduan Instalasi & Quickstart** | `docs/INSTALLATION_GUIDE.md`<br>`README.md` | Panduan Docker Compose & Local Development |

---

### Ikhtisar Penanganan Skenario Teknis (Section D):
- **D.1 Duplikasi Pendaftaran:** Database composite unique constraint `(patient_id, clinic_id, registration_date)` + locking `SELECT MAX(queue_seq) FOR UPDATE` (Menolak pendaftaran duplikat dengan HTTP 409 Conflict).
- **D.2 Konkurensi Stok Obat:** Pessimistic row locking `SELECT stock FROM medicines WHERE id = :id FOR UPDATE` + atomic conditional decrement `UPDATE ... WHERE stock >= :qty` + database constraint `CHECK (stock >= 0)`.
- **D.3 Pencegahan Pembayaran Ganda:** Pola Idempotency Key unik per transaksi kasir (`X-Idempotency-Key`) + pengecekan status LUNAS dalam transaksi (Menjamin tidak ada mutasi kas berlebih atau pencatatan dobel).
- **D.4 Perubahan Data Pemeriksaan Pasca Billing:** Medical record locking (`is_locked = TRUE`) dipadukan dengan modul formal Amandemen / Addendum Klinis (`examination_amendments`) dan audit trail JSONB tanpa merusak tagihan historis.
- **D.5 Gangguan Integrasi Eksternal:** Implementasi arsitektur **Circuit Breaker** (Closed, Open, Half-Open) pada Node.js service dengan Dead Letter Buffer asynchronous sehingga data pasien tidak pernah hilang saat sistem eksternal mengalami gangguan.
- **D.6 Optimasi Performa:** Pemisahan *Write-Heavy Core* (Yii2) dan *Read-Heavy Analytics* (Node.js) + targeted B-Tree indexing pada foreign keys & tanggal kunjungan + database connection pooling (waktu eksekusi agregasi analitik: **< 15 milidetik**).

---

### Cara Cepat Menjalankan Aplikasi (Evaluasi):
```bash
# 1. Jalankan semua container
docker compose up --build -d

# 2. Buka aplikasi web di browser
# http://localhost:3000

# 3. Jalankan pengujian otomatis skenario D.1 - D.6 & CRUD End-to-End (26/26 Pass)
node tests/verify_scenarios.js
python3 test_full_crud_manual.py
```

Demikian berkas pengerjaan ini saya sampaikan dengan penuh tanggung jawab. Besar harapan saya untuk dapat mempresentasikan dan mendiskusikan arsitektur sistem ini pada tahap wawancara teknis selanjutnya.

Atas perhatian dan kesempatan yang diberikan, saya ucapkan terima kasih.

Hormat saya,  
**Arvin Ramdhan Fakhrudin**  
No. HP / WhatsApp: +62 821-2766-6523  
Email: arvin.dev.business@gmail.com  
LinkedIn: https://www.linkedin.com/in/arvin-ramdhan-fakhrudin  
GitHub: https://github.com/ARVIN1006  
Bandung, Jawa Barat
