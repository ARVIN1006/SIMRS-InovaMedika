<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Prescription extends ActiveRecord
{
    public static function tableName()
    {
        return 'prescriptions';
    }

    public function rules()
    {
        return [
            [['examination_id', 'prescription_number', 'doctor_id', 'patient_id'], 'required'],
            [['examination_id', 'doctor_id', 'patient_id', 'dispensed_by'], 'integer'],
            [['prescription_number'], 'string', 'max' => 40],
            [['status'], 'in', 'range' => ['PENDING', 'DISPENSED', 'CANCELLED']],
            [['total_amount'], 'number', 'min' => 0],
            [['notes'], 'string'],
            [['dispensed_at', 'created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getItems()
    {
        return $this->hasMany(PrescriptionItem::class, ['prescription_id' => 'id']);
    }

    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
    }

    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }

    public function getDispenser()
    {
        return $this->hasOne(User::class, ['id' => 'dispensed_by']);
    }
}
