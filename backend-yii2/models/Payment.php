<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Payment extends ActiveRecord
{
    public static function tableName()
    {
        return 'payments';
    }

    public function rules()
    {
        return [
            [['bill_id', 'payment_number', 'amount', 'payment_method', 'idempotency_key'], 'required'],
            [['bill_id', 'cashier_id'], 'integer'],
            [['amount'], 'number', 'min' => 0.01],
            [['payment_number'], 'string', 'max' => 40],
            [['idempotency_key', 'payment_reference'], 'string', 'max' => 100],
            [['idempotency_key'], 'unique'],
            [['payment_method'], 'in', 'range' => ['CASH', 'QRIS', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER']],
            [['notes'], 'string'],
            [['payment_date', 'created_at'], 'safe'],
        ];
    }

    public function getBill()
    {
        return $this->hasOne(Bill::class, ['id' => 'bill_id']);
    }

    public function getCashier()
    {
        return $this->hasOne(User::class, ['id' => 'cashier_id']);
    }
}
