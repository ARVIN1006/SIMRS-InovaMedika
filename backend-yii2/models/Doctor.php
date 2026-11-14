<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Doctor extends ActiveRecord
{
    public static function tableName()
    {
        return 'doctors';
    }

    public function rules()
    {
        return [
            [['clinic_id', 'sip_number', 'name', 'specialization'], 'required'],
            [['user_id', 'clinic_id'], 'integer'],
            [['sip_number'], 'unique'],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['sip_number', 'phone'], 'string', 'max' => 50],
            [['name', 'specialization'], 'string', 'max' => 100],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getClinic()
    {
        return $this->hasOne(Clinic::class, ['id' => 'clinic_id']);
    }

    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }

    public function getSchedules()
    {
        return $this->hasMany(DoctorSchedule::class, ['doctor_id' => 'id']);
    }
}
