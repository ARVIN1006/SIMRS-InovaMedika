<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;

class SiteController extends Controller
{
    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        return ['status' => 'OK'];
    }

    public function actionHealth()
    {
        $dbStatus = 'OK';
        try {
            Yii::$app->db->createCommand('SELECT 1')->execute();
        } catch (\Exception $e) {
            $dbStatus = 'FAIL: ' . $e->getMessage();
        }

        return [
            'success' => true,
            'message' => 'SIMRS PT Inova Medika Solusindo Core API is operational.',
            'data' => [
                'service' => 'SIMRS Yii2 Backend Core',
                'version' => '2.0.55',
                'php_version' => PHP_VERSION,
                'db_status' => $dbStatus,
                'server_time' => date('Y-m-d H:i:s'),
                'timezone' => date_default_timezone_get(),
            ],
        ];
    }

    public function actionError()
    {
        $exception = Yii::$app->errorHandler->exception;
        $statusCode = $exception ? ($exception->statusCode ?? 500) : 500;
        $message = $exception ? $exception->getMessage() : 'An unexpected error occurred.';

        Yii::$app->response->statusCode = $statusCode;
        return [
            'success' => false,
            'message' => $message,
            'data' => null,
            'code' => $statusCode,
        ];
    }
}
