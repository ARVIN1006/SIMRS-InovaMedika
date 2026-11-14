<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Registration extends ActiveRecord
{
    public static function tableName()
    {
        return 'registrations';
    }

    public function rules()
    {
        return [
            [['patient_id', 'clinic_id', 'doctor_id'], 'required'],
            [['patient_id', 'clinic_id', 'doctor_id', 'schedule_id', 'queue_seq', 'created_by'], 'integer'],
            [['registration_date', 'created_at', 'updated_at'], 'safe'],
            [['registration_fee'], 'number', 'min' => 0],
            [['payment_type'], 'in', 'range' => ['UMUM', 'BPJS', 'ASURANSI_SWASTA']],
            [['status'], 'in', 'range' => ['WAITING', 'IN_EXAMINATION', 'COMPLETED', 'CANCELLED']],
            [['notes'], 'string'],
            [['registration_number'], 'string', 'max' => 40],
            [['queue_number'], 'string', 'max' => 20],
        ];
    }

    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
    }

    public function getClinic()
    {
        return $this->hasOne(Clinic::class, ['id' => 'clinic_id']);
    }

    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }

    public function getExamination()
    {
        return $this->hasOne(Examination::class, ['registration_id' => 'id']);
    }

    public function getBill()
    {
        return $this->hasOne(Bill::class, ['registration_id' => 'id']);
    }
}
