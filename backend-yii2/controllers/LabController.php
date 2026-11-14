<?php

namespace app\controllers;

use Yii;
use app\models\LabRequest;
use app\models\LabResult;
use app\models\AuditLog;

class LabController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = LabRequest::find()->with(['patient', 'doctor', 'results']);

        $status = Yii::$app->request->get('status');
        if (!empty($status)) {
            $query->andWhere(['status' => $status]);
        }

        $requests = $query->orderBy(['id' => SORT_DESC])->limit(50)->all();
        return $this->sendSuccess($requests, 'Daftar permintaan laboratorium berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $req = LabRequest::find()
            ->with(['patient', 'doctor', 'results'])
            ->where(['id' => $id])
            ->one();

        if (!$req) {
            return $this->sendError('Permintaan laboratorium tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($req, 'Data permintaan laboratorium berhasil diambil.');
    }

    public function actionCreate()
    {
        $this->requireRoles(['ADMIN', 'DOCTOR']);

        $req = new LabRequest();
        $req->load(Yii::$app->request->getBodyParams(), '');

        if (!$req->validate()) {
            return $this->sendError('Validasi permintaan lab gagal.', $req->errors, 422);
        }

        if ($req->save()) {
            AuditLog::log('lab_requests', $req->id, 'INSERT', null, $req->attributes);
            return $this->sendSuccess($req, 'Permintaan pemeriksaan lab berhasil dibuat.', 201);
        }

        return $this->sendError('Gagal membuat permintaan lab.', $req->errors, 500);
    }

    public function actionUpdateResults($id)
    {
        $this->requireRoles(['ADMIN', 'LAB']);

        $req = LabRequest::findOne($id);
        if (!$req) {
            return $this->sendError('Permintaan lab tidak ditemukan.', null, 404);
        }

        $body = Yii::$app->request->getBodyParams();
        $results = $body['results'] ?? [];

        if (!is_array($results) || empty($results)) {
            return $this->sendError('Hasil pemeriksaan lab wajib diisi.', null, 400);
        }

        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            // Delete old results if any
            LabResult::deleteAll(['lab_request_id' => $id]);

            foreach ($results as $resItem) {
                $labResult = new LabResult();
                $labResult->lab_request_id = $id;
                $labResult->test_name = $resItem['test_name'] ?? 'Parameter Lab';
                $labResult->result_value = (string)($resItem['result_value'] ?? '');
                $labResult->normal_range = $resItem['normal_range'] ?? null;
                $labResult->unit = $resItem['unit'] ?? null;
                $labResult->interpretation = $resItem['interpretation'] ?? 'NORMAL';
                $labResult->notes = $resItem['notes'] ?? null;
                $labResult->performed_by = $this->currentUser->id;
                $labResult->verified_by = $this->currentUser->id;
                $labResult->completed_at = date('Y-m-d H:i:s');
                $labResult->save(false);
            }

            $req->status = 'COMPLETED';
            $req->completed_at = date('Y-m-d H:i:s');
            $req->save(false);

            AuditLog::log('lab_requests', $req->id, 'UPDATE', ['status' => 'REQUESTED'], ['status' => 'COMPLETED']);

            $transaction->commit();

            return $this->sendSuccess([
                'lab_request' => $req,
                'results_count' => count($results),
            ], 'Hasil pemeriksaan lab berhasil disimpan dan diverifikasi.');

        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Gagal menyimpan hasil lab: ' . $e->getMessage(), null, 500);
        }
    }
}
