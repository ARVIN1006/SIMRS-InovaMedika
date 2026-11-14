<?php

namespace app\controllers;

use Yii;
use app\models\Doctor;
use app\models\DoctorSchedule;
use app\models\AuditLog;

class DoctorController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Doctor::find()->with(['clinic', 'schedules']);
        $clinicId = Yii::$app->request->get('clinic_id');
        if (!empty($clinicId)) {
            $query->andWhere(['clinic_id' => $clinicId]);
        }

        $doctors = $query->orderBy(['id' => SORT_ASC])->all();
        return $this->sendSuccess($doctors, 'Daftar dokter berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();
        $doctor = Doctor::find()->with(['clinic', 'schedules'])->where(['id' => $id])->one();
        if (!$doctor) {
            return $this->sendError('Data dokter tidak ditemukan.', null, 404);
        }
        return $this->sendSuccess($doctor, 'Data dokter berhasil diambil.');
    }

    public function actionSchedules()
    {
        $this->requireAuth();
        $query = DoctorSchedule::find()->with(['doctor', 'clinic']);

        $clinicId = Yii::$app->request->get('clinic_id');
        if (!empty($clinicId)) {
            $query->andWhere(['clinic_id' => $clinicId]);
        }

        $day = Yii::$app->request->get('day');
        if (!empty($day)) {
            $query->andWhere(['day_of_week' => $day]);
        }

        $schedules = $query->orderBy(['id' => SORT_ASC])->all();
        return $this->sendSuccess($schedules, 'Jadwal praktik dokter berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN']);
        $doctor = new Doctor();
        $doctor->load(Yii::$app->request->getBodyParams(), '');

        if (!$doctor->validate()) {
            return $this->sendError('Validasi data dokter gagal.', $doctor->errors, 422);
        }

        if ($doctor->save()) {
            AuditLog::log('doctors', $doctor->id, 'INSERT', null, $doctor->attributes);
            return $this->sendSuccess($doctor, 'Data dokter berhasil ditambahkan.', 201);
        }
        return $this->sendError('Gagal menambahkan data dokter.', $doctor->errors, 500);
    }

    public function actionUpdate($id)
    {
        $this->requireRoles(['ADMIN']);
        $doctor = Doctor::findOne($id);
        if (!$doctor) {
            return $this->sendError('Data dokter tidak ditemukan.', null, 404);
        }

        $oldAttributes = $doctor->attributes;
        $doctor->load(Yii::$app->request->getBodyParams(), '');
        if ($doctor->save()) {
            AuditLog::log('doctors', $doctor->id, 'UPDATE', $oldAttributes, $doctor->attributes);
            return $this->sendSuccess($doctor, 'Data dokter berhasil diperbarui.');
        }
        return $this->sendError('Gagal memperbarui data dokter.', $doctor->errors, 422);
    }

    public function actionDelete($id)
    {
        $this->requireRoles(['ADMIN']);
        $doctor = Doctor::findOne($id);
        if (!$doctor) {
            return $this->sendError('Data dokter tidak ditemukan.', null, 404);
        }
        $doctor->status = 'INACTIVE';
        $doctor->save(false);
        return $this->sendSuccess(null, 'Dokter dinonaktifkan.');
    }
}
