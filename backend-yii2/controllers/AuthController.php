<?php

namespace app\controllers;

use Yii;
use app\models\User;

class AuthController extends BaseApiController
{
    public function actionLogin()
    {
        $body = Yii::$app->request->getBodyParams();
        $username = trim($body['username'] ?? '');
        $password = trim($body['password'] ?? '');

        if (empty($username) || empty($password)) {
            return $this->sendError('Username dan password wajib diisi.', null, 400);
        }

        $user = User::findByUsername($username);
        if (!$user || !$user->validatePassword($password)) {
            return $this->sendError('Kredensial login tidak valid. Silakan periksa username dan password Anda.', null, 401);
        }

        // Ensure access token exists; preserve seeded token so demo role switcher and frontend stay synchronized
        if (empty($user->access_token)) {
            $user->generateAccessToken();
            $user->save(false);
        }

        return $this->sendSuccess([
            'token' => $user->access_token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 'Login berhasil.');
    }

    public function actionMe()
    {
        $this->requireAuth();
        return $this->sendSuccess([
            'id' => $this->currentUser->id,
            'username' => $this->currentUser->username,
            'full_name' => $this->currentUser->full_name,
            'email' => $this->currentUser->email,
            'role' => $this->currentUser->role,
        ], 'Profil pengguna berhasil diambil.');
    }

    public function actionLogout()
    {
        $this->requireAuth();
        $this->currentUser->access_token = null;
        $this->currentUser->save(false);
        return $this->sendSuccess(null, 'Logout berhasil.');
    }
}
