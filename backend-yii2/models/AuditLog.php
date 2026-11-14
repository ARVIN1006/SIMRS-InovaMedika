<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

class AuditLog extends ActiveRecord
{
    public static function tableName()
    {
        return 'audit_logs';
    }

    public function rules()
    {
        return [
            [['table_name', 'record_id', 'action'], 'required'],
            [['record_id', 'performed_by'], 'integer'],
            [['table_name'], 'string', 'max' => 50],
            [['action'], 'string', 'max' => 20],
            [['ip_address'], 'string', 'max' => 45],
            [['old_values', 'new_values', 'created_at'], 'safe'],
        ];
    }

    public static function log($tableName, $recordId, $action, $oldValues = null, $newValues = null, $userId = null)
    {
        $log = new self();
        $log->table_name = $tableName;
        $log->record_id = (int)$recordId;
        $log->action = $action;
        $log->old_values = $oldValues ? json_encode($oldValues) : null;
        $log->new_values = $newValues ? json_encode($newValues) : null;
        $log->performed_by = $userId ?: (Yii::$app->user->id ?? null);
        $log->ip_address = Yii::$app->request->userIP ?? '127.0.0.1';
        $log->save(false);
    }
}
