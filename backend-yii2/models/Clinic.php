<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Clinic extends ActiveRecord
{
    public static function tableName()
    {
        return 'clinics';
    }

    public function rules()
    {
        return [
            [['code', 'name'], 'required'],
            [['code'], 'unique'],
            [['description'], 'string'],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['code'], 'string', 'max' => 20],
            [['name', 'location'], 'string', 'max' => 100],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }

    public function getDoctors()
    {
        return $this->hasMany(Doctor::class, ['clinic_id' => 'id']);
    }
}
