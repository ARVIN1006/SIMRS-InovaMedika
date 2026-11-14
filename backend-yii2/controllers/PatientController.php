<?php

namespace app\controllers;

use Yii;
use app\models\Patient;
use app\models\AuditLog;

class PatientController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Patient::find();
        $search = Yii::$app->request->get('search');
        if (!empty($search)) {
            $query->andWhere([
                'or',
                ['ilike', 'name', $search],
                ['ilike', 'mr_number', $search],
                ['ilike', 'nik', $search],
                ['ilike', 'phone', $search],
            ]);
        }

        $limit = (int)Yii::$app->request->get('limit', 50);
        $offset = (int)Yii::$app->request->get('offset', 0);
        $total = $query->count();

        $patients = $query->orderBy(['id' => SORT_DESC])
            ->limit($limit)
            ->offset($offset)
            ->all();

        return $this->sendSuccess([
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'items' => $patients,
        ], 'Daftar pasien berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $patient = Patient::find()
            ->with(['registrations', 'registrations.clinic', 'registrations.doctor'])
            ->where(['id' => $id])
            ->one();

        if (!$patient) {
            return $this->sendError('Data pasien tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($patient, 'Data pasien berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN', 'REGISTRATION']);

        $patient = new Patient();
        $patient->load(Yii::$app->request->getBodyParams(), '');

        if (!$patient->validate()) {
            return $this->sendError('Validasi data pasien gagal.', $patient->errors, 422);
        }

        if ($patient->save()) {
            AuditLog::log('patients', $patient->id, 'INSERT', null, $patient->attributes);
            return $this->sendSuccess($patient, 'Pasien baru berhasil didaftarkan.', 201);
        }

        return $this->sendError('Gagal menyimpan data pasien.', $patient->errors, 500);
    }

    public function actionUpdate($id)
    {
        $this->requireRoles(['ADMIN', 'REGISTRATION']);

        $patient = Patient::findOne($id);
        if (!$patient) {
            return $this->sendError('Data pasien tidak ditemukan.', null, 404);
        }

        $oldAttributes = $patient->attributes;
        $patient->load(Yii::$app->request->getBodyParams(), '');

        if (!$patient->validate()) {
            return $this->sendError('Validasi data pasien gagal.', $patient->errors, 422);
        }

        if ($patient->save()) {
            AuditLog::log('patients', $patient->id, 'UPDATE', $oldAttributes, $patient->attributes);
            return $this->sendSuccess($patient, 'Data pasien berhasil diperbarui.');
        }

        return $this->sendError('Gagal memperbarui data pasien.', $patient->errors, 500);
    }

    public function actionDelete($id)
    {
        $this->requireRoles(['ADMIN']);

        $patient = Patient::findOne($id);
        if (!$patient) {
            return $this->sendError('Data pasien tidak ditemukan.', null, 404);
        }

        // Check if patient has active registrations
        if ($patient->getRegistrations()->count() > 0) {
            return $this->sendError('Pasien memiliki riwayat kunjungan aktif dan tidak dapat dihapus demi integritas rekam medis.', null, 400);
        }

        $oldAttributes = $patient->attributes;
        if ($patient->delete()) {
            AuditLog::log('patients', $id, 'DELETE', $oldAttributes, null);
            return $this->sendSuccess(null, 'Data pasien berhasil dihapus.');
        }

        return $this->sendError('Gagal menghapus data pasien.', null, 500);
    }
}
