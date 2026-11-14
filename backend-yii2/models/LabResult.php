<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class LabResult extends ActiveRecord
{
    public static function tableName()
    {
        return 'lab_results';
    }

    public function rules()
    {
        return [
            [['lab_request_id', 'test_name', 'result_value'], 'required'],
            [['lab_request_id', 'performed_by', 'verified_by'], 'integer'],
            [['test_name'], 'string', 'max' => 100],
            [['result_value', 'normal_range'], 'string', 'max' => 50],
            [['unit'], 'string', 'max' => 30],
            [['interpretation'], 'in', 'range' => ['NORMAL', 'ABNORMAL_LOW', 'ABNORMAL_HIGH', 'CRITICAL']],
            [['notes'], 'string'],
            [['completed_at', 'created_at', 'updated_at'], 'safe'],
        ];
    }
}
