<?php

return [
    'api_version' => env('UPS_API_VERSION', 'v2409'),
    'sandbox_url' => env('UPS_SANDBOX_URL', 'https://wwwcie.ups.com'),
    'production_url' => env('UPS_PRODUCTION_URL', 'https://onlinetools.ups.com'),
    'default_package_weight_lbs' => (float) env('UPS_DEFAULT_PACKAGE_WEIGHT_LBS', 2),
];
