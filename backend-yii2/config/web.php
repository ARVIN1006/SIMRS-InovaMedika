<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$config = [
    'id' => 'simrs-api',
    'name' => 'SIMRS PT Inova Medika Solusindo',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => 'simrs-inova-medika-secret-key-2026',
            'enableCsrfValidation' => false,
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'response' => [
            'format' => \yii\web\Response::FORMAT_JSON,
            'charset' => 'UTF-8',
            'on beforeSend' => function ($event) {
                $response = $event->sender;
                // Add standard CORS headers for all responses
                $headers = $response->headers;
                $headers->set('Access-Control-Allow-Origin', '*');
                $headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                $headers->set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Idempotency-Key');
                $headers->set('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');

                // Ensure options pre-flight returns 200 OK
                if (Yii::$app->request->isOptions) {
                    $response->statusCode = 200;
                    $response->data = ['status' => 'OK'];
                }
            },
        ],
        'cache' => [
            'class' => \yii\caching\FileCache::class,
        ],
        'user' => [
            'identityClass' => \app\models\User::class,
            'enableAutoLogin' => false,
            'enableSession' => false,
            'loginUrl' => null,
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => \yii\log\FileTarget::class,
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'db' => $db,
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'enableStrictParsing' => false,
            'rules' => [
                // Options preflight catch-all
                'OPTIONS <url:.*>' => 'site/options',

                // Authentication
                'POST api/auth/login' => 'auth/login',
                'GET api/auth/me' => 'auth/me',
                'POST api/auth/logout' => 'auth/logout',

                // Master Data Patients
                'GET api/patients' => 'patient/index',
                'POST api/patients' => 'patient/create',
                'GET api/patients/<id:\d+>' => 'patient/view',
                'PUT api/patients/<id:\d+>' => 'patient/update',
                'DELETE api/patients/<id:\d+>' => 'patient/delete',

                // Master Data Doctors & Schedules
                'GET api/doctors' => 'doctor/index',
                'POST api/doctors' => 'doctor/create',
                'GET api/doctors/<id:\d+>' => 'doctor/view',
                'PUT api/doctors/<id:\d+>' => 'doctor/update',
                'DELETE api/doctors/<id:\d+>' => 'doctor/delete',
                'GET api/doctor-schedules' => 'doctor/schedules',

                // Master Data Clinics
                'GET api/clinics' => 'clinic/index',
                'POST api/clinics' => 'clinic/create',
                'GET api/clinics/<id:\d+>' => 'clinic/view',
                'PUT api/clinics/<id:\d+>' => 'clinic/update',
                'DELETE api/clinics/<id:\d+>' => 'clinic/delete',

                // Master Data Medical Services (Tindakan)
                'GET api/services' => 'medical-service/index',
                'POST api/services' => 'medical-service/create',
                'GET api/services/<id:\d+>' => 'medical-service/view',
                'PUT api/services/<id:\d+>' => 'medical-service/update',
                'DELETE api/services/<id:\d+>' => 'medical-service/delete',

                // Master Data Medicines
                'GET api/medicines' => 'medicine/index',
                'POST api/medicines' => 'medicine/create',
                'GET api/medicines/<id:\d+>' => 'medicine/view',
                'PUT api/medicines/<id:\d+>' => 'medicine/update',
                'DELETE api/medicines/<id:\d+>' => 'medicine/delete',

                // Registration & Queue
                'GET api/registrations' => 'registration/index',
                'POST api/registrations' => 'registration/create',
                'GET api/registrations/<id:\d+>' => 'registration/view',
                'PUT api/registrations/<id:\d+>/status' => 'registration/update-status',
                'GET api/registrations/today-queue' => 'registration/today-queue',

                // Doctor Examination & Medical Records (RME)
                'GET api/examinations' => 'examination/index',
                'POST api/examinations' => 'examination/create',
                'GET api/examinations/<id:\d+>' => 'examination/view',
                'PUT api/examinations/<id:\d+>' => 'examination/update',
                'POST api/examinations/<id:\d+>/amend' => 'examination/amend', // D.4
                'GET api/examinations/patient/<patientId:\d+>' => 'examination/history-by-patient',

                // Pharmacy & Prescriptions
                'GET api/prescriptions' => 'pharmacy/index',
                'GET api/prescriptions/<id:\d+>' => 'pharmacy/view',
                'POST api/prescriptions/<id:\d+>/dispense' => 'pharmacy/dispense', // D.2 Pessimistic lock

                // Billing & Payments
                'GET api/bills' => 'billing/index',
                'GET api/bills/<id:\d+>' => 'billing/view',
                'GET api/bills/registration/<regId:\d+>' => 'billing/by-registration',
                'POST api/bills/<id:\d+>/pay' => 'billing/process-payment', // D.3 Idempotency
                'GET api/bills/<id:\d+>/invoice' => 'billing/invoice-details',

                // Lab Integration Bridge (for communication with Node.js service)
                'GET api/lab-requests' => 'lab/index',
                'POST api/lab-requests' => 'lab/create',
                'GET api/lab-requests/<id:\d+>' => 'lab/view',
                'PUT api/lab-requests/<id:\d+>/results' => 'lab/update-results',

                // Root health check
                'GET api/health' => 'site/health',
            ],
        ],
    ],
    'params' => $params,
];

return $config;
