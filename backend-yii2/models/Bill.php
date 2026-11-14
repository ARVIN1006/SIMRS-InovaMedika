<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Bill extends ActiveRecord
{
    public static function tableName()
    {
        return 'bills';
    }

    public function rules()
    {
        return [
            [['registration_id', 'patient_id', 'invoice_number'], 'required'],
            [['registration_id', 'patient_id'], 'integer'],
            [['invoice_number'], 'string', 'max' => 40],
            [['registration_fee', 'medical_services_total', 'pharmacy_total', 'lab_total', 'total_amount', 'paid_amount', 'balance_amount'], 'number', 'min' => 0],
            [['payment_status'], 'in', 'range' => ['UNPAID', 'PARTIAL', 'PAID']],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getItems()
    {
        return $this->hasMany(BillItem::class, ['bill_id' => 'id']);
    }

    public function getPayments()
    {
        return $this->hasMany(Payment::class, ['bill_id' => 'id'])->orderBy(['id' => SORT_ASC]);
    }

    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
    }

    public function getRegistration()
    {
        return $this->hasOne(Registration::class, ['id' => 'registration_id']);
    }
}
