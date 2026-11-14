<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class ExaminationAmendment extends ActiveRecord
{
    public static function tableName()
    {
        return 'examination_amendments';
    }

    public function rules()
    {
        return [
            [['examination_id', 'requested_by', 'reason', 'original_data', 'amended_data'], 'required'],
            [['examination_id', 'bill_id', 'requested_by', 'approved_by'], 'integer'],
            [['reason'], 'string'],
            [['cost_difference'], 'number'],
            [['status'], 'in', 'range' => ['PENDING_APPROVAL', 'APPROVED', 'REJECTED']],
            [['approved_at', 'created_at'], 'safe'],
        ];
    }

    public function getExamination()
    {
        return $this->hasOne(Examination::class, ['id' => 'examination_id']);
    }

    public function getRequester()
    {
        return $this->hasOne(User::class, ['id' => 'requested_by']);
    }
}
