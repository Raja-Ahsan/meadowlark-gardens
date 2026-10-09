<?php

namespace Tests\Unit;

use App\Exceptions\UpsShipmentException;
use App\Models\Order;
use App\Services\UpsShipmentService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UpsShipmentServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Http::preventStrayRequests();
        Storage::fake('local');
        config([
            'ups.enabled' => true,
            'ups.client_id' => 'test-client',
            'ups.client_secret' => 'test-secret',
            'ups.account_number' => 'A12345',
            'ups.environment' => 'sandbox',
            'ups.sandbox_url' => 'https://wwwcie.ups.com',
            'ups.production_url' => 'https://onlinetools.ups.com',
            'ups.api_version' => 'v2409',
            'ups.timeout_seconds' => 5,
            'ups.connect_timeout_seconds' => 2,
            'ups.default_package_weight_lbs' => 2,
            'ups.shipper.phone' => '9317284000',
        ]);
    }

    public function test_sandbox_shipment_endpoint(): void
    {
        $this->assertSame(
            'https://wwwcie.ups.com/api/shipments/v2409/ship',
            app(UpsShipmentService::class)->shipmentEndpoint()
        );
    }

    public function test_production_shipment_endpoint(): void
    {
        config(['ups.environment' => 'production']);
        $this->assertSame(
            'https://onlinetools.ups.com/api/shipments/v2409/ship',
            app(UpsShipmentService::class)->shipmentEndpoint()
        );
    }

    public function test_build_shipment_uses_checkout_service_and_order_address(): void
    {
        $order = new Order([
            'order_number' => 'ORD-TEST-1',
            'customer_name' => 'Jane Doe',
            'shipping_carrier' => 'ups',
            'shipping_method_code' => '03',
            'shipping_method_name' => 'UPS Ground',
            'shipping_address' => [
                'firstName' => 'Jane',
                'lastName' => 'Doe',
                'addressLine1' => '1 Oak Ave',
                'addressLine2' => 'Apt 2',
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37203',
                'country' => 'US',
                'phone' => '6155551212',
            ],
            'billing_address' => [],
        ]);
        $order->id = 99;

        $payload = app(UpsShipmentService::class)->buildShipmentRequest($order, $order->shipping_address, '03', 4.5);
        $shipment = $payload['ShipmentRequest']['Shipment'];

        $this->assertSame('03', $shipment['Service']['Code']);
        $this->assertSame('UPS Ground', $shipment['Service']['Description']);
        $this->assertSame('Jane Doe', $shipment['ShipTo']['Name']);
        $this->assertSame('TN', $shipment['ShipTo']['Address']['StateProvinceCode']);
        $this->assertSame('37203', $shipment['ShipTo']['Address']['PostalCode']);
        $this->assertSame(['1 Oak Ave', 'Apt 2'], $shipment['ShipTo']['Address']['AddressLine']);
        $this->assertSame('4.5', $shipment['Package']['PackageWeight']['Weight']);
        $this->assertSame('A12345', $shipment['PaymentInformation']['ShipmentCharge']['BillShipper']['AccountNumber']);
        $this->assertSame('GIF', $payload['ShipmentRequest']['LabelSpecification']['LabelImageFormat']['Code']);
    }

    public function test_parse_shipment_response_extracts_tracking_and_label(): void
    {
        $parsed = app(UpsShipmentService::class)->parseShipmentResponse([
            'ShipmentResponse' => [
                'ShipmentResults' => [
                    'ShipmentIdentificationNumber' => '1Z999SHIP',
                    'PackageResults' => [
                        'TrackingNumber' => '1Z999TRACK',
                        'ShippingLabel' => [
                            'ImageFormat' => ['Code' => 'GIF'],
                            'GraphicImage' => base64_encode('fake-gif-bytes'),
                        ],
                    ],
                ],
            ],
        ]);

        $this->assertSame('1Z999TRACK', $parsed['trackingNumber']);
        $this->assertSame('1Z999SHIP', $parsed['shipmentId']);
        $this->assertNotEmpty($parsed['labelBase64']);
    }

    public function test_create_shipment_stores_label_and_returns_tracking(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/shipments/*/ship' => Http::response([
                'ShipmentResponse' => [
                    'ShipmentResults' => [
                        'ShipmentIdentificationNumber' => '1ZSHIPID',
                        'PackageResults' => [
                            'TrackingNumber' => '1ZTRACK123',
                            'ShippingLabel' => [
                                'ImageFormat' => ['Code' => 'GIF'],
                                'GraphicImage' => base64_encode('GIF89a-label'),
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $order = new Order([
            'order_number' => 'ORD-100',
            'customer_name' => 'Test Customer',
            'shipping_carrier' => 'ups',
            'shipping_method_code' => '03',
            'shipping_method_name' => 'UPS Ground',
            'shipping_address' => [
                'firstName' => 'Test',
                'lastName' => 'Customer',
                'addressLine1' => '100 Main',
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
                'phone' => '6155559999',
            ],
        ]);
        $order->id = 55;
        $order->setRelation('items', collect());

        $result = app(UpsShipmentService::class)->createShipmentForOrder($order);

        $this->assertSame('1ZTRACK123', $result['trackingNumber']);
        $this->assertSame('1ZSHIPID', $result['shipmentId']);
        $this->assertSame('sandbox', $result['environment']);
        $this->assertNotNull($result['labelPath']);
        Storage::disk('local')->assertExists($result['labelPath']);
    }

    public function test_create_shipment_throws_on_ups_error(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/shipments/*/ship' => Http::response([
                'response' => ['errors' => [['code' => '120100', 'message' => 'Missing or invalid shipper number']]],
            ], 400),
        ]);

        $order = new Order([
            'order_number' => 'ORD-ERR',
            'shipping_carrier' => 'ups',
            'shipping_method_code' => '03',
            'shipping_address' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
                'addressLine1' => '1 Main',
                'firstName' => 'A',
                'lastName' => 'B',
            ],
        ]);
        $order->id = 7;
        $order->setRelation('items', collect());

        $this->expectException(UpsShipmentException::class);
        app(UpsShipmentService::class)->createShipmentForOrder($order);
    }
}
