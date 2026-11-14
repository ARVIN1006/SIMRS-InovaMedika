<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Examination extends ActiveRecord
{
    public static function tableName()
    {
        return 'examinations';
    }

    public function rules()
    {
        return [
            [['registration_id', 'patient_id', 'doctor_id', 'anamnesis', 'complaints', 'primary_diagnosis', 'primary_icd10'], 'required'],
            [['registration_id', 'patient_id', 'doctor_id', 'systolic_bp', 'diastolic_bp', 'pulse_rate', 'respiratory_rate'], 'integer'],
            [['body_temperature', 'weight_kg', 'height_cm'], 'number'],
            [['anamnesis', 'complaints', 'physical_examination', 'primary_diagnosis', 'secondary_diagnosis', 'doctor_notes'], 'string'],
            [['primary_icd10', 'secondary_icd10'], 'string', 'max' => 20],
            [['is_locked'], 'boolean'],
            [['examination_date', 'locked_at', 'created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getPatient()
    {
        return $this->hasOne(Patient::class, ['id' => 'patient_id']);
    }

    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }

    public function getRegistration()
    {
        return $this->hasOne(Registration::class, ['id' => 'registration_id']);
    }

    public function getServices()
    {
        return $this->hasMany(ExaminationService::class, ['examination_id' => 'id']);
    }

    public function getPrescriptions()
    {
        return $this->hasMany(Prescription::class, ['examination_id' => 'id']);
    }

    public function getLabRequests()
    {
        return $this->hasMany(LabRequest::class, ['examination_id' => 'id']);
    }
}
