# SIMRS RAWAT JALAN TERINTEGRASI
## PT INOVA MEDIKA SOLUSINDO – REAL CASE TEST: SENIOR PROGRAMMER

Aplikasi Sistem Informasi Manajemen Rumah Sakit (SIMRS) komprehensif untuk mengelola siklus pelayanan rawat jalan pasien secara *end-to-end*, mulai dari pendaftaran kunjungan, antrean poliklinik, rekam medis elektronik (RME), tindakan medis, e-resep farmasi, pemeriksaan penunjang laboratorium, hingga billing dan kasir terpadu.

Dikembangkan oleh: **Arvin Ramdhan Fakhrudin**  
Posisi: **Senior Programmer**  
Target Evaluasi: **PT Inova Medika Solusindo** (`inovamedika.career@gmail.com`)  

---

## 🛠️ Arsitektur Teknologi (Mandated Tech Stack)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND APPLICATION: React.js (Vite)                │
│                   Port: 3000 | Tailwind CSS + Lucide Icons             │
│        (Role-based UI, Interactive Queue, Printable Invoice/Struk)     │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌───────────────────────────────────┐┌───────────────────────────────────┐
│   BACKEND UTAMA / CORE SIMRS      ││      BACKEND SERVICES / API       │
│         Yii 2.0 (PHP 8.5)         ││       Node.js Express (v22)       │
│             Port: 8000            ││             Port: 5000            │
│  • Master Data & Pasien (No. RM)  ││  • Pemeriksaan Penunjang (Lab)   │
│  • Antrean Poliklinik (Poli Umum) ││  • Dashboard Analytics Real-time │
│  • RME, Diagnosa ICD-10, Tindakan ││  • Circuit Breaker (Skenario D.5)│
│  • Resep & Stok (Pessimistic Lock)││  • High-Throughput Aggregations  │
│  • Billing & Payment (Idempotency)││  • Interactive Docs (/api/docs)   │
└─────────────────┬─────────────────┘└─────────────────┬─────────────────┘
                  │                                    │
                  └─────────────────┬──────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATABASE: PostgreSQL 16 / 18                       │
│                             Port: 5432                                 │
│        19 Relational Tables | ACID Transactions | FOR UPDATE Locks     │
│        Composite Unique Constraints | Row-Level Indexing | JSONB Logs  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Jalankan dalam 1 Perintah)

### Menggunakan Docker Compose (Direkomendasikan)
```bash
# Clone atau masuk ke direktori proyek
cd /home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika

# Jalankan semua container secara otomatis
docker compose up --build -d
```

### Akses Layanan:
- **Aplikasi Web SIMRS (React):** [http://localhost:3000](http://localhost:3000)
- **Core SIMRS API (Yii2):** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Services & Lab API (Node.js):** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Dokumentasi Interaktif API:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 🧪 Pengujian Otomatis Skenario Teknis D.1 – D.6

Sistem dilengkapi suite pengujian otomatis (*automated integration test suite*) yang memverifikasi 100% penanganan skenario konkurensi:

```bash
node tests/verify_scenarios.js
```

### Ringkasan Hasil Uji:
```text
================================================================
   PENGUJIAN OTOMATIS SKENARIO TEKNIS D.1 - D.6 (SIMRS INOVA)   
================================================================
[PASS] 0.1 Health Check Core SIMRS Yii2 (PHP 8.5.4)
[PASS] 0.2 Health Check Services Node.js (Node v22.23.4)
[PASS] 0.3 Login Otentikasi Multi-Peran (Admin, Dokter, Kasir)
[PASS] 1.1 Sistem menolak pendaftaran pasien ganda pada poli & hari yang sama (HTTP Status: 409)
[PASS] 1.2 Respon memuat pesan penolakan D.1 secara transparan
[PASS] 2.1 Resep yang sudah diserahkan ditolak untuk dispensing ulang
[PASS] 2.2 Stok obat konsisten dan tidak pernah minus
[PASS] 3.1 Tagihan yang sudah LUNAS menolak pembayaran berlebih secara aman
[PASS] 3.2 Transaksi ulang dengan Idempotency Key sama mengembalikan respon Idempotent tanpa double recording
[PASS] 4.1 Amandemen rekam medis tercatat secara resmi dengan riwayat alasan & persetujuan
[PASS] 4.2 Nilai tagihan historis tetap konsisten dan tidak rusak
[PASS] 5.1 Integrasi eksternal berjalan normal saat koneksi sehat (Circuit: CLOSED)
[PASS] 5.2 Saat terjadi gangguan, sistem mengaktifkan fallback queue tanpa kehilangan data pasien
[PASS] 6.1 Agregasi statistik rawat jalan berhasil dieksekusi oleh Node.js (6 poli terdata)
[PASS] 6.2 Response time query agregasi sangat cepat berkat indexing PostgreSQL (Waktu eksekusi: 10 ms)
================================================================
HASIL AKHIR PENGUJIAN: 15 / 15 TEST KASUS BERHASIL (100%)
================================================================
```

---

## 🎯 Solusi Skenario Permasalahan Teknis (Section D)

| Skenario | Permasalahan Teknis | Solusi Arsitektur & Implementasi | Referensi Kode |
| :--- | :--- | :--- | :--- |
| **D.1** | **Duplikasi Pendaftaran** (Dua petugas mendaftarkan pasien sama bersamaan) | Unique Composite Constraint `(patient_id, clinic_id, registration_date)` + atomic queue locking `SELECT MAX(queue_seq) ... FOR UPDATE`. Menolak duplikasi dengan status HTTP 409 Conflict. | `RegistrationController.php` (Line 104) |
| **D.2** | **Konkurensi Stok Obat** (Dua transaksi obat memproses sisa stok terakhir) | *Pessimistic Row Locking* `SELECT stock FROM medicines WHERE id = :id FOR UPDATE` + atomic decrement `WHERE stock >= :qty` + database constraint `CHECK (stock >= 0)`. | `PharmacyController.php` (Line 59) |
| **D.3** | **Pembayaran Ganda** (Gangguan jaringan kasir memicu retry pembayaran) | *Idempotency Key Pattern* via header `X-Idempotency-Key` + table unique key `payments(idempotency_key)` + transactional lock status `PAID`. | `BillingController.php` (Line 123) |
| **D.4** | **Perubahan Data Pasca Billing** (Dokter mengubah diagnosa/tindakan setelah invoice terbit) | *Medical Record Locking* (`is_locked = TRUE`) dipadukan dengan modul formal Amandemen / Addendum Rekam Medis (`examination_amendments`) dan audit trail JSONB tanpa merusak tagihan historis. | `ExaminationController.php` (Line 230) |
| **D.5** | **Gangguan Integrasi Eksternal** (Perangkat LIS Lab atau server pihak ketiga down) | Implementasi pola arsitektur **Circuit Breaker** (Closed, Open, Half-Open) pada Node.js service dengan Dead Letter Buffer asynchronous sehingga data pasien aman tidak hilang. | `routes/lab.js` (Line 185) |
| **D.6** | **Performa Aplikasi & Query** (Beban kunjungan dan analitik meningkat tinggi) | Pemisahan beban *Write-Heavy Core* (Yii2) dan *Read-Heavy Analytics* (Node.js) + targeted B-Tree indexing pada PostgreSQL + connection pooling 20 workers (waktu query < 15 ms). | `routes/dashboard.js` & `schema.sql` |

*Dokumentasi lengkap dan analisis mendalam dapat dibaca pada [docs/TECHNICAL_SCENARIOS.md](docs/TECHNICAL_SCENARIOS.md).*

---

## 👥 Pengguna & Hak Akses Demo (RBAC)

Aplikasi telah dilengkapi akun demo untuk 6 role yang disyaratkan dengan kata sandi: `password123`.  
*(Tersedia tombol **Demo Role Switcher** di bagian header bar React untuk berganti peran secara instan tanpa perlu login ulang).*

| Role | Username | Password | Modul Utama |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `password123` | Akses penuh seluruh modul dan pengaturan master |
| **REGISTRATION** | `pendaftaran` | `password123` | Master Pasien, Pendaftaran Kunjungan, Antrean Poli |
| **DOCTOR** | `dr_budi` | `password123` | Antrean Dokter, RME, Vital Signs, Tindakan, Resep, Permintaan Lab |
| **PHARMACY** | `farmasi` | `password123` | Resep Masuk, Validasi Stok Obat, Dispensing |
| **LAB** | `lab` | `password123` | Permintaan Lab Masuk, Input Parameter Hasil, Verifikasi |
| **CASHIER** | `kasir` | `password123` | Billing Terpadu, Kasir Pembayaran, Cetak Struk/Invoice |

---

## 📁 Struktur Direktori Repository

```
SIMRS-InovaMedika/
├── backend-yii2/               # Core Backend SIMRS (Yii 2.0.55 PHP 8.5)
│   ├── config/                 # Konfigurasi web, database, dan URL manager REST
│   ├── controllers/            # Controller API (Auth, Patient, Registration, Exam, Pharmacy, Billing)
│   ├── models/                 # ActiveRecord Models dengan validasi dan relasi
│   ├── Dockerfile              # Docker container PHP 8.2 Apache
│   └── composer.json
├── service-node/               # Backend Services & Analytics (Node.js Express v22)
│   ├── routes/                 # Endpoint Lab & Dashboard Analytics
│   ├── middleware/             # Auth JWT/Bearer & Centralized Error Handler
│   ├── db.js                   # PostgreSQL Connection Pool (pg.Pool)
│   ├── server.js               # Entrypoint HTTP Server Port 5000
│   └── Dockerfile
├── frontend-react/             # Frontend Application (React.js + Tailwind CSS)
│   ├── src/pages/              # Halaman Dashboard, Pendaftaran, Dokter, Farmasi, Lab, Kasir, Master
│   ├── src/components/         # Navbar dengan Demo Role Switcher, Sidebar, InvoiceModal
│   ├── src/api.js              # Axios Client terkonfigurasi untuk Yii2 dan Node.js
│   └── Dockerfile              # Multi-stage build Nginx Alpine
├── database/                   # Basis Data PostgreSQL
│   ├── schema.sql              # DDL 19 Tabel, Foreign Keys, Indexes, dan Constraints
│   └── seeds.sql               # Seeder data realistis (User, Poli, Dokter, Tindakan, Obat, Kunjungan)
├── docs/                       # Dokumentasi Teknis Lengkap
│   ├── ARCHITECTURE.md         # Diagram arsitektur, alur komunikasi, dan pembagian tanggung jawab
│   ├── ERD.md                  # Entity Relationship Diagram Mermaid & Kamus Data
│   ├── TECHNICAL_SCENARIOS.md  # Analisis & bukti implementasi Skenario D.1 hingga D.6
│   ├── API_DOCUMENTATION.md    # Katalog endpoint lengkap Yii2 dan Node.js
│   ├── INSTALLATION_GUIDE.md   # Panduan instalasi Docker Compose dan lokal
│   └── SUBMISSION.md           # Format surat pengumpulan email resmi
├── postman/                    # API Testing
│   └── SIMRS_Inova_Medika.postman_collection.json
├── tests/                      # Automated Test Suite
│   └── verify_scenarios.js     # Script pengujian otomatis skenario teknis D.1 - D.6
├── docker-compose.yml          # 1-Command Startup untuk 4 container
└── README.md                   # Dokumentasi Utama Proyek
```

---

## 📬 Format Pengumpulan Submission

- **Email Penerima:** `inovamedika.career@gmail.com`
- **Format Subjek:** `Senior Programmer_Pengumpulan Real Case Test_Arvin Ramdhan Fakhrudin`
- **Surat Pengantar Lengkap:** [docs/SUBMISSION.md](docs/SUBMISSION.md)
