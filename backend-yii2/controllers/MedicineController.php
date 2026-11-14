<?php

namespace app\controllers;

use Yii;
use app\models\Medicine;
use app\models\AuditLog;

class MedicineController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Medicine::find();
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

        $medicines = $query->orderBy(['name' => SORT_ASC])->all();
        return $this->sendSuccess($medicines, 'Daftar obat berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();
        $medicine = Medicine::findOne($id);
        if (!$medicine) {
            return $this->sendError('Obat tidak ditemukan.', null, 404);
        }
        return $this->sendSuccess($medicine, 'Data obat berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN', 'PHARMACY']);
        $medicine = new Medicine();
        $medicine->load(Yii::$app->request->getBodyParams(), '');

        if (!$medicine->validate()) {
            return $this->sendError('Validasi data obat gagal.', $medicine->errors, 422);
        }

        if ($medicine->save()) {
            AuditLog::log('medicines', $medicine->id, 'INSERT', null, $medicine->attributes);
            return $this->sendSuccess($medicine, 'Obat berhasil ditambahkan.', 201);
        }
        return $this->sendError('Gagal menambahkan obat.', $medicine->errors, 500);
    }

    public function actionUpdate($id)
    {
        $this->requireRoles(['ADMIN', 'PHARMACY']);
        $medicine = Medicine::findOne($id);
        if (!$medicine) {
            return $this->sendError('Obat tidak ditemukan.', null, 404);
        }

        $oldAttributes = $medicine->attributes;
        $medicine->load(Yii::$app->request->getBodyParams(), '');
        if ($medicine->save()) {
            AuditLog::log('medicines', $medicine->id, 'UPDATE', $oldAttributes, $medicine->attributes);
            return $this->sendSuccess($medicine, 'Data obat berhasil diperbarui.');
        }
        return $this->sendError('Gagal memperbarui data obat.', $medicine->errors, 422);
    }

    public function actionDelete($id)
    {
        $this->requireRoles(['ADMIN']);
        $medicine = Medicine::findOne($id);
        if (!$medicine) {
            return $this->sendError('Obat tidak ditemukan.', null, 404);
        }
        $medicine->status = 'INACTIVE';
        $medicine->save(false);
        return $this->sendSuccess(null, 'Obat dinonaktifkan.');
    }
}
