<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

class User extends ActiveRecord implements IdentityInterface
{
    public static function tableName()
    {
        return 'users';
    }

    public function rules()
    {
        return [
            [['username', 'full_name', 'email', 'role'], 'required'],
            [['role'], 'in', 'range' => ['ADMIN', 'REGISTRATION', 'DOCTOR', 'PHARMACY', 'LAB', 'CASHIER']],
            [['status'], 'in', 'range' => ['ACTIVE', 'INACTIVE']],
            [['email'], 'email'],
            [['username', 'email'], 'unique'],
            [['created_at', 'updated_at'], 'safe'],
        ];
    }

    public function fields()
    {
        $fields = parent::fields();
        unset($fields['password_hash'], $fields['auth_key']);
        return $fields;
    }

    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => 'ACTIVE']);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        if (empty($token)) {
            return null;
        }
        return static::findOne(['access_token' => $token, 'status' => 'ACTIVE']);
    }

    public static function findByUsername($username)
    {
        return static::findOne(['username' => $username, 'status' => 'ACTIVE']);
    }

    public function getId()
    {
        return $this->id;
    }

    public function getAuthKey()
    {
        return $this->auth_key;
    }

    public function validateAuthKey($authKey)
    {
        return $this->auth_key === $authKey;
    }

    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString(32);
    }

    public function generateAccessToken()
    {
        $this->access_token = 'simrs_' . bin2hex(random_bytes(24));
    }
}
