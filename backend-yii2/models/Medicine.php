<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Medicine extends ActiveRecord
{
    public static function tableName()
    {
        return 'medicines';
    }

    public function rules()
    {
        return [
            [['code', 'name', 'category', 'unit', 'price'], 'required'],
            [['code'], 'unique'],
            [['stock', 'min_stock'], 'integer', 'min' => 0],
            [['price'], 'number', 'min' => 0],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['code', 'unit'], 'string', 'max' => 30],
            [['name'], 'string', 'max' => 150],
            [['category'], 'string', 'max' => 50],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }
}
