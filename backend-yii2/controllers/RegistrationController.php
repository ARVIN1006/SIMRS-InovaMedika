<?php

namespace app\controllers;

use Yii;
use app\models\Registration;
use app\models\Patient;
use app\models\Clinic;
use app\models\Doctor;
use app\models\Bill;
use app\models\BillItem;
use app\models\AuditLog;
use yii\db\Exception as DbException;

class RegistrationController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Registration::find()->with(['patient', 'clinic', 'doctor', 'examination', 'bill']);

        $date = Yii::$app->request->get('date');
        if (!empty($date)) {
            $query->andWhere(['registration_date' => $date]);
        }

        $clinicId = Yii::$app->request->get('clinic_id');
        if (!empty($clinicId)) {
            $query->andWhere(['clinic_id' => $clinicId]);
        }

        $status = Yii::$app->request->get('status');
        if (!empty($status)) {
            $query->andWhere(['status' => $status]);
        }

        $search = Yii::$app->request->get('search');
        if (!empty($search)) {
            $query->joinWith('patient');
            $query->andWhere([
                'or',
                ['ilike', 'patients.name', $search],
                ['ilike', 'patients.mr_number', $search],
                ['ilike', 'registrations.registration_number', $search],
                ['ilike', 'registrations.queue_number', $search],
            ]);
        }

        $limit = (int)Yii::$app->request->get('limit', 50);
        $offset = (int)Yii::$app->request->get('offset', 0);
        $total = $query->count();

        $registrations = $query->orderBy(['registrations.id' => SORT_DESC])
            ->limit($limit)
            ->offset($offset)
            ->all();

        return $this->sendSuccess([
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'items' => $registrations,
        ], 'Daftar pendaftaran berhasil diambil.');
    }

    public function actionTodayQueue()
    {
        $this->requireAuth();

        $today = date('Y-m-d');
        $query = Registration::find()
            ->with(['patient', 'clinic', 'doctor'])
            ->where(['registration_date' => $today]);

        $clinicId = Yii::$app->request->get('clinic_id');
        if (!empty($clinicId)) {
            $query->andWhere(['clinic_id' => $clinicId]);
        }

        $queue = $query->orderBy(['clinic_id' => SORT_ASC, 'queue_seq' => SORT_ASC])->all();
        return $this->sendSuccess($queue, 'Daftar antrean hari ini berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $registration = Registration::find()
            ->with(['patient', 'clinic', 'doctor', 'examination', 'examination.services', 'examination.prescriptions', 'examination.labRequests', 'bill', 'bill.payments'])
            ->where(['id' => $id])
            ->one();

        if (!$registration) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($registration, 'Data pendaftaran berhasil diambil.');
    }

    /**
     * Pendaftaran Pasien Baru / Kunjungan Rawat Jalan
     * Mengimplementasikan Solusi Skenario D.1 (Pencegahan Duplikasi & Race Condition Antrean)
     */
    public function actionCreate()
    {
        $this->requireRoles(['ADMIN', 'REGISTRATION']);

        $body = Yii::$app->request->getBodyParams();
        $patientId = $body['patient_id'] ?? null;
        $clinicId = $body['clinic_id'] ?? null;
        $doctorId = $body['doctor_id'] ?? null;
        $scheduleId = $body['schedule_id'] ?? null;
        $paymentType = $body['payment_type'] ?? 'UMUM';
        $notes = $body['notes'] ?? null;
        $registrationDate = $body['registration_date'] ?? date('Y-m-d');

        if (!$patientId || !$clinicId || !$doctorId) {
            return $this->sendError('Patient ID, Clinic ID, dan Doctor ID wajib diisi.', null, 400);
        }

        $patient = Patient::findOne($patientId);
        if (!$patient) {
            return $this->sendError('Data pasien tidak ditemukan.', null, 404);
        }

        $clinic = Clinic::findOne($clinicId);
        if (!$clinic) {
            return $this->sendError('Data poliklinik tidak ditemukan.', null, 404);
        }

        $doctor = Doctor::findOne($doctorId);
        if (!$doctor) {
            return $this->sendError('Data dokter tidak ditemukan.', null, 404);
        }

        // DATABASE TRANSACTION WITH CONCURRENCY SAFEGUARDS (Scenario D.1)
        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            // 1. Double-Check Lock: Cek apakah pasien sudah terdaftar di poli yang sama pada hari yang sama
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
                    "Pencegahan Duplikasi (D.1): Pasien '{$patient->name}' (No. RM: {$patient->mr_number}) sudah terdaftar di {$clinic->name} pada tanggal {$registrationDate} dengan No Antrean: {$existing->queue_number}.",
                    ['existing_registration_id' => $existing->id],
                    409 // 409 Conflict
                );
            }

            // 2. Queue sequence calculation with atomic safety
            // Ekstrak kode poli untuk prefix antrean (e.g. POLI-UMU -> UMU)
            $codeParts = explode('-', $clinic->code);
            $prefix = strtoupper(end($codeParts));
            if (strlen($prefix) > 4) {
                $prefix = substr($prefix, 0, 3);
            }

            // Query MAX queue_seq for this clinic and date
            $maxSeq = (int)$db->createCommand(
                'SELECT COALESCE(MAX(queue_seq), 0) FROM registrations WHERE clinic_id = :clinic_id AND registration_date = :reg_date',
                [':clinic_id' => $clinicId, ':reg_date' => $registrationDate]
            )->queryScalar();

            $nextSeq = $maxSeq + 1;
            $queueNumber = sprintf('%s-%03d', $prefix, $nextSeq);

            // 3. Generate Registration Number REG/YYYYMMDD/XXXX
            $dateClean = str_replace('-', '', $registrationDate);
            $dailyCount = (int)$db->createCommand(
                'SELECT COUNT(*) FROM registrations WHERE registration_date = :reg_date',
                [':reg_date' => $registrationDate]
            )->queryScalar();
            $regNumber = sprintf('REG/%s/%04d', $dateClean, $dailyCount + 1);

            // 4. Create and Save Registration
            $reg = new Registration();
            $reg->registration_number = $regNumber;
            $reg->patient_id = (int)$patientId;
            $reg->clinic_id = (int)$clinicId;
            $reg->doctor_id = (int)$doctorId;
            $reg->schedule_id = $scheduleId ? (int)$scheduleId : null;
            $reg->registration_date = $registrationDate;
            $reg->queue_number = $queueNumber;
            $reg->queue_seq = $nextSeq;
            $reg->registration_fee = 25000.00;
            $reg->payment_type = $paymentType;
            $reg->status = 'WAITING';
            $reg->notes = $notes;
            $reg->created_by = $this->currentUser->id;

            if (!$reg->save()) {
                $transaction->rollBack();
                return $this->sendError('Gagal menyimpan pendaftaran.', $reg->errors, 422);
            }

            // 5. Inisialisasi Billing Rekam Medis (Biaya Pendaftaran Awal)
            $dailyBillCount = (int)$db->createCommand(
                'SELECT COUNT(*) FROM bills WHERE DATE(created_at) = :today',
                [':today' => date('Y-m-d')]
            )->queryScalar();
            $invNumber = sprintf('INV/%s/%04d', date('Ymd'), $dailyBillCount + 1);

            $bill = new Bill();
            $bill->registration_id = $reg->id;
            $bill->patient_id = $patient->id;
            $bill->invoice_number = $invNumber;
            $bill->registration_fee = 25000.00;
            $bill->medical_services_total = 0.00;
            $bill->pharmacy_total = 0.00;
            $bill->lab_total = 0.00;
            $bill->total_amount = 25000.00;
            $bill->paid_amount = 0.00;
            $bill->balance_amount = 25000.00;
            $bill->payment_status = 'UNPAID';

            if (!$bill->save()) {
                $transaction->rollBack();
                return $this->sendError('Gagal menginisialisasi tagihan pendaftaran.', $bill->errors, 500);
            }

            // Tambahkan rincian bill item
            $billItem = new BillItem();
            $billItem->bill_id = $bill->id;
            $billItem->item_type = 'REGISTRATION';
            $billItem->reference_id = $reg->id;
            $billItem->item_name = 'Biaya Administrasi & Pendaftaran Pasien';
            $billItem->quantity = 1;
            $billItem->unit_price = 25000.00;
            $billItem->subtotal = 25000.00;
            $billItem->save(false);

            AuditLog::log('registrations', $reg->id, 'INSERT', null, $reg->attributes);

            $transaction->commit();

            return $this->sendSuccess([
                'registration' => $reg,
                'patient' => $patient,
                'clinic' => $clinic,
                'doctor' => $doctor,
                'bill' => $bill,
            ], 'Pendaftaran pasien berhasil. Nomor antrean: ' . $queueNumber, 201);

        } catch (DbException $e) {
            $transaction->rollBack();
            // Handle PostgreSQL unique violation code 23505
            if (strpos($e->getMessage(), 'uq_patient_clinic_date') !== false || strpos($e->getMessage(), '23505') !== false) {
                return $this->sendError(
                    "Pencegahan Duplikasi (D.1 - Database Constraint): Pasien '{$patient->name}' telah terdaftar di poliklinik ini pada hari yang sama.",
                    null,
                    409
                );
            }
            return $this->sendError('Database error: ' . $e->getMessage(), null, 500);
        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Terjadi kesalahan: ' . $e->getMessage(), null, 500);
        }
    }

    public function actionUpdateStatus($id)
    {
        $this->requireRoles(['ADMIN', 'REGISTRATION', 'DOCTOR']);

        $reg = Registration::findOne($id);
        if (!$reg) {
            return $this->sendError('Pendaftaran tidak ditemukan.', null, 404);
        }

        $body = Yii::$app->request->getBodyParams();
        $newStatus = $body['status'] ?? null;

        if (!in_array($newStatus, ['WAITING', 'IN_EXAMINATION', 'COMPLETED', 'CANCELLED'])) {
            return $this->sendError('Status tidak valid.', null, 400);
        }

        $oldStatus = $reg->status;
        $reg->status = $newStatus;
        $reg->save(false);

        AuditLog::log('registrations', $reg->id, 'UPDATE', ['status' => $oldStatus], ['status' => $newStatus]);
        return $this->sendSuccess($reg, "Status antrean diubah menjadi {$newStatus}.");
    }
}
