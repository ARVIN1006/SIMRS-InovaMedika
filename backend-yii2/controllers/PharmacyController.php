<?php

namespace app\controllers;

use Yii;
use app\models\Prescription;
use app\models\Medicine;
use app\models\AuditLog;
use yii\db\Exception as DbException;

class PharmacyController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Prescription::find()
            ->with(['patient', 'doctor', 'dispenser', 'items', 'items.medicine']);

        $status = Yii::$app->request->get('status');
        if (!empty($status)) {
            $query->andWhere(['status' => $status]);
        }

        $prescriptions = $query->orderBy(['id' => SORT_DESC])->limit(50)->all();
        return $this->sendSuccess($prescriptions, 'Daftar resep farmasi berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $rx = Prescription::find()
            ->with(['patient', 'doctor', 'dispenser', 'items', 'items.medicine'])
            ->where(['id' => $id])
            ->one();

        if (!$rx) {
            return $this->sendError('Data resep tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($rx, 'Data resep berhasil diambil.');
    }

    /**
     * Penyerahan Obat (Dispense)
     * Mengimplementasikan Solusi Skenario D.2 (Pencegahan Konkurensi Stok Obat & Stok Minus)
     */
    public function actionDispense($id)
    {
        $this->requireRoles(['ADMIN', 'PHARMACY']);

        $rx = Prescription::findOne($id);
        if (!$rx) {
            return $this->sendError('Data resep tidak ditemukan.', null, 404);
        }

        if ($rx->status === 'DISPENSED') {
            return $this->sendError('Resep ini sudah pernah diserahkan (Dispensed) sebelumnya.', null, 400);
        }

        $items = $rx->items;
        if (empty($items)) {
            return $this->sendError('Resep tidak memiliki item obat.', null, 400);
        }

        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            // STEP 1 & 2: PESSIMISTIC LOCKING & ATOMIC DECREMENT (Scenario D.2)
            foreach ($items as $item) {
                // Lock the medicine row explicitly in PostgreSQL
                $med = $db->createCommand(
                    'SELECT id, name, stock, min_stock FROM medicines WHERE id = :id FOR UPDATE',
                    [':id' => $item->medicine_id]
                )->queryOne();

                if (!$med) {
                    $transaction->rollBack();
                    return $this->sendError("Obat dengan ID {$item->medicine_id} tidak ditemukan.", null, 404);
                }

                $currentStock = (int)$med['stock'];
                $requiredQty = (int)$item->quantity;

                // Cek ketersediaan stok
                if ($currentStock < $requiredQty) {
                    $transaction->rollBack();
                    return $this->sendError(
                        "Pencegahan Stok Minus (D.2): Stok obat '{$med['name']}' tidak mencukupi untuk memenuhi resep. Sisa stok: {$currentStock}, Kebutuhan: {$requiredQty}.",
                        [
                            'medicine_id' => $med['id'],
                            'medicine_name' => $med['name'],
                            'available_stock' => $currentStock,
                            'required_quantity' => $requiredQty,
                        ],
                        400
                    );
                }

                // Atomic decrement with condition check WHERE stock >= :qty
                $updatedRows = $db->createCommand(
                    'UPDATE medicines SET stock = stock - :qty, updated_at = CURRENT_TIMESTAMP WHERE id = :id AND stock >= :qty',
                    [':id' => $item->medicine_id, ':qty' => $requiredQty]
                )->execute();

                if ($updatedRows === 0) {
                    $transaction->rollBack();
                    return $this->sendError(
                        "Konkurensi Terdeteksi (D.2): Terjadi perubahan stok obat '{$med['name']}' secara bersamaan oleh transaksi lain. Transaksi dibatalkan secara aman.",
                        null,
                        409
                    );
                }

                // Audit log dispensing
                AuditLog::log(
                    'medicines',
                    $med['id'],
                    'DISPENSE',
                    ['stock' => $currentStock],
                    ['stock' => $currentStock - $requiredQty, 'prescription_id' => $rx->id]
                );
            }

            // STEP 3: Tandai Resep sebagai DISPENSED
            $rx->status = 'DISPENSED';
            $rx->dispensed_by = $this->currentUser->id;
            $rx->dispensed_at = date('Y-m-d H:i:s');
            $rx->save(false);

            AuditLog::log('prescriptions', $rx->id, 'UPDATE', ['status' => 'PENDING'], ['status' => 'DISPENSED']);

            $transaction->commit();

            return $this->sendSuccess([
                'prescription' => $rx,
                'items_count' => count($items),
            ], 'Obat berhasil diserahkan (Dispensed). Stok telah diperbarui secara aman.');

        } catch (DbException $e) {
            $transaction->rollBack();
            return $this->sendError('Database error saat memproses penyerahan obat: ' . $e->getMessage(), null, 500);
        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Terjadi kesalahan: ' . $e->getMessage(), null, 500);
        }
    }
}
