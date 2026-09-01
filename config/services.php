<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'authorize_net' => [
        'api_login_id' => env('AUTHORIZE_API_LOGIN_ID'),
        'transaction_key' => env('AUTHORIZE_TRANSACTION_KEY'),
        'client_key' => env('AUTHORIZE_CLIENT_KEY'),
        'sandbox' => filter_var(env('AUTHORIZE_SANDBOX', true), FILTER_VALIDATE_BOOLEAN),
    ],

    'taxjar' => [
        'api_key' => env('TAXJAR_API_KEY'),
        'sandbox' => filter_var(env('TAXJAR_SANDBOX', false), FILTER_VALIDATE_BOOLEAN),
    ],

];
