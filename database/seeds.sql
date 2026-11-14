-- ============================================================================
-- PT INOVA MEDIKA SOLUSINDO - REAL CASE TEST: SENIOR PROGRAMMER
-- SIMRS - SEED DATA FOR DEMO & TESTING
-- Author: Arvin Ramdhan Fakhrudin
-- All user accounts default password: "password123"
-- ============================================================================

-- 1. SEED USERS (All 6 Roles)
INSERT INTO users (username, password_hash, auth_key, access_token, full_name, email, role, status) VALUES
('admin', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_admin_98765', 'token_admin_simrs_2026', 'Administrator Sistem SIMRS', 'admin@inovamedika.com', 'ADMIN', 'ACTIVE'),
('pendaftaran', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_reg_98765', 'token_pendaftaran_simrs_2026', 'Siti Rahmawati, A.Md.RMIK', 'pendaftaran@inovamedika.com', 'REGISTRATION', 'ACTIVE'),
('dr_budi', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_drbudi_98765', 'token_drbudi_simrs_2026', 'dr. Budi Santoso, Sp.PD', 'dr.budi@inovamedika.com', 'DOCTOR', 'ACTIVE'),
('dr_ratna', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_drratna_98765', 'token_drratna_simrs_2026', 'dr. Ratna Dewi, Sp.A', 'dr.ratna@inovamedika.com', 'DOCTOR', 'ACTIVE'),
('dr_hendra', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_drhendra_98765', 'token_drhendra_simrs_2026', 'drg. Hendra Gunawan', 'dr.hendra@inovamedika.com', 'DOCTOR', 'ACTIVE'),
('farmasi', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_farmasi_98765', 'token_farmasi_simrs_2026', 'Apt. Dewi Lestari, S.Farm', 'farmasi@inovamedika.com', 'PHARMACY', 'ACTIVE'),
('lab', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_lab_98765', 'token_lab_simrs_2026', 'Ahmad Zulkarnain, A.Md.AK', 'lab@inovamedika.com', 'LAB', 'ACTIVE'),
('kasir', '$2y$12$qoY45KhOyeXAQM2QcjGL.eZCVswTTrX2J4C21LvD6sAD5NS8OadZO', 'authkey_kasir_98765', 'token_kasir_simrs_2026', 'Rina Wulandari, S.E', 'kasir@inovamedika.com', 'CASHIER', 'ACTIVE');

-- 2. SEED CLINICS (Poli Pelayanan)
INSERT INTO clinics (code, name, description, location, status) VALUES
('POLI-UMU', 'Poli Umum', 'Pelayanan medis umum dan skrining awal kesehatan', 'Gedung A, Lantai 1', 'ACTIVE'),
('POLI-INT', 'Poli Penyakit Dalam (Internis)', 'Diagnosis dan penanganan penyakit organ dalam dewasa', 'Gedung A, Lantai 2', 'ACTIVE'),
('POLI-ANK', 'Poli Anak (Pediatri)', 'Pelayanan kesehatan bayi, balita, dan anak-anak', 'Gedung B, Lantai 1', 'ACTIVE'),
('POLI-GIG', 'Poli Gigi & Mulut', 'Pemeriksaan, perawatan gigi, dan bedah mulut sederhana', 'Gedung A, Lantai 1', 'ACTIVE'),
('POLI-MTA', 'Poli Mata (Oftalmologi)', 'Pemeriksaan tajam penglihatan dan kesehatan mata', 'Gedung B, Lantai 2', 'ACTIVE'),
('POLI-SRF', 'Poli Saraf (Neurologi)', 'Penanganan gangguan sistem saraf, stroke, dan vertigo', 'Gedung A, Lantai 2', 'ACTIVE');

-- 3. SEED DOCTORS
INSERT INTO doctors (user_id, clinic_id, sip_number, name, specialization, phone, status) VALUES
(3, 2, 'SIP-503/012/IDI-BDG/2024', 'dr. Budi Santoso, Sp.PD', 'Spesialis Penyakit Dalam', '081234567801', 'ACTIVE'),
(4, 3, 'SIP-503/015/IDI-BDG/2024', 'dr. Ratna Dewi, Sp.A', 'Spesialis Anak', '081234567802', 'ACTIVE'),
(5, 4, 'SIP-503/020/PDGI-BDG/2024', 'drg. Hendra Gunawan', 'Dokter Gigi Umum', '081234567803', 'ACTIVE'),
(NULL, 1, 'SIP-503/008/IDI-BDG/2023', 'dr. Anita Wijaya', 'Dokter Umum', '081234567804', 'ACTIVE'),
(NULL, 5, 'SIP-503/022/IDI-BDG/2024', 'dr. Farhan Malik, Sp.M', 'Spesialis Mata', '081234567805', 'ACTIVE');

-- 4. SEED DOCTOR SCHEDULES
INSERT INTO doctor_schedules (doctor_id, clinic_id, day_of_week, start_time, end_time, quota, status) VALUES
(1, 2, 'Senin', '08:00:00', '12:00:00', 25, 'ACTIVE'),
(1, 2, 'Rabu', '08:00:00', '12:00:00', 25, 'ACTIVE'),
(1, 2, 'Jumat', '08:00:00', '12:00:00', 25, 'ACTIVE'),
(2, 3, 'Selasa', '09:00:00', '13:00:00', 20, 'ACTIVE'),
(2, 3, 'Kamis', '09:00:00', '13:00:00', 20, 'ACTIVE'),
(2, 3, 'Sabtu', '09:00:00', '13:00:00', 20, 'ACTIVE'),
(3, 4, 'Senin', '13:00:00', '17:00:00', 15, 'ACTIVE'),
(3, 4, 'Rabu', '13:00:00', '17:00:00', 15, 'ACTIVE'),
(4, 1, 'Senin', '08:00:00', '15:00:00', 35, 'ACTIVE'),
(4, 1, 'Selasa', '08:00:00', '15:00:00', 35, 'ACTIVE'),
(4, 1, 'Rabu', '08:00:00', '15:00:00', 35, 'ACTIVE'),
(4, 1, 'Kamis', '08:00:00', '15:00:00', 35, 'ACTIVE'),
(4, 1, 'Jumat', '08:00:00', '15:00:00', 35, 'ACTIVE');

-- 5. SEED MEDICAL SERVICES (Master Tindakan Medis & Tarif)
INSERT INTO medical_services (code, name, category, price, description, status) VALUES
('SRV-KONSUL-SP', 'Konsultasi Dokter Spesialis', 'KONSULTASI', 150000.00, 'Pemeriksaan dan konsultasi dokter spesialis', 'ACTIVE'),
('SRV-KONSUL-UM', 'Konsultasi Dokter Umum', 'KONSULTASI', 60000.00, 'Pemeriksaan dasar dan konsultasi dokter umum', 'ACTIVE'),
('SRV-EKG', 'Pemeriksaan Elektrokardiogram (EKG)', 'DIAGNOSTIK', 125000.00, 'Perekaman aktivitas listrik jantung 12-lead', 'ACTIVE'),
('SRV-USG-ABD', 'USG Abdomen 2 Dimensi', 'DIAGNOSTIK', 250000.00, 'Ultrasonografi organ rongga perut lengkap', 'ACTIVE'),
('SRV-NEBULIZER', 'Nebulisasi Terapi Inhalasi', 'TERAPI', 85000.00, 'Terapi uap bronkodilator untuk sesak napas', 'ACTIVE'),
('SRV-HECTING', 'Tindakan Jahit Luka (Hecting 1-5 simpul)', 'TINDAKAN_KECIL', 120000.00, 'Pembersihan luka dan penjahitan luka ringan', 'ACTIVE'),
('SRV-AFF-HECTING', 'Angkat Jahitan (Aff Hecting)', 'TINDAKAN_KECIL', 50000.00, 'Pelepasan benang jahitan dan desinfeksi luka', 'ACTIVE'),
('SRV-SCALING', 'Scaling Karang Gigi 2 Rahang', 'TINDAKAN_GIGI', 200000.00, 'Pembersihan plak dan kalkulus gigi menyeluruh', 'ACTIVE'),
('SRV-TAMBAL-GIG', 'Penambalan Gigi Komposit Sinar', 'TINDAKAN_GIGI', 175000.00, 'Restorasi kavitas gigi dengan resin komposit', 'ACTIVE'),
('SRV-RAWAT-LUKA', 'Perawatan Luka Gangren / Diabetes', 'TINDAKAN_KECIL', 95000.00, 'Debridement ringan dan dressing antiseptik steril', 'ACTIVE');

-- 6. SEED MEDICINES (Master Obat, Stok, dan Harga)
INSERT INTO medicines (code, name, category, unit, stock, min_stock, price, status) VALUES
('MED-AMOX-500', 'Amoxicillin Trihydrate 500 mg', 'ANTIBIOTIK', 'Kaplet', 250, 20, 1500.00, 'ACTIVE'),
('MED-PARA-500', 'Paracetamol 500 mg', 'ANALGESIK', 'Tablet', 500, 50, 800.00, 'ACTIVE'),
('MED-AMLO-10', 'Amlodipine Besilate 10 mg', 'ANTI_HIPERTENSI', 'Tablet', 300, 30, 2500.00, 'ACTIVE'),
('MED-METF-500', 'Metformin HCl 500 mg', 'ANTI_DIABETES', 'Tablet', 400, 40, 1800.00, 'ACTIVE'),
('MED-OMEP-20', 'Omeprazole 20 mg', 'ANTASIDA_PPI', 'Kapsul', 220, 20, 3200.00, 'ACTIVE'),
('MED-CEFI-100', 'Cefixime Trihydrate 100 mg', 'ANTIBIOTIK', 'Kapsul', 150, 20, 7500.00, 'ACTIVE'),
('MED-CETI-10', 'Cetirizine HCl 10 mg', 'ANTI_HISTAMIN', 'Tablet', 350, 30, 1200.00, 'ACTIVE'),
('MED-VENT-INH', 'Salbutamol Inhaler (Ventolin)', 'RESPIRATORI', 'Botol', 35, 5, 85000.00, 'ACTIVE'),
('MED-IBUP-400', 'Ibuprofen 400 mg', 'ANTI_INFLAMASI', 'Tablet', 280, 25, 1400.00, 'ACTIVE'),
('MED-SUCR-SYR', 'Sucralfate Suspensi 100 ml', 'GASTROINTESTINAL', 'Botol', 60, 10, 28000.00, 'ACTIVE');

-- 7. SEED PATIENTS (Master Pasien & No Rekam Medis)
INSERT INTO patients (mr_number, nik, name, birth_date, gender, blood_type, phone, email, address, emergency_contact_name, emergency_contact_phone, allergies) VALUES
('RM-202611-0001', '3204121508850003', 'Hendra Kusuma', '1985-08-15', 'L', 'O', '081321987654', 'hendra.kusuma@email.com', 'Jl. Sukajadi No. 42, Sukajadi, Kota Bandung', 'Dewi Susanti (Istri)', '081321987655', 'Penisilin (Alergi Obat)'),
('RM-202611-0002', '3204155203920001', 'Nurul Aini', '1992-03-12', 'P', 'B', '085720112233', 'nurul.aini@email.com', 'Jl. Cihampelas No. 118, Bandung Wetan, Kota Bandung', 'Agus Salim (Suami)', '085720112234', 'Tidak ada'),
('RM-202611-0003', '3204180407780002', 'Bambang Trianto', '1978-07-04', 'L', 'A', '081809776655', 'bambang.trianto@email.com', 'Jl. Buah Batu No. 89, Lengkong, Kota Bandung', 'Sri Wahyuni (Istri)', '081809776656', 'Seafood'),
('RM-202611-0004', '3204216811010005', 'Dian Permatasari', '2001-11-28', 'P', 'AB', '087823445566', 'dian.permata@email.com', 'Jl. Pasir Kaliki No. 56, Cicendo, Kota Bandung', 'Rudy Hermawan (Ayah)', '087823445567', 'Tidak ada'),
('RM-202611-0005', '3204251010990004', 'Rizky Firmansyah', '1999-10-10', 'L', 'O', '089655443322', 'rizky.firman@email.com', 'Jl. Gegerkalong Hilir No. 15, Sukasari, Kota Bandung', 'Siti Maryam (Ibu)', '089655443323', 'Sulfa');

-- 8. SEED COMPLETE SAMPLE CLINICAL JOURNEY (For Showcase / Verification)
-- Registration 1: Hendra Kusuma -> Poli Internis -> dr. Budi
INSERT INTO registrations (id, registration_number, patient_id, clinic_id, doctor_id, schedule_id, registration_date, queue_number, queue_seq, registration_fee, payment_type, status, notes, created_by)
VALUES (1, 'REG/20261114/0001', 1, 2, 1, 1, CURRENT_DATE, 'INT-001', 1, 25000.00, 'UMUM', 'COMPLETED', 'Keluhan pusing berputar dan nyeri tengkuk sejak 3 hari', 2);

-- Examination 1: dr. Budi Pemeriksaan
INSERT INTO examinations (id, registration_id, patient_id, doctor_id, examination_date, anamnesis, complaints, systolic_bp, diastolic_bp, pulse_rate, respiratory_rate, body_temperature, weight_kg, height_cm, physical_examination, primary_diagnosis, primary_icd10, secondary_diagnosis, secondary_icd10, doctor_notes, is_locked, locked_at)
VALUES (1, 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '2 hours',
'Pasien mengeluh kepala pusing berdenyut di bagian tengkuk sejak 3 hari lalu. Riwayat hipertensi diketahui sejak 2 tahun lalu tidak rutin minum obat.',
'Pusing tengkuk dan leher kaku',
150, 95, 88, 20, 36.7, 72.0, 170.0,
'Keadaan umum: Sedang, Compos Mentis. Kepala/Leher: Nyeri tekan suboksipital (+). Cor/Pulmo: Normal, S1 S2 reguler, wheezing (-). Abdomen: Supel, nyeri tekan (-). Ekstremitas: Edema (-/-).',
'Essential (primary) hypertension', 'I10',
'Tension-type headache, unspecified', 'G44.2',
'Edukasi kurangi konsumsi garam dan pantau tekanan darah rutin.', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Examination Services: Konsultasi Spesialis + EKG
INSERT INTO examination_services (examination_id, service_id, quantity, unit_price, subtotal, notes) VALUES
(1, 1, 1, 150000.00, 150000.00, 'Konsultasi Spesialis Penyakit Dalam'),
(1, 3, 1, 125000.00, 125000.00, 'Perekaman EKG 12 Lead: Sinus Rhythm, normal axis');

-- Prescription 1: Resep Hipertensi
INSERT INTO prescriptions (id, examination_id, prescription_number, doctor_id, patient_id, status, dispensed_by, dispensed_at, total_amount, notes)
VALUES (1, 1, 'RX/20261114/0001', 1, 1, 'DISPENSED', 6, CURRENT_TIMESTAMP - INTERVAL '1 hour', 75000.00, 'Resep pengobatan antihipertensi 30 hari');

INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, route, quantity, unit_price, subtotal, instructions) VALUES
(1, 3, '10 mg', '1 x 1 tablet tiap pagi', 'Oral', 30, 2500.00, 75000.00, 'Diminum pada pagi hari sesudah sarapan');

-- Deduct medicine stock for dispensed prescription
UPDATE medicines SET stock = stock - 30 WHERE id = 3;

-- Lab Request 1: Profil Lipid & Glukosa
INSERT INTO lab_requests (id, examination_id, patient_id, doctor_id, request_number, test_type, clinical_indication, priority, status, total_amount, requested_at, completed_at)
VALUES (1, 1, 1, 1, 'LAB/20261114/0001', 'Profil Lipid & Glukosa Darah', 'Pemeriksaan faktor risiko kardiovaskular pada hipertensi', 'ROUTINE', 'COMPLETED', 180000.00, CURRENT_TIMESTAMP - INTERVAL '100 minutes', CURRENT_TIMESTAMP - INTERVAL '70 minutes');

INSERT INTO lab_results (lab_request_id, test_name, result_value, normal_range, unit, interpretation, notes, performed_by, verified_by, completed_at) VALUES
(1, 'Kolesterol Total', '225', '< 200', 'mg/dL', 'ABNORMAL_HIGH', 'Hiperkolesterolemia ringan', 7, 7, CURRENT_TIMESTAMP - INTERVAL '70 minutes'),
(1, 'Trigliserida', '165', '< 150', 'mg/dL', 'ABNORMAL_HIGH', 'Ambang batas tinggi', 7, 7, CURRENT_TIMESTAMP - INTERVAL '70 minutes'),
(1, 'Kolesterol HDL', '48', '> 40', 'mg/dL', 'NORMAL', 'Dalam batas normal', 7, 7, CURRENT_TIMESTAMP - INTERVAL '70 minutes'),
(1, 'Kolesterol LDL', '144', '< 100', 'mg/dL', 'ABNORMAL_HIGH', 'Meningkat', 7, 7, CURRENT_TIMESTAMP - INTERVAL '70 minutes'),
(1, 'Gula Darah Sewaktu', '110', '< 140', 'mg/dL', 'NORMAL', 'Normoglikemia', 7, 7, CURRENT_TIMESTAMP - INTERVAL '70 minutes');

-- Bill 1: Consolidated Outpatient Invoice
-- Registration Fee: 25.000
-- Medical Services: 150.000 + 125.000 = 275.000
-- Pharmacy: 75.000
-- Lab: 180.000
-- Total: 555.000
INSERT INTO bills (id, registration_id, patient_id, invoice_number, registration_fee, medical_services_total, pharmacy_total, lab_total, total_amount, paid_amount, balance_amount, payment_status)
VALUES (1, 1, 1, 'INV/20261114/0001', 25000.00, 275000.00, 75000.00, 180000.00, 555000.00, 555000.00, 0.00, 'PAID');

INSERT INTO bill_items (bill_id, item_type, reference_id, item_name, quantity, unit_price, subtotal) VALUES
(1, 'REGISTRATION', 1, 'Biaya Pendaftaran dan Administrasi Rekam Medis', 1, 25000.00, 25000.00),
(1, 'MEDICAL_SERVICE', 1, 'Konsultasi Dokter Spesialis Penyakit Dalam', 1, 150000.00, 150000.00),
(1, 'MEDICAL_SERVICE', 3, 'Pemeriksaan Elektrokardiogram (EKG)', 1, 125000.00, 125000.00),
(1, 'PHARMACY', 1, 'Resep Farmasi: Amlodipine Besilate 10 mg (30 tab)', 1, 75000.00, 75000.00),
(1, 'LABORATORY', 1, 'Pemeriksaan Lab: Profil Lipid & Glukosa Darah', 1, 180000.00, 180000.00);

-- Payment 1: Full Payment via QRIS
INSERT INTO payments (bill_id, payment_number, payment_date, amount, payment_method, payment_reference, idempotency_key, cashier_id, notes)
VALUES (1, 'PAY/20261114/0001', CURRENT_TIMESTAMP - INTERVAL '45 minutes', 555000.00, 'QRIS', 'QRIS-NMID-93821049281', 'IDEMP-INV-0001-PAY-01', 8, 'Pembayaran lunas rawat jalan via QRIS');

-- Registration 2: Nurul Aini -> Poli Gigi -> drg. Hendra (Status WAITING for live UI testing)
INSERT INTO registrations (id, registration_number, patient_id, clinic_id, doctor_id, schedule_id, registration_date, queue_number, queue_seq, registration_fee, payment_type, status, notes, created_by)
VALUES (2, 'REG/20261114/0002', 2, 4, 3, 7, CURRENT_DATE, 'GIG-001', 1, 25000.00, 'UMUM', 'WAITING', 'Keluhan ngilu saat minum dingin dan pembersihan karang gigi', 2);

-- Registration 3: Bambang Trianto -> Poli Umum -> dr. Anita (Status WAITING for live UI testing)
INSERT INTO registrations (id, registration_number, patient_id, clinic_id, doctor_id, schedule_id, registration_date, queue_number, queue_seq, registration_fee, payment_type, status, notes, created_by)
VALUES (3, 'REG/20261114/0003', 3, 1, 4, 9, CURRENT_DATE, 'UMU-001', 1, 25000.00, 'BPJS', 'WAITING', 'Batuk pilek dan demam sejak semalam', 2);

-- Reset serial sequences to avoid ID collisions on new inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('clinics_id_seq', (SELECT MAX(id) FROM clinics));
SELECT setval('doctors_id_seq', (SELECT MAX(id) FROM doctors));
SELECT setval('doctor_schedules_id_seq', (SELECT MAX(id) FROM doctor_schedules));
SELECT setval('medical_services_id_seq', (SELECT MAX(id) FROM medical_services));
SELECT setval('medicines_id_seq', (SELECT MAX(id) FROM medicines));
SELECT setval('patients_id_seq', (SELECT MAX(id) FROM patients));
SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM registrations));
SELECT setval('examinations_id_seq', (SELECT MAX(id) FROM examinations));
SELECT setval('examination_services_id_seq', (SELECT MAX(id) FROM examination_services));
SELECT setval('prescriptions_id_seq', (SELECT MAX(id) FROM prescriptions));
SELECT setval('prescription_items_id_seq', (SELECT MAX(id) FROM prescription_items));
SELECT setval('lab_requests_id_seq', (SELECT MAX(id) FROM lab_requests));
SELECT setval('lab_results_id_seq', (SELECT MAX(id) FROM lab_results));
SELECT setval('bills_id_seq', (SELECT MAX(id) FROM bills));
SELECT setval('bill_items_id_seq', (SELECT MAX(id) FROM bill_items));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
