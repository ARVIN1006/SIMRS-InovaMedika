<?php

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '5432';
$dbname = getenv('DB_NAME') ?: 'simrs_db';
$user = getenv('DB_USER') ?: 'postgres';
$pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

return [
    'class' => \yii\db\Connection::class,
    'dsn' => "pgsql:host={$host};port={$port};dbname={$dbname}",
    'username' => $user,
    'password' => $pass,
    'charset' => 'utf8',

    // Schema cache options (for production environment)
    'enableSchemaCache' => false,
    'schemaCacheDuration' => 60,
    'schemaCache' => 'cache',
];
