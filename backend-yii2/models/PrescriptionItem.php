<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class PrescriptionItem extends ActiveRecord
{
    public static function tableName()
    {
        return 'prescription_items';
    }

    public function rules()
    {
        return [
            [['prescription_id', 'medicine_id', 'dosage', 'frequency', 'quantity', 'unit_price', 'subtotal'], 'required'],
            [['prescription_id', 'medicine_id', 'quantity'], 'integer', 'min' => 1],
            [['unit_price', 'subtotal'], 'number', 'min' => 0],
            [['dosage', 'frequency'], 'string', 'max' => 50],
            [['route'], 'string', 'max' => 30],
            [['instructions'], 'string'],
            [['created_at'], 'safe'],
        ];
    }

    public function getMedicine()
    {
        return $this->hasOne(Medicine::class, ['id' => 'medicine_id']);
    }
}
