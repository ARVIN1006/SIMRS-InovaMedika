<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class Patient extends ActiveRecord
{
    public static function tableName()
    {
        return 'patients';
    }

    public function rules()
    {
        return [
            [['nik', 'name', 'birth_date', 'gender', 'address'], 'required'],
            [['mr_number', 'nik'], 'unique'],
            [['birth_date', 'created_at', 'updated_at'], 'safe'],
            [['address', 'allergies'], 'string'],
            [['gender'], 'in', 'range' => ['L', 'P']],
            [['blood_type'], 'in', 'range' => ['A', 'B', 'AB', 'O', '-']],
            [['mr_number', 'phone', 'emergency_contact_phone'], 'string', 'max' => 30],
            [['nik'], 'string', 'min' => 16, 'max' => 16],
            [['name', 'email', 'emergency_contact_name'], 'string', 'max' => 100],
            [['email'], 'email'],
        ];
    }

    public function beforeSave($insert)
    {
        if (parent::beforeSave($insert)) {
            if ($insert && empty($this->mr_number)) {
                $this->mr_number = self::generateMrNumber();
            }
            $this->updated_at = date('Y-m-d H:i:s');
            return true;
        }
        return false;
    }

    public static function generateMrNumber()
    {
        $prefix = 'RM-' . date('Ym') . '-';
        $lastPatient = self::find()
            ->where(['like', 'mr_number', $prefix . '%', false])
            ->orderBy(['id' => SORT_DESC])
            ->one();

        if ($lastPatient && preg_match('/(\d+)$/', $lastPatient->mr_number, $matches)) {
            $nextSeq = intval($matches[1]) + 1;
        } else {
            $nextSeq = 1;
        }

        return $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    public function getRegistrations()
    {
        return $this->hasMany(Registration::class, ['patient_id' => 'id'])->orderBy(['id' => SORT_DESC]);
    }
}
