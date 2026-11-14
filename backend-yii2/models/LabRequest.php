<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class LabRequest extends ActiveRecord
{
    public static function tableName()
    {
        return 'lab_requests';
    }

    public function rules()
    {
        return [
            [['examination_id', 'patient_id', 'doctor_id', 'request_number', 'test_type'], 'required'],
            [['examination_id', 'patient_id', 'doctor_id'], 'integer'],
            [['request_number'], 'string', 'max' => 40],
            [['test_type'], 'string', 'max' => 100],
            [['priority'], 'in', 'range' => ['ROUTINE', 'CITO']],
            [['status'], 'in', 'range' => ['REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']],
            [['total_amount'], 'number', 'min' => 0],
            [['clinical_indication'], 'string'],
            [['requested_at', 'completed_at', 'created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getResults()
    {
        return $this->hasMany(LabResult::class, ['lab_request_id' => 'id']);
    }

    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
    }

    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }
}
