<?php

return [
    /*
    |--------------------------------------------------------------------------
    | UPS Shipping
    |--------------------------------------------------------------------------
    |
    | Prefer environment variables for credentials and environment switching.
    | Admin Settings remain a fallback for local/legacy configuration and for
    | ship-from address / promotional thresholds.
    |
    | LIVE switch: set UPS_ENVIRONMENT=production and production credentials.
    |
    */

    'enabled' => env('UPS_ENABLED'), // null = fall back to admin setting

    'client_id' => env('UPS_CLIENT_ID'),
    'client_secret' => env('UPS_CLIENT_SECRET'),
    'account_number' => env('UPS_ACCOUNT_NUMBER'),

    // sandbox | production (also accepts "live")
    'environment' => env('UPS_ENVIRONMENT', 'sandbox'),

    'api_version' => env('UPS_API_VERSION', 'v2409'),
    'sandbox_url' => env('UPS_SANDBOX_URL', 'https://wwwcie.ups.com'),
    'production_url' => env('UPS_PRODUCTION_URL', 'https://onlinetools.ups.com'),

    'default_package_weight_lbs' => (float) env('UPS_DEFAULT_PACKAGE_WEIGHT_LBS', 2),

    // Product weight values are stored in this unit unless overridden per-product later.
    'weight_unit' => env('UPS_WEIGHT_UNIT', 'lb'), // lb | kg | oz

    'timeout_seconds' => (int) env('UPS_TIMEOUT_SECONDS', 15),
    'connect_timeout_seconds' => (int) env('UPS_CONNECT_TIMEOUT_SECONDS', 5),

    // Cache live quotes so order placement validates against server rates, not the browser.
    'quote_ttl_seconds' => (int) env('UPS_QUOTE_TTL_SECONDS', 1800),

    // Ship-from defaults (admin Settings override these when present).
    'shipper' => [
        'name' => env('UPS_SHIPPER_NAME', 'Meadowlark Gardens TN'),
        'address_line' => env('UPS_SHIPPER_ADDRESS_LINE', '1200 Meadowlark Place'),
        'city' => env('UPS_SHIPPER_CITY', 'Manchester'),
        'state' => env('UPS_SHIPPER_STATE', 'TN'),
        'postal_code' => env('UPS_SHIPPER_POSTAL_CODE', '37355'),
        'country' => env('UPS_SHIPPER_COUNTRY', 'US'),
        'phone' => env('UPS_SHIPPER_PHONE', '9317284000'),
    ],

    /*
    | When an admin moves an order into this status, create a UPS shipment
    | (if the order used UPS at checkout and no shipment exists yet).
    | Existing statuses: pending, processing, paid, packed, shipped, ...
    */
    'shipment_trigger_status' => strtolower((string) env('UPS_SHIPMENT_TRIGGER_STATUS', 'shipped')),
];
