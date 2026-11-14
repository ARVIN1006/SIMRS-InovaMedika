-- ============================================================================
-- PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST: SENIOR PROGRAMMER
-- SIMRS - SISTEM PELAYANAN RAWAT JALAN TERINTEGRASI
-- Database Schema: PostgreSQL 14+
-- Author: Arvin Ramdhan Fakhrudin
-- ============================================================================

-- Drop tables in reverse dependency order if exist
DROP TABLE IF EXISTS examination_amendments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS lab_requests CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS examination_services CASCADE;
DROP TABLE IF EXISTS examinations CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS medical_services CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS & RBAC TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    auth_key VARCHAR(64) NOT NULL,
    access_token VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'REGISTRATION', 'DOCTOR', 'PHARMACY', 'LAB', 'CASHIER')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_access_token ON users(access_token);

-- 2. PATIENTS TABLE (Master Data Pasien & No Rekam Medis)
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    mr_number VARCHAR(30) NOT NULL UNIQUE, -- e.g. RM-202611-0001
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('L', 'P')),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A', 'B', 'AB', 'O', '-')),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_mr_number ON patients(mr_number);
CREATE INDEX idx_patients_nik ON patients(nik);
CREATE INDEX idx_patients_name ON patients(name);

-- 3. CLINICS / POLIKLINIK (Master Data Poli)
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g. POLI-UMUM, POLI-GIGI
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DOCTORS (Master Data Dokter & Tenaga Medis)
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    sip_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_clinic ON doctors(clinic_id);

-- 5. DOCTOR SCHEDULES (Master Jadwal Praktik Dokter)
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    day_of_week VARCHAR(15) NOT NULL CHECK (day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quota INTEGER NOT NULL DEFAULT 30,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_doctor_day ON doctor_schedules(doctor_id, day_of_week);

-- 6. MEDICAL SERVICES (Master Tindakan Medis & Tarif)
CREATE TABLE medical_services (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g. 'KONSULTASI', 'TINDAKAN_KECIL', 'DIAGNOSTIK', 'TERAPI'
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_services_code ON medical_services(code);

-- 7. MEDICINES (Master Obat, Stok, dan Harga)
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g. 'ANALGESIK', 'ANTIBIOTIK', 'ANTIPIRETIK'
    unit VARCHAR(30) NOT NULL,     -- e.g. 'Tablet', 'Kapsul', 'Botol', 'Ampul'
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 10,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medicines_stock ON medicines(stock);

-- 8. REGISTRATIONS & QUEUE (Pendaftaran Kunjungan & Antrean Pasien)
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(40) NOT NULL UNIQUE, -- e.g. REG/20261114/0001
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    schedule_id INTEGER REFERENCES doctor_schedules(id) ON DELETE SET NULL,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    queue_number VARCHAR(20) NOT NULL,               -- e.g. UMU-001
    queue_seq INTEGER NOT NULL,                      -- e.g. 1, 2, 3...
    registration_fee NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    payment_type VARCHAR(20) DEFAULT 'UMUM' CHECK (payment_type IN ('UMUM', 'BPJS', 'ASURANSI_SWASTA')),
    status VARCHAR(30) DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'IN_EXAMINATION', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- CRITICAL ENFORCEMENT FOR SCENARIO D.1: Prevent duplicate patient visits to the same clinic on the same day
    CONSTRAINT uq_patient_clinic_date UNIQUE (patient_id, clinic_id, registration_date)
);

CREATE INDEX idx_registrations_date_clinic ON registrations(registration_date, clinic_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_patient ON registrations(patient_id);

-- 9. EXAMINATIONS / RME (Pemeriksaan & Rekam Medis Elektronik)
CREATE TABLE examinations (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE RESTRICT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    examination_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Anamnesis & Vital Signs
    anamnesis TEXT NOT NULL,
    complaints TEXT NOT NULL,
    systolic_bp INTEGER,            -- mmHg e.g. 120
    diastolic_bp INTEGER,           -- mmHg e.g. 80
    pulse_rate INTEGER,             -- bpm e.g. 82
    respiratory_rate INTEGER,       -- breaths/min e.g. 20
    body_temperature NUMERIC(4, 1), -- Celsius e.g. 36.8
    weight_kg NUMERIC(5, 2),        -- kg e.g. 68.5
    height_cm NUMERIC(5, 2),        -- cm e.g. 172.0
    -- Physical Exam & Diagnosis
    physical_examination TEXT,
    primary_diagnosis TEXT NOT NULL,
    primary_icd10 VARCHAR(20) NOT NULL,
    secondary_diagnosis TEXT,
    secondary_icd10 VARCHAR(20),
    doctor_notes TEXT,
    -- Integrity & Audit Enforcement for Scenario D.4
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_examinations_patient ON examinations(patient_id);
CREATE INDEX idx_examinations_doctor ON examinations(doctor_id);

-- 10. EXAMINATION SERVICES (Tindakan Medis yang Diberikan)
CREATE TABLE examination_services (
    id SERIAL PRIMARY KEY,
    examination_id INTEGER NOT NULL REFERENCES examinations(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES medical_services(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_services_exam ON examination_services(examination_id);

-- 11. PRESCRIPTIONS (Farmasi & Resep Obat)
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    examination_id INTEGER NOT NULL REFERENCES examinations(id) ON DELETE RESTRICT,
    prescription_number VARCHAR(40) NOT NULL UNIQUE, -- e.g. RX/20261114/0001
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISPENSED', 'CANCELLED')),
    dispensed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- 12. PRESCRIPTION ITEMS (Rincian Obat dalam Resep)
CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    dosage VARCHAR(50) NOT NULL,      -- e.g. '500 mg'
    frequency VARCHAR(50) NOT NULL,   -- e.g. '3 x 1 hari sesudah makan'
    route VARCHAR(30) DEFAULT 'Oral', -- e.g. 'Oral', 'Topikal', 'Inhalasi'
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescription_items_rx ON prescription_items(prescription_id);

-- 13. LAB REQUESTS (Pemeriksaan Penunjang - Lab)
CREATE TABLE lab_requests (
    id SERIAL PRIMARY KEY,
    examination_id INTEGER NOT NULL REFERENCES examinations(id) ON DELETE RESTRICT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    request_number VARCHAR(40) NOT NULL UNIQUE, -- e.g. LAB/20261114/0001
    test_type VARCHAR(100) NOT NULL,            -- e.g. 'Darah Rutin Lengkap', 'Kimia Darah', 'Urinalisis'
    clinical_indication TEXT,
    priority VARCHAR(20) DEFAULT 'ROUTINE' CHECK (priority IN ('ROUTINE', 'CITO')),
    status VARCHAR(30) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_requests_status ON lab_requests(status);

-- 14. LAB RESULTS (Hasil Pemeriksaan Penunjang Lab)
CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    lab_request_id INTEGER NOT NULL REFERENCES lab_requests(id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL, -- e.g. 'Hemoglobin', 'Leukosit', 'Gula Darah Sewaktu'
    result_value VARCHAR(50) NOT NULL,
    normal_range VARCHAR(50),        -- e.g. '12.0 - 16.0 g/dL'
    unit VARCHAR(30),                -- e.g. 'g/dL', 'mg/dL', '/uL'
    interpretation VARCHAR(30) CHECK (interpretation IN ('NORMAL', 'ABNORMAL_LOW', 'ABNORMAL_HIGH', 'CRITICAL')),
    notes TEXT,
    performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lab_results_req ON lab_results(lab_request_id);

-- 15. BILLS / INVOICES (Billing & Tagihan Terpadu Pasien)
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE RESTRICT,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(40) NOT NULL UNIQUE, -- e.g. INV/20261114/0001
    registration_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    medical_services_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pharmacy_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lab_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bills_invoice_num ON bills(invoice_number);
CREATE INDEX idx_bills_payment_status ON bills(payment_status);

-- 16. BILL ITEMS (Rincian Item Tagihan)
CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('REGISTRATION', 'MEDICAL_SERVICE', 'PHARMACY', 'LABORATORY')),
    reference_id INTEGER,
    item_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);

-- 17. PAYMENTS (Pencatatan Pembayaran Kasir)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    payment_number VARCHAR(40) NOT NULL UNIQUE, -- e.g. PAY/20261114/0001
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('CASH', 'QRIS', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER')),
    payment_reference VARCHAR(100), -- Reference number or bank approval code
    -- CRITICAL ENFORCEMENT FOR SCENARIO D.3: Idempotency Key prevents double payments even if network retries occur
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_idempotency ON payments(idempotency_key);

-- 18. AUDIT LOGS (Pencatatan Perubahan Data & Akses)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'DISPENSE', 'PAYMENT', 'AMENDMENT')),
    old_values JSONB,
    new_values JSONB,
    performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- 19. EXAMINATION AMENDMENTS (Enforcement for Scenario D.4: Audit Trail Perubahan Diagnosis / Tindakan Pasca Billing)
CREATE TABLE examination_amendments (
    id SERIAL PRIMARY KEY,
    examination_id INTEGER NOT NULL REFERENCES examinations(id) ON DELETE RESTRICT,
    bill_id INTEGER REFERENCES bills(id) ON DELETE RESTRICT,
    requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    original_data JSONB NOT NULL,
    amended_data JSONB NOT NULL,
    cost_difference NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'APPROVED' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amendments_exam ON examination_amendments(examination_id);
