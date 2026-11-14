<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class ExaminationService extends ActiveRecord
{
    public static function tableName()
    {
        return 'examination_services';
    }

    public function rules()
    {
        return [
            [['examination_id', 'service_id', 'unit_price', 'subtotal'], 'required'],
            [['examination_id', 'service_id', 'quantity'], 'integer'],
            [['unit_price', 'subtotal'], 'number', 'min' => 0],
            [['notes'], 'string'],
            [['created_at'], 'safe'],
        ];
    }

    public function getService()
    {
        return $this->hasOne(MedicalService::class, ['id' => 'service_id']);
    }
}
