<?php

namespace Tests\Unit;

use App\Exceptions\UpsRateException;
use App\Services\UpsShippingService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UpsShippingServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Http::preventStrayRequests();
        config([
            'ups.enabled' => true,
            'ups.client_id' => 'test-client',
            'ups.client_secret' => 'test-secret',
            'ups.account_number' => 'A123',
            'ups.environment' => 'sandbox',
            'ups.sandbox_url' => 'https://wwwcie.ups.com',
            'ups.production_url' => 'https://onlinetools.ups.com',
            'ups.api_version' => 'v2409',
            'ups.timeout_seconds' => 5,
            'ups.connect_timeout_seconds' => 2,
        ]);
    }

    public function test_sandbox_endpoint_selection(): void
    {
        $ups = app(UpsShippingService::class);
        $this->assertTrue($ups->isSandbox());
        $this->assertSame('https://wwwcie.ups.com', $ups->baseUrl());
    }

    public function test_production_endpoint_selection(): void
    {
        config(['ups.environment' => 'production']);
        $ups = app(UpsShippingService::class);
        $this->assertFalse($ups->isSandbox());
        $this->assertSame('https://onlinetools.ups.com', $ups->baseUrl());
    }

    public function test_live_alias_maps_to_production(): void
    {
        config(['ups.environment' => 'live']);
        $this->assertSame('production', app(UpsShippingService::class)->environment());
    }

    public function test_oauth_token_is_cached(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response([
                'access_token' => 'tok_abc',
                'expires_in' => 3600,
            ], 200),
        ]);

        $ups = app(UpsShippingService::class);
        $this->assertSame('tok_abc', $ups->getAccessToken());
        $this->assertSame('tok_abc', $ups->getAccessToken());

        Http::assertSentCount(1);
    }

    public function test_oauth_force_refresh(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::sequence()
                ->push(['access_token' => 'tok_1', 'expires_in' => 3600], 200)
                ->push(['access_token' => 'tok_2', 'expires_in' => 3600], 200),
        ]);

        $ups = app(UpsShippingService::class);
        $this->assertSame('tok_1', $ups->getAccessToken());
        $this->assertSame('tok_2', $ups->getAccessToken(true));
        Http::assertSentCount(2);
    }

    public function test_parse_multiple_services(): void
    {
        $ups = app(UpsShippingService::class);
        $rates = $ups->parseRates([
            'RateResponse' => [
                'RatedShipment' => [
                    [
                        'Service' => ['Code' => '03', 'Description' => 'UPS Ground'],
                        'TotalCharges' => ['MonetaryValue' => '12.50', 'CurrencyCode' => 'USD'],
                    ],
                    [
                        'Service' => ['Code' => '02'],
                        'TotalCharges' => ['MonetaryValue' => '28.00', 'CurrencyCode' => 'USD'],
                        'GuaranteedDelivery' => ['BusinessDaysInTransit' => '2'],
                    ],
                ],
            ],
        ]);

        $this->assertCount(2, $rates);
        $this->assertSame('03', $rates[0]['code']);
        $this->assertSame(12.5, $rates[0]['cost']);
        $this->assertSame('UPS 2nd Day Air', $rates[1]['name']);
        $this->assertSame(2, $rates[1]['etaDays']);
    }

    public function test_parse_empty_rates(): void
    {
        $ups = app(UpsShippingService::class);
        $this->assertSame([], $ups->parseRates(['RateResponse' => []]));
    }

    public function test_get_rates_uses_shop_endpoint_and_returns_services(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response([
                'RateResponse' => [
                    'RatedShipment' => [
                        'Service' => ['Code' => '03', 'Description' => 'UPS Ground'],
                        'TotalCharges' => ['MonetaryValue' => '9.99', 'CurrencyCode' => 'USD'],
                    ],
                ],
            ], 200),
        ]);

        $rates = app(UpsShippingService::class)->getRates([
            'addressLine1' => '100 Main St',
            'city' => 'Nashville',
            'state' => 'TN',
            'postalCode' => '37201',
            'country' => 'US',
        ], 3.5);

        $this->assertCount(1, $rates);
        $this->assertSame('ups', $rates[0]['carrier']);
        $this->assertSame(9.99, $rates[0]['cost']);
    }

    public function test_get_rates_throws_on_ups_error_response(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response([
                'response' => ['errors' => [['code' => '111100', 'message' => 'Invalid address']]],
            ], 400),
        ]);

        $this->expectException(UpsRateException::class);
        app(UpsShippingService::class)->getRates([
            'city' => 'X',
            'state' => 'TN',
            'postalCode' => '00000',
            'country' => 'US',
        ], 1);
    }

    public function test_mismatched_postal_maps_to_postal_code_field(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response([
                'response' => ['errors' => [[
                    'code' => '111210',
                    'message' => 'The postal code 02141 is invalid for TN United States.',
                ]]],
            ], 400),
        ]);

        try {
            app(UpsShippingService::class)->getRates([
                'city' => 'Adamsville',
                'state' => 'TN',
                'postalCode' => '02141',
                'country' => 'US',
            ], 2);
            $this->fail('Expected UpsRateException');
        } catch (UpsRateException $e) {
            $this->assertSame('postalCode', $e->getField());
            $this->assertStringContainsString('ZIP code does not match', $e->getUserMessage());
        }
    }

    public function test_build_rate_request_includes_destination_and_weight(): void
    {
        $payload = app(UpsShippingService::class)->buildRateRequest([
            'firstName' => 'Jane',
            'lastName' => 'Doe',
            'addressLine1' => '1 Oak Ave',
            'addressLine2' => 'Apt 2',
            'city' => 'Nashville',
            'state' => 'tn',
            'postalCode' => '37203',
            'country' => 'us',
        ], 4.25);

        $shipment = $payload['RateRequest']['Shipment'];
        $this->assertSame('Jane Doe', $shipment['ShipTo']['Name']);
        $this->assertSame('TN', $shipment['ShipTo']['Address']['StateProvinceCode']);
        $this->assertSame(['1 Oak Ave', 'Apt 2'], $shipment['ShipTo']['Address']['AddressLine']);
        $this->assertSame('4.3', $shipment['Package']['PackageWeight']['Weight']);
        $this->assertArrayNotHasKey('Service', $shipment);
    }

    public function test_disabled_without_credentials(): void
    {
        config(['ups.client_id' => null, 'ups.client_secret' => null, 'ups.enabled' => true]);
        $this->assertFalse(app(UpsShippingService::class)->isEnabled());
    }

    public function test_timeout_surfaces_safe_runtime_exception(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('cURL error 28: Operation timed out');
            },
        ]);

        $this->expectException(UpsRateException::class);
        $this->expectExceptionMessage('cURL error 28');

        app(UpsShippingService::class)->getRates([
            'city' => 'Nashville',
            'state' => 'TN',
            'postalCode' => '37201',
            'country' => 'US',
        ], 1);
    }

    public function test_shipper_defaults_come_from_config_without_settings_table(): void
    {
        $shipper = app(UpsShippingService::class)->shipperAddress();
        $this->assertSame('Manchester', $shipper['city']);
        $this->assertSame('TN', $shipper['state']);
        $this->assertSame('37355', $shipper['postalCode']);
    }
}
