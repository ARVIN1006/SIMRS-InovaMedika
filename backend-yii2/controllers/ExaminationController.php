<?php

namespace app\controllers;

use Yii;
use app\models\Examination;
use app\models\ExaminationService;
use app\models\Registration;
use app\models\MedicalService;
use app\models\Prescription;
use app\models\PrescriptionItem;
use app\models\LabRequest;
use app\models\Bill;
use app\models\BillItem;
use app\models\AuditLog;
use app\models\ExaminationAmendment;

class ExaminationController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Examination::find()->with(['patient', 'doctor', 'registration', 'services', 'services.service', 'prescriptions', 'prescriptions.items', 'labRequests']);

        $doctorId = Yii::$app->request->get('doctor_id');
        if (!empty($doctorId)) {
            $query->andWhere(['doctor_id' => $doctorId]);
        }

        $patientId = Yii::$app->request->get('patient_id');
        if (!empty($patientId)) {
            $query->andWhere(['patient_id' => $patientId]);
        }

        $examinations = $query->orderBy(['id' => SORT_DESC])->limit(50)->all();
        return $this->sendSuccess($examinations, 'Daftar pemeriksaan berhasil diambil.');
    }

    public function actionHistoryByPatient($patientId)
    {
        $this->requireAuth();

        $examinations = Examination::find()
            ->with(['doctor', 'registration', 'registration.clinic', 'services', 'services.service', 'prescriptions', 'prescriptions.items', 'prescriptions.items.medicine', 'labRequests', 'labRequests.results'])
            ->where(['patient_id' => $patientId])
            ->orderBy(['id' => SORT_DESC])
            ->all();

        return $this->sendSuccess($examinations, 'Riwayat rekam medis pasien berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $exam = Examination::find()
            ->with(['patient', 'doctor', 'registration', 'registration.clinic', 'services', 'services.service', 'prescriptions', 'prescriptions.items', 'prescriptions.items.medicine', 'labRequests', 'labRequests.results'])
            ->where(['id' => $id])
            ->one();

        if (!$exam) {
            return $this->sendError('Data pemeriksaan tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($exam, 'Data pemeriksaan berhasil diambil.');
    }

    /**
     * Input Pemeriksaan Dokter, RME, Tindakan, Resep, dan Permintaan Lab
     */
    public function actionCreate()
    {
        $this->requireRoles(['ADMIN', 'DOCTOR']);

        $body = Yii::$app->request->getBodyParams();
        $registrationId = $body['registration_id'] ?? null;

        if (!$registrationId) {
            return $this->sendError('Registration ID wajib diisi.', null, 400);
        }

        $reg = Registration::findOne($registrationId);
        if (!$reg) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', null, 404);
        }

        // Cek apakah registrasi sudah diperiksa
        $existingExam = Examination::findOne(['registration_id' => $registrationId]);
        if ($existingExam) {
            return $this->sendError('Pemeriksaan untuk pendaftaran ini sudah dilakukan.', ['examination_id' => $existingExam->id], 400);
        }

        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            // 1. Simpan Rekam Medis Elektronik (RME)
            $exam = new Examination();
            $exam->registration_id = $reg->id;
            $exam->patient_id = $reg->patient_id;
            $exam->doctor_id = $reg->doctor_id;
            $exam->examination_date = date('Y-m-d H:i:s');
            $exam->anamnesis = $body['anamnesis'] ?? 'Pasien datang untuk pemeriksaan rawat jalan';
            $exam->complaints = $body['complaints'] ?? ($reg->notes ?: 'Keluhan umum');
            $exam->systolic_bp = !empty($body['systolic_bp']) ? (int)$body['systolic_bp'] : null;
            $exam->diastolic_bp = !empty($body['diastolic_bp']) ? (int)$body['diastolic_bp'] : null;
            $exam->pulse_rate = !empty($body['pulse_rate']) ? (int)$body['pulse_rate'] : null;
            $exam->respiratory_rate = !empty($body['respiratory_rate']) ? (int)$body['respiratory_rate'] : null;
            $exam->body_temperature = !empty($body['body_temperature']) ? (float)$body['body_temperature'] : null;
            $exam->weight_kg = !empty($body['weight_kg']) ? (float)$body['weight_kg'] : null;
            $exam->height_cm = !empty($body['height_cm']) ? (float)$body['height_cm'] : null;
            $exam->physical_examination = $body['physical_examination'] ?? 'Dalam batas normal';
            $exam->primary_diagnosis = $body['primary_diagnosis'] ?? 'Observasi Febris';
            $exam->primary_icd10 = $body['primary_icd10'] ?? 'R50.9';
            $exam->secondary_diagnosis = $body['secondary_diagnosis'] ?? null;
            $exam->secondary_icd10 = $body['secondary_icd10'] ?? null;
            $exam->doctor_notes = $body['doctor_notes'] ?? null;
            $exam->is_locked = false;

            if (!$exam->save()) {
                $transaction->rollBack();
                return $this->sendError('Gagal menyimpan rekam medis.', $exam->errors, 422);
            }

            // 2. Simpan Tindakan Medis (Jika Ada)
            $servicesTotal = 0.00;
            $services = $body['services'] ?? [];
            if (is_array($services)) {
                foreach ($services as $srvItem) {
                    $serviceId = $srvItem['service_id'] ?? null;
                    $quantity = (int)($srvItem['quantity'] ?? 1);
                    if (!$serviceId || $quantity < 1) continue;

                    $masterService = MedicalService::findOne($serviceId);
                    if (!$masterService) continue;

                    $unitPrice = (float)$masterService->price;
                    $subtotal = $unitPrice * $quantity;
                    $servicesTotal += $subtotal;

                    $examService = new ExaminationService();
                    $examService->examination_id = $exam->id;
                    $examService->service_id = $masterService->id;
                    $examService->quantity = $quantity;
                    $examService->unit_price = $unitPrice;
                    $examService->subtotal = $subtotal;
                    $examService->notes = $srvItem['notes'] ?? null;
                    $examService->save(false);
                }
            }

            // 3. Simpan Resep Obat (Jika Ada)
            $pharmacyTotal = 0.00;
            $medicines = $body['medicines'] ?? [];
            if (is_array($medicines) && count($medicines) > 0) {
                $dailyRxCount = (int)$db->createCommand(
                    'SELECT COUNT(*) FROM prescriptions WHERE DATE(created_at) = :today',
                    [':today' => date('Y-m-d')]
                )->queryScalar();
                $rxNumber = sprintf('RX/%s/%04d', date('Ymd'), $dailyRxCount + 1);

                $prescription = new Prescription();
                $prescription->examination_id = $exam->id;
                $prescription->prescription_number = $rxNumber;
                $prescription->doctor_id = $reg->doctor_id;
                $prescription->patient_id = $reg->patient_id;
                $prescription->status = 'PENDING';
                $prescription->total_amount = 0.00;
                $prescription->notes = $body['prescription_notes'] ?? null;
                $prescription->save(false);

                foreach ($medicines as $medItem) {
                    $medId = $medItem['medicine_id'] ?? null;
                    $qty = (int)($medItem['quantity'] ?? 1);
                    if (!$medId || $qty < 1) continue;

                    $med = \app\models\Medicine::findOne($medId);
                    if (!$med) continue;

                    $unitPrice = (float)$med->price;
                    $subtotal = $unitPrice * $qty;
                    $pharmacyTotal += $subtotal;

                    $rxItem = new PrescriptionItem();
                    $rxItem->prescription_id = $prescription->id;
                    $rxItem->medicine_id = $med->id;
                    $rxItem->dosage = $medItem['dosage'] ?? 'Sesuai petunjuk dokter';
                    $rxItem->frequency = $medItem['frequency'] ?? '3 x 1 hari sesudah makan';
                    $rxItem->route = $medItem['route'] ?? 'Oral';
                    $rxItem->quantity = $qty;
                    $rxItem->unit_price = $unitPrice;
                    $rxItem->subtotal = $subtotal;
                    $rxItem->instructions = $medItem['instructions'] ?? null;
                    $rxItem->save(false);
                }

                $prescription->total_amount = $pharmacyTotal;
                $prescription->save(false);
            }

            // 4. Simpan Permintaan Lab (Jika Ada)
            $labTotal = 0.00;
            if (!empty($body['lab_test_type'])) {
                $dailyLabCount = (int)$db->createCommand(
                    'SELECT COUNT(*) FROM lab_requests WHERE DATE(created_at) = :today',
                    [':today' => date('Y-m-d')]
                )->queryScalar();
                $labNumber = sprintf('LAB/%s/%04d', date('Ymd'), $dailyLabCount + 1);

                $labFee = (float)($body['lab_fee'] ?? 150000.00);
                $labTotal += $labFee;

                $labReq = new LabRequest();
                $labReq->examination_id = $exam->id;
                $labReq->patient_id = $reg->patient_id;
                $labReq->doctor_id = $reg->doctor_id;
                $labReq->request_number = $labNumber;
                $labReq->test_type = $body['lab_test_type'];
                $labReq->clinical_indication = $body['lab_clinical_indication'] ?? null;
                $labReq->priority = $body['lab_priority'] ?? 'ROUTINE';
                $labReq->status = 'REQUESTED';
                $labReq->total_amount = $labFee;
                $labReq->save(false);
            }

            // 5. Update Registration Status -> COMPLETED
            $reg->status = 'COMPLETED';
            $reg->save(false);

            // 6. Sinkronisasi Tagihan Pasien (Bill)
            $bill = Bill::findOne(['registration_id' => $reg->id]);
            if ($bill) {
                $bill->medical_services_total = $servicesTotal;
                $bill->pharmacy_total = $pharmacyTotal;
                $bill->lab_total = $labTotal;
                $bill->total_amount = $bill->registration_fee + $servicesTotal + $pharmacyTotal + $labTotal;
                $bill->balance_amount = $bill->total_amount - $bill->paid_amount;
                $bill->save(false);

                // Tambahkan Rincian Item Tagihan
                if ($servicesTotal > 0) {
                    $srvBillItem = new BillItem();
                    $srvBillItem->bill_id = $bill->id;
                    $srvBillItem->item_type = 'MEDICAL_SERVICE';
                    $srvBillItem->reference_id = $exam->id;
                    $srvBillItem->item_name = 'Tindakan Medis Poliklinik';
                    $srvBillItem->quantity = 1;
                    $srvBillItem->unit_price = $servicesTotal;
                    $srvBillItem->subtotal = $servicesTotal;
                    $srvBillItem->save(false);
                }

                if ($pharmacyTotal > 0) {
                    $rxBillItem = new BillItem();
                    $rxBillItem->bill_id = $bill->id;
                    $rxBillItem->item_type = 'PHARMACY';
                    $rxBillItem->reference_id = $exam->id;
                    $rxBillItem->item_name = 'Resep Obat & Farmasi';
                    $rxBillItem->quantity = 1;
                    $rxBillItem->unit_price = $pharmacyTotal;
                    $rxBillItem->subtotal = $pharmacyTotal;
                    $rxBillItem->save(false);
                }

                if ($labTotal > 0) {
                    $labBillItem = new BillItem();
                    $labBillItem->bill_id = $bill->id;
                    $labBillItem->item_type = 'LABORATORY';
                    $labBillItem->reference_id = $exam->id;
                    $labBillItem->item_name = 'Pemeriksaan Penunjang Laboratorium (' . $body['lab_test_type'] . ')';
                    $labBillItem->quantity = 1;
                    $labBillItem->unit_price = $labTotal;
                    $labBillItem->subtotal = $labTotal;
                    $labBillItem->save(false);
                }
            }

            AuditLog::log('examinations', $exam->id, 'INSERT', null, $exam->attributes);

            $transaction->commit();

            return $this->sendSuccess([
                'examination' => $exam,
                'prescription' => $prescription ?? null,
                'lab_request' => $labReq ?? null,
                'services_total' => $servicesTotal,
                'pharmacy_total' => $pharmacyTotal,
                'lab_total' => $labTotal,
                'bill' => $bill,
            ], 'Pemeriksaan dokter dan rekam medis berhasil disimpan.', 201);

        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Gagal menyimpan pemeriksaan: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Solusi Skenario D.4: Penanganan Perubahan Rekam Medis / Tindakan Pasca Billing
     */
    public function actionAmend($id)
    {
        $this->requireRoles(['ADMIN', 'DOCTOR']);

        $exam = Examination::findOne($id);
        if (!$exam) {
            return $this->sendError('Data pemeriksaan tidak ditemukan.', null, 404);
        }

        $body = Yii::$app->request->getBodyParams();
        $reason = trim($body['reason'] ?? '');
        if (empty($reason)) {
            return $this->sendError('Alasan revisi / amandemen (reason) wajib diisi untuk kepatuhan audit trail (Skenario D.4).', null, 400);
        }

        $bill = Bill::findOne(['registration_id' => $exam->registration_id]);

        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            $originalData = [
                'primary_diagnosis' => $exam->primary_diagnosis,
                'primary_icd10' => $exam->primary_icd10,
                'secondary_diagnosis' => $exam->secondary_diagnosis,
                'secondary_icd10' => $exam->secondary_icd10,
                'doctor_notes' => $exam->doctor_notes,
            ];

            $amendedData = [
                'primary_diagnosis' => $body['primary_diagnosis'] ?? $exam->primary_diagnosis,
                'primary_icd10' => $body['primary_icd10'] ?? $exam->primary_icd10,
                'secondary_diagnosis' => $body['secondary_diagnosis'] ?? $exam->secondary_diagnosis,
                'secondary_icd10' => $body['secondary_icd10'] ?? $exam->secondary_icd10,
                'doctor_notes' => ($exam->doctor_notes ? $exam->doctor_notes . "\n" : '') .
                    sprintf('[ADDENDUM REVISI %s]: %s (Alasan: %s)', date('d/m/Y H:i'), $body['notes_amendment'] ?? 'Perubahan diagnosis', $reason),
            ];

            // Simpan catatan amandemen resmi (Audit Trail D.4)
            $amendment = new ExaminationAmendment();
            $amendment->examination_id = $exam->id;
            $amendment->bill_id = $bill ? $bill->id : null;
            $amendment->requested_by = $this->currentUser->id;
            $amendment->reason = $reason;
            $amendment->original_data = json_encode($originalData);
            $amendment->amended_data = json_encode($amendedData);
            $amendment->cost_difference = 0.00;
            $amendment->status = 'APPROVED';
            $amendment->approved_by = $this->currentUser->id;
            $amendment->approved_at = date('Y-m-d H:i:s');
            $amendment->save(false);

            // Update data rekam medis dengan keterangan revisi
            $exam->primary_diagnosis = $amendedData['primary_diagnosis'];
            $exam->primary_icd10 = $amendedData['primary_icd10'];
            $exam->secondary_diagnosis = $amendedData['secondary_diagnosis'];
            $exam->secondary_icd10 = $amendedData['secondary_icd10'];
            $exam->doctor_notes = $amendedData['doctor_notes'];
            $exam->save(false);

            AuditLog::log('examinations', $exam->id, 'AMENDMENT', $originalData, $amendedData);

            $transaction->commit();

            return $this->sendSuccess([
                'amendment' => $amendment,
                'examination' => $exam,
            ], 'Revisi rekam medis (Addendum D.4) berhasil dicatat dan disetujui tanpa merusak integritas riwayat tagihan.');

        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Gagal memproses amandemen rekam medis: ' . $e->getMessage(), null, 500);
        }
    }
}
