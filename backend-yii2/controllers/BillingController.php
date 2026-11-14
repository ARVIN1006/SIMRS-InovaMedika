<?php

namespace app\controllers;

use Yii;
use app\models\Bill;
use app\models\BillItem;
use app\models\Payment;
use app\models\AuditLog;
use yii\db\Exception as DbException;

class BillingController extends BaseApiController
{
    public function actionIndex()
    {
        $this->requireAuth();

        $query = Bill::find()->with(['patient', 'registration', 'registration.clinic', 'registration.doctor']);

        $status = Yii::$app->request->get('status');
        if (!empty($status)) {
            $query->andWhere(['payment_status' => $status]);
        }

        $search = Yii::$app->request->get('search');
        if (!empty($search)) {
            $query->joinWith('patient');
            $query->andWhere([
                'or',
                ['ilike', 'bills.invoice_number', $search],
                ['ilike', 'patients.name', $search],
                ['ilike', 'patients.mr_number', $search],
            ]);
        }

        $bills = $query->orderBy(['bills.id' => SORT_DESC])->limit(50)->all();
        return $this->sendSuccess($bills, 'Daftar tagihan berhasil diambil.');
    }

    public function actionByRegistration($regId)
    {
        $this->requireAuth();

        $bill = Bill::find()
            ->with(['patient', 'registration', 'registration.clinic', 'registration.doctor', 'items', 'payments', 'payments.cashier'])
            ->where(['registration_id' => $regId])
            ->one();

        if (!$bill) {
            return $this->sendError('Tagihan untuk pendaftaran ini tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($bill, 'Data tagihan berhasil diambil.');
    }

    public function actionView($id)
    {
        $this->requireAuth();

        $bill = Bill::find()
            ->with(['patient', 'registration', 'registration.clinic', 'registration.doctor', 'items', 'payments', 'payments.cashier'])
            ->where(['id' => $id])
            ->one();

        if (!$bill) {
            return $this->sendError('Tagihan tidak ditemukan.', null, 404);
        }

        return $this->sendSuccess($bill, 'Data tagihan berhasil diambil.');
    }

    /**
     * Detail Invoice Lengkap untuk Kebutuhan Cetak Struk / Invoice Resmi
     */
    public function actionInvoiceDetails($id)
    {
        $this->requireAuth();

        $bill = Bill::find()
            ->with([
                'patient',
                'registration',
                'registration.clinic',
                'registration.doctor',
                'items',
                'payments',
                'payments.cashier',
            ])
            ->where(['id' => $id])
            ->one();

        if (!$bill) {
            return $this->sendError('Invoice tidak ditemukan.', null, 404);
        }

        $invoiceData = [
            'hospital' => [
                'name' => 'RS INOVA MEDIKA SOLUSINDO',
                'address' => 'Jl. Pelayanan Kesehatan No. 88, Bandung, Jawa Barat',
                'phone' => '(022) 7654321',
                'email' => 'info@inovamedika.com',
            ],
            'invoice' => [
                'id' => $bill->id,
                'invoice_number' => $bill->invoice_number,
                'created_at' => $bill->created_at,
                'payment_status' => $bill->payment_status,
                'total_amount' => (float)$bill->total_amount,
                'paid_amount' => (float)$bill->paid_amount,
                'balance_amount' => (float)$bill->balance_amount,
            ],
            'patient' => [
                'mr_number' => $bill->patient->mr_number,
                'name' => $bill->patient->name,
                'nik' => $bill->patient->nik,
                'gender' => $bill->patient->gender === 'L' ? 'Laki-laki' : 'Perempuan',
                'birth_date' => $bill->patient->birth_date,
                'phone' => $bill->patient->phone,
                'address' => $bill->patient->address,
            ],
            'registration' => [
                'registration_number' => $bill->registration->registration_number,
                'queue_number' => $bill->registration->queue_number,
                'clinic_name' => $bill->registration->clinic->name,
                'doctor_name' => $bill->registration->doctor->name,
                'payment_type' => $bill->registration->payment_type,
            ],
            'items' => array_map(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => $item->item_type,
                    'name' => $item->item_name,
                    'quantity' => (int)$item->quantity,
                    'unit_price' => (float)$item->unit_price,
                    'subtotal' => (float)$item->subtotal,
                ];
            }, $bill->items),
            'payments' => array_map(function ($p) {
                return [
                    'payment_number' => $p->payment_number,
                    'payment_date' => $p->payment_date,
                    'amount' => (float)$p->amount,
                    'payment_method' => $p->payment_method,
                    'reference' => $p->payment_reference,
                    'idempotency_key' => $p->idempotency_key,
                    'cashier' => $p->cashier ? $p->cashier->full_name : 'Kasir',
                ];
            }, $bill->payments),
        ];

        return $this->sendSuccess($invoiceData, 'Detail invoice berhasil diambil.');
    }

    /**
     * Proses Pembayaran Kasir
     * Mengimplementasikan Solusi Skenario D.3 (Pencegahan Pembayaran Ganda & Idempotency Key)
     */
    public function actionProcessPayment($id)
    {
        $this->requireRoles(['ADMIN', 'CASHIER']);

        $body = Yii::$app->request->getBodyParams();
        $headers = Yii::$app->request->headers;

        // Ambil Idempotency Key dari Header atau Body (Kebutuhan Skenario D.3)
        $idempotencyKey = $headers->get('X-Idempotency-Key') ?: ($body['idempotency_key'] ?? null);
        if (empty($idempotencyKey)) {
            return $this->sendError('Header atau parameter X-Idempotency-Key wajib disertakan untuk menjamin integritas transaksi (Skenario D.3).', null, 400);
        }

        // STEP 1: FAST PATH IDEMPOTENCY CHECK (Skenario D.3)
        // Jika idempotency_key sudah pernah diproses, kembalikan data pembayaran yang sama tanpa eksekusi ulang
        $existingPayment = Payment::findOne(['idempotency_key' => $idempotencyKey]);
        if ($existingPayment) {
            return $this->sendSuccess([
                'payment' => $existingPayment,
                'is_idempotent_replay' => true,
                'notice' => 'Pencegahan Pembayaran Ganda (D.3): Transaksi dengan Idempotency Key ini telah berhasil diproses sebelumnya. Sistem mengembalikan data transaksi tanpa menduplikasi pemotongan atau pencatatan.',
            ], 'Transaksi pembayaran telah tersimpan sebelumnya (Idempotent response).', 200);
        }

        $db = Yii::$app->db;
        $transaction = $db->beginTransaction();

        try {
            // STEP 2: PESSIMISTIC LOCKING PADA TAGIHAN
            $bill = Bill::find()->where(['id' => $id])->one();
            if (!$bill) {
                $transaction->rollBack();
                return $this->sendError('Tagihan tidak ditemukan.', null, 404);
            }

            // Lock the bill record to serialize payments
            $lockedBill = $db->createCommand(
                'SELECT id, total_amount, paid_amount, balance_amount, payment_status FROM bills WHERE id = :id FOR UPDATE',
                [':id' => $id]
            )->queryOne();

            if ($lockedBill['payment_status'] === 'PAID') {
                $transaction->rollBack();
                return $this->sendError(
                    'Pencegahan Pembayaran Berlebih (D.3): Tagihan ini sudah berstatus LUNAS (PAID). Pembayaran tidak dapat diproses lagi.',
                    ['current_status' => 'PAID'],
                    400
                );
            }

            $amount = (float)($body['amount'] ?? 0);
            $paymentMethod = $body['payment_method'] ?? 'CASH';
            $paymentReference = $body['payment_reference'] ?? null;
            $notes = $body['notes'] ?? null;

            $currentBalance = (float)$lockedBill['balance_amount'];

            if ($amount <= 0) {
                $transaction->rollBack();
                return $this->sendError('Jumlah pembayaran harus lebih dari Rp 0.', null, 400);
            }

            if ($amount > $currentBalance) {
                $amount = $currentBalance; // Cap to exact remaining balance
            }

            // Generate Payment Number PAY/YYYYMMDD/XXXX
            $dailyPayCount = (int)$db->createCommand(
                'SELECT COUNT(*) FROM payments WHERE DATE(created_at) = :today',
                [':today' => date('Y-m-d')]
            )->queryScalar();
            $payNumber = sprintf('PAY/%s/%04d', date('Ymd'), $dailyPayCount + 1);

            // STEP 3: CATAT TRANSAKSI PEMBAYARAN
            $payment = new Payment();
            $payment->bill_id = (int)$id;
            $payment->payment_number = $payNumber;
            $payment->payment_date = date('Y-m-d H:i:s');
            $payment->amount = $amount;
            $payment->payment_method = $paymentMethod;
            $payment->payment_reference = $paymentReference;
            $payment->idempotency_key = $idempotencyKey;
            $payment->cashier_id = $this->currentUser->id;
            $payment->notes = $notes;

            if (!$payment->save()) {
                $transaction->rollBack();
                return $this->sendError('Gagal menyimpan transaksi pembayaran.', $payment->errors, 422);
            }

            // STEP 4: PERBARUI STATUS BILL
            $newPaid = (float)$lockedBill['paid_amount'] + $amount;
            $newBalance = (float)$lockedBill['total_amount'] - $newPaid;
            $newStatus = ($newBalance <= 0) ? 'PAID' : 'PARTIAL';

            $bill->paid_amount = $newPaid;
            $bill->balance_amount = max(0, $newBalance);
            $bill->payment_status = $newStatus;
            $bill->save(false);

            AuditLog::log('payments', $payment->id, 'PAYMENT', null, $payment->attributes);

            $transaction->commit();

            return $this->sendSuccess([
                'payment' => $payment,
                'bill' => $bill,
                'payment_status' => $newStatus,
            ], 'Pembayaran berhasil diproses. Status tagihan: ' . $newStatus, 201);

        } catch (DbException $e) {
            $transaction->rollBack();
            // Handle unique constraint violation on idempotency_key
            if (strpos($e->getMessage(), 'payments_idempotency_key_key') !== false) {
                $existingPayment = Payment::findOne(['idempotency_key' => $idempotencyKey]);
                return $this->sendSuccess([
                    'payment' => $existingPayment,
                    'is_idempotent_replay' => true,
                    'notice' => 'Pencegahan Pembayaran Ganda (D.3 - Unique Constraint): Transaksi dengan Idempotency Key ini telah diproses oleh thread lain.',
                ], 'Transaksi pembayaran telah tersimpan sebelumnya.', 200);
            }
            return $this->sendError('Database error: ' . $e->getMessage(), null, 500);
        } catch (\Exception $e) {
            $transaction->rollBack();
            return $this->sendError('Terjadi kesalahan saat memproses pembayaran: ' . $e->getMessage(), null, 500);
        }
    }
}
