# DOKUMENTASI REST API SIMRS RAWAT JALAN
## PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST SENIOR PROGRAMMER
**Author:** Arvin Ramdhan Fakhrudin  

---

## 1. Spesifikasi Server & Format Respons

| Layanan | Host Default | Teknologi | Port | Format Format |
| :--- | :--- | :--- | :--- | :--- |
| **Backend Utama SIMRS** | `http://localhost:8000/api` | Yii 2.0 (PHP 8.5) | 8000 | `application/json` |
| **Backend Services & Lab** | `http://localhost:5000/api` | Node.js Express (v22) | 5000 | `application/json` |
| **Frontend Dashboard** | `http://localhost:3000` | React.js (Vite) | 3000 | Single Page App |

Semua endpoint dilindungi oleh standar otentikasi Bearer Token:
```http
Authorization: Bearer <access_token>
```

Format respons standar JSON konsisten:
```json
{
  "success": true,
  "message": "Pesan deskriptif keberhasilan tindakan",
  "data": { ... }
}
```

---

## 2. Katalog Endpoint Backend Utama (Yii2 - Port 8000)

### A. Otentikasi & Pengguna (RBAC)
- **POST** `/api/auth/login`
  - Body: `{"username": "admin", "password": "password123"}`
  - Respons: `{ "success": true, "data": { "token": "simrs_...", "user": { "role": "ADMIN", ... } } }`
- **GET** `/api/auth/me`
  - Mengambil data profil dan wewenang pengguna aktif.
- **POST** `/api/auth/logout`

### B. Pengelolaan Master Data Pasien
- **GET** `/api/patients?search=Hendra&limit=50&offset=0`
  - Mengambil daftar pasien dengan filter pencarian nama, No RM, NIK, atau telepon.
- **POST** `/api/patients`
  - Body: `{"name": "...", "nik": "16_digit", "birth_date": "YYYY-MM-DD", "gender": "L|P", "address": "...", "phone": "...", "allergies": "..."}`
  - Auto-generate No Rekam Medis unik: `RM-YYYYMM-XXXX`.
- **GET** `/api/patients/:id`
- **PUT** `/api/patients/:id`
- **DELETE** `/api/patients/:id`

### C. Master Data Fasilitas & Tarif
- **GET** `/api/clinics` — Daftar poliklinik aktif.
- **GET** `/api/doctors` — Daftar dokter dan spesialisasi.
- **GET** `/api/doctor-schedules?clinic_id=1&day=Senin` — Jadwal praktik dokter.
- **GET** `/api/services?category=KONSULTASI` — Daftar tindakan medis & tarif.
- **GET** `/api/medicines` — Daftar obat, sisa stok, dan harga satuan.

### D. Pendaftaran & Antrean Pasien
- **POST** `/api/registrations`
  - Mendaftarkan kunjungan pasien ke poli & dokter.
  - Body: `{"patient_id": 1, "clinic_id": 2, "doctor_id": 1, "payment_type": "UMUM", "notes": "..."}`
  - *Skenario D.1 Guard:* Menolak pendaftaran duplikat pasien pada poli yang sama di hari yang sama dengan kode 409 Conflict.
- **GET** `/api/registrations/today-queue?clinic_id=1`
  - Mengambil daftar antrean aktif hari ini per poliklinik.
- **PUT** `/api/registrations/:id/status`
  - Body: `{"status": "IN_EXAMINATION | COMPLETED | CANCELLED"}`

### E. Pemeriksaan Dokter & Rekam Medis Elektronik (RME)
- **POST** `/api/examinations`
  - Menyimpan rekam medis lengkap:
  - Body:
    ```json
    {
      "registration_id": 2,
      "anamnesis": "Keluhan pusing dan nyeri tengkuk...",
      "complaints": "Pusing berputar",
      "systolic_bp": 140,
      "diastolic_bp": 90,
      "pulse_rate": 84,
      "body_temperature": 36.8,
      "primary_diagnosis": "Essential hypertension",
      "primary_icd10": "I10",
      "services": [{ "service_id": 1, "quantity": 1 }],
      "medicines": [{ "medicine_id": 3, "quantity": 30, "dosage": "10 mg", "frequency": "1 x 1" }],
      "lab_test_type": "Profil Lipid"
    }
    ```
- **POST** `/api/examinations/:id/amend`
  - *Skenario D.4 Guard:* Amandemen/revisi rekam medis pasca billing dengan alasan tertulis dan audit trail resmi.
- **GET** `/api/examinations/patient/:patientId`
  - Mengambil riwayat rekam medis pasien sepanjang masa.

### F. Farmasi & Resep Obat
- **GET** `/api/prescriptions?status=PENDING`
  - Daftar resep yang menunggu penyerahan obat oleh farmasi.
- **POST** `/api/prescriptions/:id/dispense`
  - *Skenario D.2 Guard:* Penyerahan obat dengan row-level lock (`SELECT ... FOR UPDATE`) dan atomic decrement (`UPDATE ... WHERE stock >= qty`).

### G. Billing & Pembayaran Kasir
- **GET** `/api/bills?status=UNPAID`
  - Mengambil daftar tagihan pasien.
- **GET** `/api/bills/:id/invoice`
  - Rincian invoice lengkap (Pendaftaran, Tindakan, Obat, Lab) siap dicetak.
- **POST** `/api/bills/:id/pay`
  - Header: `X-Idempotency-Key: <unique_key>`
  - Body: `{"amount": 150000, "payment_method": "QRIS", "idempotency_key": "<key>"}`
  - *Skenario D.3 Guard:* Menjamin idempotency sehingga retry pembayaran kasir tidak pernah tercatat dua kali.

---

## 3. Katalog Endpoint Backend Services (Node.js - Port 5000)

### A. Layanan Pemeriksaan Penunjang (Laboratorium)
- **GET** `/api/lab/requests?status=REQUESTED`
  - Mengambil seluruh permintaan laboratorium aktif dari dokter.
- **GET** `/api/lab/requests/:id`
  - Detail permintaan laboratorium beserta rincian parameter hasil uji.
- **POST** `/api/lab/requests`
  - Pembuatan permintaan lab dari sistem eksternal atau dokter.
- **PUT** `/api/lab/results/:id`
  - Input dan verifikasi hasil parameter lab:
    ```json
    {
      "results": [
        {
          "test_name": "Hemoglobin",
          "result_value": "14.5",
          "normal_range": "13.0 - 17.5",
          "unit": "g/dL",
          "interpretation": "NORMAL"
        }
      ]
    }
    ```
- **POST** `/api/lab/external-integration/webhook`
  - *Skenario D.5 Guard:* Simulasi integrasi perangkat LIS eksternal dengan Circuit Breaker otomatis.

### B. Dashboard Operasional & Analitik
- **GET** `/api/dashboard/stats?period=today|7days|30days|all`
  - *Skenario D.6 Guard:* Agregasi analitik performa tinggi: total kunjungan, kunjungan per poli, ringkasan pendapatan, dan 5 obat terlaris.
