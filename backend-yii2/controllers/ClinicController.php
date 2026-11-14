<?php

namespace app\controllers;

use Yii;
use app\models\Clinic;
use app\models\AuditLog;

class ClinicController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Clinic::find();
        $status = Yii::$app->request->get('status');
        if (!empty($status)) {
            $query->andWhere(['status' => $status]);
        }

        $clinics = $query->with('doctors')->orderBy(['id' => SORT_ASC])->all();
        return $this->sendSuccess($clinics, 'Daftar poliklinik berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();
        $clinic = Clinic::find()->with('doctors')->where(['id' => $id])->one();
        if (!$clinic) {
            return $this->sendError('Data poliklinik tidak ditemukan.', null, 404);
        }
        return $this->sendSuccess($clinic, 'Data poliklinik berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN']);
        $clinic = new Clinic();
        $clinic->load(Yii::$app->request->getBodyParams(), '');

        if (!$clinic->validate()) {
            return $this->sendError('Validasi data poliklinik gagal.', $clinic->errors, 422);
        }

        if ($clinic->save()) {
            AuditLog::log('clinics', $clinic->id, 'INSERT', null, $clinic->attributes);
            return $this->sendSuccess($clinic, 'Poliklinik berhasil ditambahkan.', 201);
        }
        return $this->sendError('Gagal menambahkan poliklinik.', $clinic->errors, 500);
    }

    public function actionUpdate($id)
    {
        $this->requireRoles(['ADMIN']);
        $clinic = Clinic::findOne($id);
        if (!$clinic) {
            return $this->sendError('Data poliklinik tidak ditemukan.', null, 404);
        }

        $oldAttributes = $clinic->attributes;
        $clinic->load(Yii::$app->request->getBodyParams(), '');
        if ($clinic->save()) {
            AuditLog::log('clinics', $clinic->id, 'UPDATE', $oldAttributes, $clinic->attributes);
            return $this->sendSuccess($clinic, 'Data poliklinik berhasil diperbarui.');
        }
        return $this->sendError('Gagal memperbarui poliklinik.', $clinic->errors, 422);
    }

    public function actionDelete($id)
    {
        $this->requireRoles(['ADMIN']);
        $clinic = Clinic::findOne($id);
        if (!$clinic) {
            return $this->sendError('Data poliklinik tidak ditemukan.', null, 404);
        }
        $clinic->status = 'INACTIVE';
        $clinic->save(false);
        return $this->sendSuccess(null, 'Poliklinik dinonaktifkan.');
    }
}
