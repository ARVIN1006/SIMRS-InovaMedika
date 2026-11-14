# ENTITY RELATIONSHIP DIAGRAM (ERD) & DATA DICTIONARY
## PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST SENIOR PROGRAMMER
**Sistem:** SIMRS Pelayanan Rawat Jalan Terintegrasi  
**Database:** PostgreSQL 16+  
**Author:** Arvin Ramdhan Fakhrudin  

---

## 1. Diagram Relasi Entitas (Mermaid ERD)

```mermaid
erDiagram
    USERS ||--o{ DOCTORS : "relates_to"
    USERS ||--o{ REGISTRATIONS : "created_by"
    USERS ||--o{ PRESCRIPTIONS : "dispensed_by"
    USERS ||--o{ PAYMENTS : "cashier"
    USERS ||--o{ AUDIT_LOGS : "performed_by"

    PATIENTS ||--o{ REGISTRATIONS : "registers"
    PATIENTS ||--o{ EXAMINATIONS : "examined"
    PATIENTS ||--o{ PRESCRIPTIONS : "prescribed"
    PATIENTS ||--o{ LAB_REQUESTS : "tested"
    PATIENTS ||--o{ BILLS : "billed"

    CLINICS ||--o{ DOCTORS : "has"
    CLINICS ||--o{ DOCTOR_SCHEDULES : "schedules"
    CLINICS ||--o{ REGISTRATIONS : "receives"

    DOCTORS ||--o{ DOCTOR_SCHEDULES : "practices"
    DOCTORS ||--o{ REGISTRATIONS : "assigned_to"
    DOCTORS ||--o{ EXAMINATIONS : "examines"
    DOCTORS ||--o{ PRESCRIPTIONS : "prescribes"
    DOCTORS ||--o{ LAB_REQUESTS : "requests"

    REGISTRATIONS ||--|| EXAMINATIONS : "generates_rme"
    REGISTRATIONS ||--|| BILLS : "initializes"

    EXAMINATIONS ||--o{ EXAMINATION_SERVICES : "includes_actions"
    EXAMINATIONS ||--o{ PRESCRIPTIONS : "creates_rx"
    EXAMINATIONS ||--o{ LAB_REQUESTS : "orders_lab"
    EXAMINATIONS ||--o{ EXAMINATION_AMENDMENTS : "has_amendments"

    MEDICAL_SERVICES ||--o{ EXAMINATION_SERVICES : "referenced_in"

    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : "contains"
    MEDICINES ||--o{ PRESCRIPTION_ITEMS : "dispensed_in"

    LAB_REQUESTS ||--o{ LAB_RESULTS : "produces"

    BILLS ||--o{ BILL_ITEMS : "itemized_in"
    BILLS ||--o{ PAYMENTS : "settled_by"
    BILLS ||--o{ EXAMINATION_AMENDMENTS : "audits_cost_diff"

    USERS {
        int id PK
        varchar username UK
        varchar password_hash
        varchar access_token
        varchar role
        varchar full_name
        varchar email UK
    }

    PATIENTS {
        int id PK
        varchar mr_number UK "RM-YYYYMM-XXXX"
        varchar nik UK "16 Digits"
        varchar name
        date birth_date
        varchar gender
        text address
        varchar phone
        text allergies
    }

    CLINICS {
        int id PK
        varchar code UK "POLI-UMU"
        varchar name
        text description
        varchar location
        varchar status
    }

    DOCTORS {
        int id PK
        int user_id FK
        int clinic_id FK
        varchar sip_number UK
        varchar name
        varchar specialization
    }

    REGISTRATIONS {
        int id PK
        varchar registration_number UK
        int patient_id FK
        int clinic_id FK
        int doctor_id FK
        date registration_date
        varchar queue_number
        int queue_seq
        numeric registration_fee
        varchar status "WAITING, IN_EXAMINATION, COMPLETED, CANCELLED"
    }

    EXAMINATIONS {
        int id PK
        int registration_id FK,UK
        int patient_id FK
        int doctor_id FK
        text anamnesis
        text complaints
        int systolic_bp
        int diastolic_bp
        int pulse_rate
        numeric body_temperature
        text primary_diagnosis
        varchar primary_icd10
        boolean is_locked
    }

    EXAMINATION_SERVICES {
        int id PK
        int examination_id FK
        int service_id FK
        int quantity
        numeric unit_price
        numeric subtotal
    }

    PRESCRIPTIONS {
        int id PK
        varchar prescription_number UK
        int examination_id FK
        int patient_id FK
        int doctor_id FK
        varchar status "PENDING, DISPENSED, CANCELLED"
        numeric total_amount
    }

    PRESCRIPTION_ITEMS {
        int id PK
        int prescription_id FK
        int medicine_id FK
        varchar dosage
        varchar frequency
        int quantity
        numeric unit_price
        numeric subtotal
    }

    MEDICINES {
        int id PK
        varchar code UK
        varchar name
        varchar unit
        int stock "CHECK stock >= 0"
        numeric price
    }

    LAB_REQUESTS {
        int id PK
        varchar request_number UK
        int examination_id FK
        varchar test_type
        varchar priority "ROUTINE, CITO"
        varchar status "REQUESTED, COMPLETED"
        numeric total_amount
    }

    LAB_RESULTS {
        int id PK
        int lab_request_id FK
        varchar test_name
        varchar result_value
        varchar normal_range
        varchar unit
        varchar interpretation
    }

    BILLS {
        int id PK
        int registration_id FK,UK
        varchar invoice_number UK
        numeric registration_fee
        numeric medical_services_total
        numeric pharmacy_total
        numeric lab_total
        numeric total_amount
        numeric paid_amount
        numeric balance_amount
        varchar payment_status "UNPAID, PARTIAL, PAID"
    }

    PAYMENTS {
        int id PK
        int bill_id FK
        varchar payment_number UK
        numeric amount
        varchar payment_method "CASH, QRIS, DEBIT, TRANSFER"
        varchar idempotency_key UK "Scenario D.3 Guard"
        int cashier_id FK
    }

    AUDIT_LOGS {
        int id PK
        varchar table_name
        int record_id
        varchar action
        jsonb old_values
        jsonb new_values
        int performed_by FK
        varchar ip_address
    }

    EXAMINATION_AMENDMENTS {
        int id PK
        int examination_id FK
        int bill_id FK
        int requested_by FK
        text reason
        jsonb original_data
        jsonb amended_data
        numeric cost_difference
        varchar status "Scenario D.4 Guard"
    }
```

---

## 2. Kamus Data & Integritas Relasional (Data Integrity Rules)

### A. Proteksi Integritas Utama:
1. **Unique Index Pencegahan Duplikasi Pendaftaran (`uq_patient_clinic_date`):**
   ```sql
   CONSTRAINT uq_patient_clinic_date UNIQUE (patient_id, clinic_id, registration_date);
   ```
   *Tujuan:* Mencegah satu pasien didaftarkan dua kali ke poliklinik yang sama pada tanggal yang sama, menyelesaikan permasalahan Skenario D.1 secara deterministik di level basis data.

2. **Check Constraint Non-Negative Stock:**
   ```sql
   ALTER TABLE medicines ADD CONSTRAINT chk_medicine_stock CHECK (stock >= 0);
   ```
   *Tujuan:* Menjamin basis data akan membatalkan (abort) transaksi apapun yang mencoba membuat stok bernilai negatif, melengkapi proteksi *Pessimistic Locking* pada Skenario D.2.

3. **Unique Index Idempotency Key Transaksi Kasir:**
   ```sql
   ALTER TABLE payments ADD CONSTRAINT uq_payment_idempotency_key UNIQUE (idempotency_key);
   ```
   *Tujuan:* Menjamin tidak akan pernah ada dua pembayaran yang tercatat dengan idempotency key yang sama saat terjadi gangguan jaringan atau retry otomatis (Skenario D.3).

4. **Tabel Amandemen Rekam Medis (`examination_amendments`):**
   *Tujuan:* Menyimpan riwayat perubahan diagnosis/tindakan lengkap dengan `original_data` (JSONB), `amended_data` (JSONB), alasan perubahan, dan otorisasi supervisor tanpa mengubah dokumen tagihan historis yang telah terbit (Skenario D.4).
