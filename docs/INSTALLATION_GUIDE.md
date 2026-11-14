# PANDUAN INSTALASI & MENJALANKAN APLIKASI
## PT INOVA MEDIKA SOLUSINDO - SIMRS RAWAT JALAN TERINTEGRASI

Tersedia dua metode untuk menjalankan aplikasi:
1. **Metode 1: Menggunakan Docker Compose (Satu Perintah / Turnkey Solution - Direkomendasikan)**
2. **Metode 2: Menjalankan Secara Lokal (Manual Development Mode)**

---

## METODE 1: Menggunakan Docker Compose (Direkomendasikan)

### Prasyarat
- Docker Engine 24.0+
- Docker Compose v2+

### Langkah-Langkah:
1. **Clone / Buka Direktori Project:**
   ```bash
   cd /home/arvin-ramdhan-fakhrudin/Project/SIMRS-InovaMedika
   ```

2. **Jalankan Seluruh Stack dengan Satu Perintah:**
   ```bash
   docker compose up --build -d
   ```
   *Perintah ini secara otomatis:*
   - Menjalankan PostgreSQL 16 pada port `5432` dan mengeksekusi DDL migration (`schema.sql`) serta seeder awal (`seeds.sql`).
   - Melakukan build container PHP 8.2 Apache untuk Backend Utama Yii2 pada port `8000`.
   - Melakukan build container Node.js Express untuk Backend Services pada port `5000`.
   - Melakukan build React.js SPA dan menyajikannya via Nginx pada port `3000`.

3. **Akses Layanan di Browser:**
   - **Frontend Aplikasi SIMRS:** [http://localhost:3000](http://localhost:3000)
   - **Backend Utama Yii2:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - **Backend Services Node.js:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Dokumentasi API Node.js:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

4. **Mematikan Layanan:**
   ```bash
   docker compose down
   ```

---

## METODE 2: Menjalankan Secara Lokal (Tanpa Docker)

### Prasyarat
- PHP 8.1+ (dengan ekstensi `pdo_pgsql`, `mbstring`, `intl`)
- Composer 2+
- Node.js 18+ & npm
- PostgreSQL 14+ aktif pada port 5432

### Langkah-Langkah:

1. **Setup Database PostgreSQL:**
   ```bash
   # Buat database
   createdb -U postgres -h 127.0.0.1 -p 5432 simrs_db

   # Eksekusi Schema dan Seeds
   psql -U postgres -h 127.0.0.1 -p 5432 -d simrs_db -f database/schema.sql
   psql -U postgres -h 127.0.0.1 -p 5432 -d simrs_db -f database/seeds.sql
   ```

2. **Jalankan Backend Utama (Yii2):**
   ```bash
   cd backend-yii2
   composer install
   php -S 127.0.0.1:8000 -t web
   ```

3. **Jalankan Backend Services (Node.js):**
   ```bash
   cd service-node
   npm install
   node server.js
   ```

4. **Jalankan Frontend (React.js):**
   ```bash
   cd frontend-react
   npm install
   npm run dev -- --port 3000
   ```

5. **Jalankan Pengujian Otomatis Skenario D.1 - D.6:**
   ```bash
   node tests/verify_scenarios.js
   ```

---

## KREDENSIAL PENGGUNA DEMO (RBAC)

Semua akun demo di bawah menggunakan kata sandi seragam: `password123`.  
*Pada aplikasi React, evaluator juga dapat berganti peran secara instan menggunakan tombol **Demo Role Switcher** di bagian header bar.*

| No | Nama Lengkap | Peran (Role) | Username | Password | Wewenang Akses Utama |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Administrator Sistem | `ADMIN` | `admin` | `password123` | Akses penuh seluruh modul dan pengaturan master |
| 2 | Siti Rahmawati, A.Md.RMIK | `REGISTRATION` | `pendaftaran` | `password123` | Pendaftaran pasien, pencarian No RM, terbit antrean |
| 3 | dr. Budi Santoso, Sp.PD | `DOCTOR` | `dr_budi` | `password123` | Antrean poli, RME, vital signs, tindakan, resep |
| 4 | Apt. Dewi Lestari, S.Farm | `PHARMACY` | `farmasi` | `password123` | Validasi stok obat & penyerahan (dispensing) |
| 5 | Ahmad Zulkarnain, A.Md.AK | `LAB` | `lab` | `password123` | Daftar permintaan lab, input parameter & verifikasi |
| 6 | Rina Wulandari, S.E | `CASHIER` | `kasir` | `password123` | Billing terpadu, pemrosesan pembayaran, cetak invoice |
