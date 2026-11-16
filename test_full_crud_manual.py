#!/usr/bin/env python3
"""
Manual End-to-End CRUD Test Suite for SIMRS Inova Medika
Tests all business workflows, API endpoints, role permissions, and scenarios D.1 - D.5:
1. Patient CRUD (Create, Read List, Read Detail, Update, Delete Temp)
2. Master Data CRUD (Medical Services & Medicines)
3. Visit Registration & Antrean Poli (Scenario D.1: Auto Numbering & Duplicate Guard)
4. Doctor Examination, EMR, & Diagnosis Amendment (Scenario D.4: Legal Audit Trail)
5. Pharmacy Prescription Dispensing & Atomic Stock Decrement (Scenario D.2: Pessimistic Lock)
6. Laboratory Parameter Result Input & LIS Circuit Breaker (Scenario D.5)
7. Billing Calculation & Cashier Payment with Idempotency Key (Scenario D.3)
"""

import sys
import time
import json
import requests

YII_BASE = "http://localhost:8000/api"
NODE_BASE = "http://localhost:5000/api"

TOKENS = {
    "ADMIN": "token_admin_simrs_2026",
    "REGISTRATION": "token_pendaftaran_simrs_2026",
    "DOCTOR": "token_drbudi_simrs_2026",
    "PHARMACY": "token_farmasi_simrs_2026",
    "LAB": "token_lab_simrs_2026",
    "CASHIER": "token_kasir_simrs_2026",
}

def get_headers(role="ADMIN", idempotency_key=None):
    headers = {
        "Authorization": f"Bearer {TOKENS[role]}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    if idempotency_key:
        headers["X-Idempotency-Key"] = idempotency_key
    return headers

class TestRunner:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.results = []

    def assert_test(self, name, condition, details=""):
        if condition:
            self.passed += 1
            print(f"  [PASS] {name}")
            if details:
                print(f"         > {details}")
            self.results.append({"name": name, "status": "PASS", "details": details})
        else:
            self.failed += 1
            print(f"  [FAIL] {name}")
            if details:
                print(f"         > ERROR: {details}")
            self.results.append({"name": name, "status": "FAIL", "details": details})

runner = TestRunner()

print("=" * 80)
print("🚀 SIMRS INOVA MEDIKA - PENGUJIAN CRUD MANUAL LENGKAP END-TO-END")
print("=" * 80)

# ==============================================================================
# SECTION 1: MASTER DATA CRUD (TINDAKAN & OBAT)
# ==============================================================================
print("\n[MODUL 1] MASTER DATA CRUD (Tindakan Medis & Obat Farmasi)")

# 1.1 Create Medical Service
srv_payload = {
    "code": f"SRV-M-{int(time.time()) % 10000}",
    "name": "Pemeriksaan EKG Jantung 12 Lead Manual",
    "category": "DIAGNOSTIK",
    "description": "Uji rekam kelistrikan jantung istirahat",
    "price": 125000.0,
    "status": "ACTIVE"
}
res_srv_create = requests.post(f"{YII_BASE}/services", json=srv_payload, headers=get_headers("ADMIN"))
runner.assert_test("1.1 Create Medical Service (POST /services)", 
                   res_srv_create.status_code == 201, 
                   f"Code: {res_srv_create.status_code}, ID: {res_srv_create.json().get('data', {}).get('id')}")
created_srv = res_srv_create.json().get('data', {})

# 1.2 Read Medical Service List
res_srv_list = requests.get(f"{YII_BASE}/services", headers=get_headers("ADMIN"))
runner.assert_test("1.2 Read Medical Services List (GET /services)", 
                   res_srv_list.status_code == 200 and len(res_srv_list.json().get('data', [])) > 0,
                   f"Total master tindakan: {len(res_srv_list.json().get('data', []))}")

# 1.3 Update Medical Service
if created_srv.get('id'):
    srv_id = created_srv['id']
    res_srv_update = requests.put(f"{YII_BASE}/services/{srv_id}", json={"price": 135000.0, "name": "Pemeriksaan EKG Jantung 12 Lead (Updated)"}, headers=get_headers("ADMIN"))
    runner.assert_test("1.3 Update Medical Service (PUT /services/{id})", 
                       res_srv_update.status_code == 200 and float(res_srv_update.json().get('data', {}).get('price', 0)) == 135000.0,
                       f"Updated Price: {res_srv_update.json().get('data', {}).get('price')}")

# 1.4 Create Medicine
med_payload = {
    "code": f"MED-M-{int(time.time()) % 10000}",
    "name": "Cefixime Trihydrate 200mg",
    "category": "ANTIBIOTIK",
    "unit": "Kapsul",
    "stock": 250,
    "min_stock": 25,
    "price": 8500.0,
    "status": "ACTIVE"
}
res_med_create = requests.post(f"{YII_BASE}/medicines", json=med_payload, headers=get_headers("ADMIN"))
runner.assert_test("1.4 Create Medicine (POST /medicines)", 
                   res_med_create.status_code == 201, 
                   f"Code: {res_med_create.status_code}, ID: {res_med_create.json().get('data', {}).get('id')}")
created_med = res_med_create.json().get('data', {})

# 1.5 Update Medicine Stock & Details
if created_med.get('id'):
    med_id = created_med['id']
    res_med_update = requests.put(f"{YII_BASE}/medicines/{med_id}", json={"stock": 280, "price": 9000.0}, headers=get_headers("ADMIN"))
    runner.assert_test("1.5 Update Medicine (PUT /medicines/{id})", 
                       res_med_update.status_code == 200 and res_med_update.json().get('data', {}).get('stock') == 280,
                       f"Updated Stock: {res_med_update.json().get('data', {}).get('stock')}")


# ==============================================================================
# SECTION 2: PATIENT CRUD (DATA DASAR & NO. REKAM MEDIS)
# ==============================================================================
print("\n[MODUL 2] PATIENT CRUD (Pendaftaran Pasien & No. Rekam Medis)")

# 2.1 Create Primary Patient
rand_nik = f"3204{int(time.time() * 100):012d}"[:16]
pat_payload = {
    "name": "Budi Hartono",
    "nik": rand_nik,
    "birth_date": "1988-05-12",
    "gender": "L",
    "blood_type": "B",
    "phone": "081299887766",
    "email": f"budi.{int(time.time())}@example.com",
    "address": "Jl. LLRE Martadinata No. 88, Bandung",
    "allergies": "Aspirin, Seafood"
}
res_pat_create = requests.post(f"{YII_BASE}/patients", json=pat_payload, headers=get_headers("REGISTRATION"))
primary_patient = res_pat_create.json().get('data') or {}
runner.assert_test("2.1 Create Patient (POST /patients)", 
                   res_pat_create.status_code == 201 and primary_patient.get('mr_number'),
                   f"Created No. RM: {primary_patient.get('mr_number')}, NIK: {primary_patient.get('nik')}")

# 2.2 Read Patient List (with search)
res_pat_list = requests.get(f"{YII_BASE}/patients?search=Budi Hartono", headers=get_headers("REGISTRATION"))
items = res_pat_list.json().get('data', {}).get('items', [])
runner.assert_test("2.2 Read Patient List (GET /patients?search=...)", 
                   res_pat_list.status_code == 200 and any(p.get('id') == primary_patient.get('id') for p in items),
                   f"Found {len(items)} matching patients")

# 2.3 Read Single Patient Detail
res_pat_view = requests.get(f"{YII_BASE}/patients/{primary_patient['id']}", headers=get_headers("REGISTRATION"))
runner.assert_test("2.3 Read Patient Detail (GET /patients/{id})", 
                   res_pat_view.status_code == 200 and res_pat_view.json().get('data', {}).get('name') == "Budi Hartono",
                   f"Patient Name: {res_pat_view.json().get('data', {}).get('name')}")

# 2.4 Update Patient
res_pat_update = requests.put(f"{YII_BASE}/patients/{primary_patient['id']}", 
                              json={"phone": "081299887799", "address": "Jl. LLRE Martadinata No. 88A, Bandung"}, 
                              headers=get_headers("REGISTRATION"))
runner.assert_test("2.4 Update Patient (PUT /patients/{id})", 
                   res_pat_update.status_code == 200 and res_pat_update.json().get('data', {}).get('phone') == "081299887799",
                   f"Updated Phone: {res_pat_update.json().get('data', {}).get('phone')}")

# 2.5 Create & Delete Temporary Patient (Full Delete Lifecycle)
temp_nik = f"3205{int(time.time() * 100):012d}"[:16]
res_temp = requests.post(f"{YII_BASE}/patients", json={
    "name": "Pasien Uji Hapus",
    "nik": temp_nik,
    "birth_date": "1999-01-01",
    "gender": "P",
    "address": "Alamat Uji Sementara"
}, headers=get_headers("ADMIN"))
temp_id = (res_temp.json().get('data') or {}).get('id')

res_del = requests.delete(f"{YII_BASE}/patients/{temp_id}", headers=get_headers("ADMIN"))
res_verify_del = requests.get(f"{YII_BASE}/patients/{temp_id}", headers=get_headers("ADMIN"))
runner.assert_test("2.5 Delete Patient (DELETE /patients/{id})", 
                   res_del.status_code == 200 and res_verify_del.status_code == 404,
                   f"Deleted ID {temp_id}, Subsequent lookup returned 404 Not Found")


# ==============================================================================
# SECTION 3: VISIT REGISTRATION & ANTREAN POLI (SKENARIO D.1)
# ==============================================================================
print("\n[MODUL 3] PENDAFTARAN RAWAT JALAN & PROTEKSI ANTREAN (Skenario D.1)")

# 3.1 Register Patient to Clinic
reg_payload = {
    "patient_id": primary_patient["id"],
    "clinic_id": 2, # Poli Penyakit Dalam
    "doctor_id": 1, # dr. Budi Santoso, Sp.PD
    "payment_type": "UMUM",
    "notes": "Pasien mengeluh pusing berputar dan nyeri tengkuk sejak 2 hari lalu."
}
res_reg = requests.post(f"{YII_BASE}/registrations", json=reg_payload, headers=get_headers("REGISTRATION"))
reg_data = res_reg.json().get('data', {}).get('registration', {})
runner.assert_test("3.1 Pendaftaran Kunjungan (POST /registrations)", 
                   res_reg.status_code == 201 and reg_data.get('queue_number'),
                   f"Nomor Antrean Terbit: {reg_data.get('queue_number')}, Status: {reg_data.get('status')}")

# 3.2 Duplicate Registration Protection (Scenario D.1 Guard)
res_dup = requests.post(f"{YII_BASE}/registrations", json=reg_payload, headers=get_headers("REGISTRATION"))
runner.assert_test("3.2 Proteksi Duplikasi Kunjungan Hari Ini (Skenario D.1 Guard)", 
                   res_dup.status_code == 409,
                   f"Expected HTTP 409 Conflict, Message: '{res_dup.json().get('message')}'")

# 3.3 Verify Bill Automatically Created with Registration Fee
res_init_bill = requests.get(f"{YII_BASE}/bills/registration/{reg_data['id']}", headers=get_headers("REGISTRATION"))
init_bill = res_init_bill.json().get('data', {})
runner.assert_test("3.3 Pembuatan Tagihan Awal Otomatis (Biaya Registrasi Rp 25.000)", 
                   res_init_bill.status_code == 200 and float(init_bill.get('registration_fee', 0)) == 25000.0,
                   f"Invoice: {init_bill.get('invoice_number')}, Total Awal: Rp {float(init_bill.get('total_amount', 0)):,.0f}")


# ==============================================================================
# SECTION 4: DOCTOR EXAMINATION, RME & AMENDMENT (SKENARIO D.4)
# ==============================================================================
print("\n[MODUL 4] REKAM MEDIS ELEKTRONIK (RME) & AMANDEMEN DIAGNOSIS (Skenario D.4)")

# 4.1 Fetch Doctor Waiting Queue
res_doc_queue = requests.get(f"{YII_BASE}/registrations?status=WAITING&clinic_id=2", headers=get_headers("DOCTOR"))
queue_items = res_doc_queue.json().get('data', {}).get('items', [])
runner.assert_test("4.1 Antrean Dokter Poli (GET /registrations?status=WAITING)", 
                   res_doc_queue.status_code == 200 and any(q['id'] == reg_data['id'] for q in queue_items),
                   f"Pasien {primary_patient['name']} terdaftar dalam antrean dokter")

# 4.2 Submit Medical Examination (EMR, ICD-10, Services, E-Prescription, Lab Request)
exam_payload = {
    "registration_id": reg_data["id"],
    "anamnesis": "Pasien mengeluh pusing dan kaku pada area leher belakang. Riwayat hipertensi sejak 1 tahun lalu.",
    "complaints": "Pusing, tengkuk tegang, pandangan berkunang-kunang",
    "systolic_bp": 140,
    "diastolic_bp": 90,
    "pulse_rate": 84,
    "respiratory_rate": 18,
    "body_temperature": 36.6,
    "weight_kg": 72.0,
    "height_cm": 170.0,
    "physical_examination": "Keadaan umum tampak sakit sedang, compos mentis. Suara jantung S1 S2 reguler, tidak ada gallop.",
    "primary_diagnosis": "Hipertensi Esensial (Primer)",
    "primary_icd10": "I10",
    "doctor_notes": "Istirahat cukup, kurangi konsumsi garam, kontrol ulang 1 bulan.",
    "services": [
        {"service_id": 1, "quantity": 1}, # Konsultasi Spesialis (Rp 150.000)
        {"service_id": 3, "quantity": 1}  # EKG Jantung (Rp 125.000)
    ],
    "medicines": [
        {"medicine_id": 1, "quantity": 10, "dosage": "10 mg", "frequency": "1 x 1 tablet pagi", "instructions": "Minum teratur setelah sarapan"},
        {"medicine_id": 2, "quantity": 10, "dosage": "16 mg", "frequency": "1 x 1 tablet malam", "instructions": "Minum sebelum tidur"}
    ],
    "lab_test_type": "Darah Rutin Lengkap (CBC) & Profil Lipid",
    "lab_clinical_indication": "Evaluasi komorbid kardiovaskular pada hipertensi stage 1",
    "lab_priority": "ROUTINE",
    "lab_fee": 150000.0
}
res_exam = requests.post(f"{YII_BASE}/examinations", json=exam_payload, headers=get_headers("DOCTOR"))
exam_data = res_exam.json().get('data', {})
runner.assert_test("4.2 Simpan Pemeriksaan Dokter & Resep/Lab Terpadu (POST /examinations)", 
                   res_exam.status_code == 201 and exam_data.get('examination', {}).get('id'),
                   f"RME ID: {exam_data.get('examination', {}).get('id')}, No. Resep: {exam_data.get('prescription', {}).get('prescription_number')}")

exam_id = exam_data.get('examination', {}).get('id')
prescription_id = exam_data.get('prescription', {}).get('id')
lab_req_id = exam_data.get('lab_request', {}).get('id')

# 4.3 Scenario D.4: Amendment / Addendum Audit Trail
amend_payload = {
    "reason": "Konfirmasi hasil pemeriksaan fisik dan anamnesis lanjutan menemukan tanda hiperkolesterolemia",
    "primary_diagnosis": "Hipertensi Esensial & Dislipidemia Campuran",
    "primary_icd10": "I10",
    "notes_amendment": "Tambahan diagnosis komorbid dislipidemia."
}
res_amend = requests.post(f"{YII_BASE}/examinations/{exam_id}/amend", json=amend_payload, headers=get_headers("DOCTOR"))
amend_id = res_amend.json().get('data', {}).get('amendment', {}).get('id')
runner.assert_test("4.3 Amandemen Diagnosis dengan Audit Trail (Skenario D.4)", 
                   res_amend.status_code == 200 and amend_id,
                   f"ID Amandemen: {amend_id}, Diagnosis Baru: Hipertensi & Dislipidemia")


# ==============================================================================
# SECTION 5: PHARMACY DISPENSING & STOCK LOCKING (SKENARIO D.2)
# ==============================================================================
print("\n[MODUL 5] FARMASI, DISPENSING & ATOMIC DECREMENT (Skenario D.2)")

# 5.1 Check Pending Prescription
res_rx = requests.get(f"{YII_BASE}/prescriptions/{prescription_id}", headers=get_headers("PHARMACY"))
rx_data = res_rx.json().get('data', {})
runner.assert_test("5.1 Lihat Resep Menunggu Telaah (GET /prescriptions/{id})", 
                   res_rx.status_code == 200 and rx_data.get('status') == "PENDING",
                   f"No Resep: {rx_data.get('prescription_number')}, Status: {rx_data.get('status')}")

# Record stock before dispense
med1_before = requests.get(f"{YII_BASE}/medicines/1", headers=get_headers("PHARMACY")).json().get('data', {}).get('stock')

# 5.2 Dispense Prescription (Pessimistic Lock & Atomic Decrement)
res_dispense = requests.post(f"{YII_BASE}/prescriptions/{prescription_id}/dispense", headers=get_headers("PHARMACY"))
med1_after = requests.get(f"{YII_BASE}/medicines/1", headers=get_headers("PHARMACY")).json().get('data', {}).get('stock')

runner.assert_test("5.2 Eksekusi Penyerahan Obat / Dispensing (Skenario D.2)", 
                   res_dispense.status_code == 200 and med1_after == (med1_before - 10),
                   f"Stok Amlodipine terpotong 10 tab: {med1_before} -> {med1_after}")


# ==============================================================================
# SECTION 6: LABORATORY & CIRCUIT BREAKER (SKENARIO D.5)
# ==============================================================================
print("\n[MODUL 6] LABORATORIUM & CIRCUIT BREAKER INTEGRATION (Skenario D.5)")

# 6.1 Read Lab Requests from Node Service
res_lab_reqs = requests.get(f"{NODE_BASE}/lab/requests", headers=get_headers("LAB"))
lab_list = res_lab_reqs.json().get('data', [])
runner.assert_test("6.1 Ambil Permintaan Lab dari Node.js Service (GET /lab/requests)", 
                   res_lab_reqs.status_code == 200 and len(lab_list) > 0,
                   f"Total Permintaan Lab: {len(lab_list)}")

# 6.2 Input Lab Test Results
results_payload = {
    "results": [
        {"test_name": "Hemoglobin (Hb)", "result_value": "14.5", "normal_range": "13.0 - 17.5", "unit": "g/dL", "interpretation": "NORMAL"},
        {"test_name": "Leukosit", "result_value": "7800", "normal_range": "4500 - 11000", "unit": "/uL", "interpretation": "NORMAL"},
        {"test_name": "Trombosit", "result_value": "275000", "normal_range": "150000 - 450000", "unit": "/uL", "interpretation": "NORMAL"},
        {"test_name": "Kolesterol Total", "result_value": "220", "normal_range": "< 200", "unit": "mg/dL", "interpretation": "ABNORMAL_HIGH"},
        {"test_name": "Trigliserida", "result_value": "165", "normal_range": "< 150", "unit": "mg/dL", "interpretation": "ABNORMAL_HIGH"}
    ]
}
target_lab_id = lab_req_id or (lab_list[0]['id'] if lab_list else 1)
res_lab_input = requests.put(f"{NODE_BASE}/lab/results/{target_lab_id}", json=results_payload, headers=get_headers("LAB"))
lab_res_data = res_lab_input.json().get('data', {})
lab_status = lab_res_data.get('lab_request', {}).get('status')
runner.assert_test("6.2 Input & Verifikasi Hasil Uji Lab (PUT /lab/results/{id})", 
                   res_lab_input.status_code == 200 and lab_status == "COMPLETED",
                   f"Lab Request ID {target_lab_id} Status: {lab_status}, Parameter: 5 Item")

# 6.3 External LIS Webhook Normal Test
res_cb_normal = requests.post(f"{NODE_BASE}/lab/external-integration/webhook", 
                              json={"simulate_error": False, "device": "Sysmex XN-550", "status": "OK"}, 
                              headers=get_headers("LAB"))
runner.assert_test("6.3 Integrasi LIS Normal (Circuit CLOSED)", 
                   res_cb_normal.status_code == 200 and res_cb_normal.json().get('circuit_status') == "CLOSED",
                   f"Circuit Status: {res_cb_normal.json().get('circuit_status')}")

# 6.4 External LIS Webhook Circuit Breaker Simulation (Scenario D.5)
res_cb_err = requests.post(f"{NODE_BASE}/lab/external-integration/webhook", 
                           json={"simulate_error": True, "device": "Sysmex XN-550", "status": "FAIL"}, 
                           headers=get_headers("LAB"))
runner.assert_test("6.4 Circuit Breaker & Fallback Protocol (Skenario D.5)", 
                   res_cb_err.status_code in [200, 502, 503] and res_cb_err.json().get('fallback_mechanism'),
                   f"Fallback: '{res_cb_err.json().get('fallback_mechanism')}'")


# ==============================================================================
# SECTION 7: BILLING & CASHIER IDEMPOTENCY KEY (SKENARIO D.3)
# ==============================================================================
print("\n[MODUL 7] BILLING & KASIR IDEMPOTENCY KEY (Skenario D.3)")

# 7.1 Inspect Updated Patient Bill
res_bill = requests.get(f"{YII_BASE}/bills/registration/{reg_data['id']}", headers=get_headers("CASHIER"))
bill_final = res_bill.json().get('data', {})
total_amount = float(bill_final.get('total_amount', 0))
runner.assert_test("7.1 Rekalkulasi Total Billing Terpadu (Kunjungan + Dokter + Obat + Lab)", 
                   res_bill.status_code == 200 and total_amount > 25000.0,
                   f"No. Invoice: {bill_final.get('invoice_number')}, Total: Rp {total_amount:,.0f}")

# 7.2 Process Cashier Payment with Idempotency Key
idemp_key = f"IDEMP-TEST-{bill_final['id']}-{int(time.time())}"
pay_payload = {
    "amount": total_amount,
    "payment_method": "QRIS",
    "payment_reference": f"QRIS-SIM-NMID-{int(time.time())}",
    "idempotency_key": idemp_key
}
res_pay1 = requests.post(f"{YII_BASE}/bills/{bill_final['id']}/pay", 
                         json=pay_payload, 
                         headers=get_headers("CASHIER", idempotency_key=idemp_key))
runner.assert_test("7.2 Proses Pembayaran Kasir (Skenario D.3)", 
                   res_pay1.status_code in [200, 201] and res_pay1.json().get('data', {}).get('payment_status') == "PAID",
                   f"Payment No: {res_pay1.json().get('data', {}).get('payment', {}).get('payment_number')}, Status: PAID")

# 7.3 Idempotency Key Guard: Duplicate Payment Protection
res_pay2 = requests.post(f"{YII_BASE}/bills/{bill_final['id']}/pay", 
                         json=pay_payload, 
                         headers=get_headers("CASHIER", idempotency_key=idemp_key))
runner.assert_test("7.3 Proteksi Pembayaran Ganda / Idempotency Retry (Skenario D.3 Guard)", 
                   res_pay2.status_code == 200 and res_pay2.json().get('data', {}).get('is_idempotent_replay') == True,
                   f"Idempotent Replay True, Tidak ada charge ganda!")

# 7.4 Print Official Struk / Invoice Details
res_invoice = requests.get(f"{YII_BASE}/bills/{bill_final['id']}/invoice", headers=get_headers("CASHIER"))
inv_data = res_invoice.json().get('data', {})
runner.assert_test("7.4 Cetak Struk Resmi & Invoice (GET /bills/{id}/invoice)", 
                   res_invoice.status_code == 200 and inv_data.get('patient', {}).get('name') == "Budi Hartono",
                   f"Invoice Resmi Terbit: {inv_data.get('invoice', {}).get('invoice_number')} untuk {inv_data.get('patient', {}).get('name')}")


# ==============================================================================
# SUMMARY REPORT
# ==============================================================================
print("\n" + "=" * 80)
print("📊 HASIL AKHIR PENGUJIAN MANUAL CRUD SIMRS INOVA MEDIKA")
print("=" * 80)
print(f"Total Test Cases : {runner.passed + runner.failed}")
print(f"Passed           : {runner.passed} ✅")
print(f"Failed           : {runner.failed} ❌")
print(f"Success Rate     : {(runner.passed / (runner.passed + runner.failed) * 100):.1f}%")
print("=" * 80)

if runner.failed > 0:
    sys.exit(1)
else:
    sys.exit(0)
