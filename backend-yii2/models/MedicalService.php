<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class MedicalService extends ActiveRecord
{
    public static function tableName()
    {
        return 'medical_services';
    }

    public function rules()
    {
        return [
            [['code', 'name', 'category', 'price'], 'required'],
            [['code'], 'unique'],
            [['price'], 'number', 'min' => 0],
            [['description'], 'string'],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['code'], 'string', 'max' => 30],
            [['name'], 'string', 'max' => 150],
            [['category'], 'string', 'max' => 50],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }
}
