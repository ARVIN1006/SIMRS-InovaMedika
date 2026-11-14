<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class BillItem extends ActiveRecord
{
    public static function tableName()
    {
        return 'bill_items';
    }

    public function rules()
    {
        return [
            [['bill_id', 'item_type', 'item_name', 'quantity', 'unit_price', 'subtotal'], 'required'],
            [['bill_id', 'reference_id', 'quantity'], 'integer'],
            [['item_type'], 'in', 'range' => ['REGISTRATION', 'MEDICAL_SERVICE', 'PHARMACY', 'LABORATORY']],
            [['item_name'], 'string', 'max' => 150],
            [['unit_price', 'subtotal'], 'number', 'min' => 0],
            [['created_at'], 'safe'],
        ];
    }
}
