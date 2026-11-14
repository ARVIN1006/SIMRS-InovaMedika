<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class DoctorSchedule extends ActiveRecord
{
    public static function tableName()
    {
        return 'doctor_schedules';
    }

    public function rules()
    {
        return [
            [['doctor_id', 'clinic_id', 'day_of_week', 'start_time', 'end_time'], 'required'],
            [['doctor_id', 'clinic_id', 'quota'], 'integer'],
            [['day_of_week'], 'in', 'range' => ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['start_time', 'end_time', 'created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getDoctor()
    {
        return $this->hasOne(Doctor::class, ['id' => 'doctor_id']);
    }

    public function getClinic()
    {
        return $this->hasOne(Clinic::class, ['id' => 'clinic_id']);
    }
}
