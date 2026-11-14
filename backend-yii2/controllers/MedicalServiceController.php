<?php

namespace app\controllers;

use Yii;
use app\models\MedicalService;
use app\models\AuditLog;

class MedicalServiceController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = MedicalService::find();
        $search = Yii::$app->request->get('search');
        if (!empty($search)) {
            $query->andWhere([
                'or',
                ['ilike', 'name', $search],
                ['ilike', 'code', $search],
                ['ilike', 'category', $search],
            ]);
        }

        $category = Yii::$app->request->get('category');
        if (!empty($category)) {
            $query->andWhere(['category' => $category]);
        }

        $services = $query->orderBy(['id' => SORT_ASC])->all();
        return $this->sendSuccess($services, 'Daftar tindakan medis berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();
        $service = MedicalService::findOne($id);
        if (!$service) {
            return $this->sendError('Tindakan medis tidak ditemukan.', null, 404);
        }
        return $this->sendSuccess($service, 'Tindakan medis berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN']);
        $service = new MedicalService();
        $service->load(Yii::$app->request->getBodyParams(), '');

        if (!$service->validate()) {
            return $this->sendError('Validasi tindakan medis gagal.', $service->errors, 422);
        }

        if ($service->save()) {
            AuditLog::log('medical_services', $service->id, 'INSERT', null, $service->attributes);
            return $this->sendSuccess($service, 'Tindakan medis berhasil ditambahkan.', 201);
        }
        return $this->sendError('Gagal menambahkan tindakan medis.', $service->errors, 500);
    }

    public function actionUpdate($id)
    {
        $this->requireRoles(['ADMIN']);
        $service = MedicalService::findOne($id);
        if (!$service) {
            return $this->sendError('Tindakan medis tidak ditemukan.', null, 404);
        }

        $oldAttributes = $service->attributes;
        $service->load(Yii::$app->request->getBodyParams(), '');
        if ($service->save()) {
            AuditLog::log('medical_services', $service->id, 'UPDATE', $oldAttributes, $service->attributes);
            return $this->sendSuccess($service, 'Tindakan medis berhasil diperbarui.');
        }
        return $this->sendError('Gagal memperbarui tindakan medis.', $service->errors, 422);
    }

    public function actionDelete($id)
    {
        $this->requireRoles(['ADMIN']);
        $service = MedicalService::findOne($id);
        if (!$service) {
            return $this->sendError('Tindakan medis tidak ditemukan.', null, 404);
        }
        $service->status = 'INACTIVE';
        $service->save(false);
        return $this->sendSuccess(null, 'Tindakan medis dinonaktifkan.');
    }
}
