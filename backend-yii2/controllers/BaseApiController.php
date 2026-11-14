<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use app\models\User;

class BaseApiController extends Controller
{
    /**
     * @var User|null
     */
    public $currentUser = null;

    public function beforeAction($action)
    {
        // Handle preflight OPTIONS requests directly
        if (Yii::$app->request->isOptions) {
            Yii::$app->response->statusCode = 200;
            Yii::$app->response->data = ['status' => 'OK'];
            return false;
        }

        if (!parent::beforeAction($action)) {
            return false;
        }

        // Authenticate via Bearer Token if provided
        $authHeader = Yii::$app->request->headers->get('Authorization');
        if ($authHeader && preg_match('/^Bearer\s+(.*?)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
            $user = User::findIdentityByAccessToken($token);
            if ($user) {
                $this->currentUser = $user;
                Yii::$app->user->login($user);
            }
        }

        return true;
    }

    protected function requireAuth()
    {
        if (!$this->currentUser) {
            Yii::$app->response->statusCode = 401;
            Yii::$app->response->data = [
                'success' => false,
                'message' => 'Autentikasi gagal. Token Bearer tidak valid atau telah kedaluwarsa.',
                'data' => null,
            ];
            Yii::$app->end();
        }
        return true;
    }

    protected function requireRoles(array $allowedRoles)
    {
        $this->requireAuth();

        if (!in_array($this->currentUser->role, $allowedRoles) && $this->currentUser->role !== 'ADMIN') {
            Yii::$app->response->statusCode = 403;
            Yii::$app->response->data = [
                'success' => false,
                'message' => 'Akses ditolak. Peran Anda (' . $this->currentUser->role . ') tidak memiliki wewenang untuk tindakan ini.',
                'data' => null,
            ];
            Yii::$app->end();
        }
        return true;
    }

    protected function sendSuccess($data = null, $message = 'Success', $code = 200)
    {
        Yii::$app->response->statusCode = $code;
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];
    }

    protected function sendError($message = 'An error occurred', $errors = null, $code = 400)
    {
        Yii::$app->response->statusCode = $code;
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'data' => null,
        ];
    }
}
