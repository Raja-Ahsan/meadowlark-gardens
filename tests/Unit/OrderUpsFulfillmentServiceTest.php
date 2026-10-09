<?php

namespace Tests\Unit;

use App\Exceptions\UpsShipmentException;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderUpsFulfillmentService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class OrderUpsFulfillmentServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Http::preventStrayRequests();
        Storage::fake('local');

        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('settings');

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('weight', 8, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('business_name')->nullable();
            $table->string('type')->default('retail');
            $table->decimal('total', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_id')->nullable();
            $table->string('coupon_code')->nullable();
            $table->string('shipping_carrier')->nullable();
            $table->string('shipping_method_code')->nullable();
            $table->string('shipping_method_name')->nullable();
            $table->json('billing_address')->nullable();
            $table->json('shipping_address')->nullable();
            $table->text('order_notes')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('ups_shipment_id')->nullable();
            $table->string('ups_label_path')->nullable();
            $table->string('ups_shipment_environment')->nullable();
            $table->timestamp('ups_shipment_created_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id');
            $table->foreignId('product_id')->nullable();
            $table->foreignId('variation_id')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->timestamps();
        });

        config([
            'ups.enabled' => true,
            'ups.client_id' => 'test-client',
            'ups.client_secret' => 'test-secret',
            'ups.account_number' => 'A12345',
            'ups.environment' => 'sandbox',
            'ups.sandbox_url' => 'https://wwwcie.ups.com',
            'ups.production_url' => 'https://onlinetools.ups.com',
            'ups.api_version' => 'v2409',
            'ups.shipment_trigger_status' => 'shipped',
            'ups.default_package_weight_lbs' => 2,
            'ups.shipper.phone' => '9317284000',
            'ups.timeout_seconds' => 5,
            'ups.connect_timeout_seconds' => 2,
        ]);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('settings');
        parent::tearDown();
    }

    private function fakeSuccessfulShipment(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/shipments/*/ship' => Http::response([
                'ShipmentResponse' => [
                    'ShipmentResults' => [
                        'ShipmentIdentificationNumber' => '1ZSHIP',
                        'PackageResults' => [
                            'TrackingNumber' => '1ZTRACK',
                            'ShippingLabel' => [
                                'ImageFormat' => ['Code' => 'GIF'],
                                'GraphicImage' => base64_encode('label'),
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);
    }

    private function makeUpsOrder(array $overrides = []): Order
    {
        $product = Product::create([
            'name' => 'Plant',
            'slug' => 'plant-'.uniqid(),
            'price' => 20,
            'weight' => 1.5,
        ]);

        $order = Order::create(array_merge([
            'order_number' => 'ORD-'.uniqid(),
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'type' => 'retail',
            'total' => 30,
            'subtotal' => 20,
            'shipping_cost' => 10,
            'status' => 'paid',
            'payment_method' => 'Credit Card',
            'payment_id' => 'auth-1',
            'paid_at' => now(),
            'shipping_carrier' => 'ups',
            'shipping_method_code' => '03',
            'shipping_method_name' => 'UPS Ground',
            'shipping_address' => [
                'firstName' => 'Jane',
                'lastName' => 'Doe',
                'addressLine1' => '1 Main St',
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
                'phone' => '6155551212',
            ],
            'billing_address' => [],
        ], $overrides));

        $order->items()->create([
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => 10,
        ]);

        return $order->fresh(['items.product']);
    }

    public function test_only_trigger_status_creates_shipment(): void
    {
        $svc = app(OrderUpsFulfillmentService::class);
        $order = $this->makeUpsOrder();

        $this->assertTrue($svc->shouldCreateShipment($order, 'shipped'));
        $this->assertFalse($svc->shouldCreateShipment($order, 'processing'));
        $this->assertFalse($svc->shouldCreateShipment($order, 'packed'));
        $this->assertFalse($svc->shouldCreateShipment($order, 'delivered'));
    }

    public function test_non_ups_order_does_not_trigger(): void
    {
        $order = $this->makeUpsOrder([
            'shipping_carrier' => 'free',
            'shipping_method_code' => 'FREE',
            'shipping_method_name' => 'Free Shipping',
        ]);
        $this->assertFalse(app(OrderUpsFulfillmentService::class)->shouldCreateShipment($order, 'shipped'));
    }

    public function test_successful_shipment_persists_tracking_and_label(): void
    {
        $this->fakeSuccessfulShipment();
        $order = $this->makeUpsOrder();

        $result = app(OrderUpsFulfillmentService::class)->createShipmentIfNeeded($order, 'shipped');

        $this->assertNotNull($result);
        $order->refresh();
        $this->assertSame('1ZTRACK', $order->tracking_number);
        $this->assertSame('1ZSHIP', $order->ups_shipment_id);
        $this->assertNotNull($order->ups_shipment_created_at);
        $this->assertSame('sandbox', $order->ups_shipment_environment);
        $this->assertNotNull($order->ups_label_path);
        Storage::disk('local')->assertExists($order->ups_label_path);
    }

    public function test_duplicate_status_save_does_not_create_second_shipment(): void
    {
        $this->fakeSuccessfulShipment();
        $order = $this->makeUpsOrder();
        $svc = app(OrderUpsFulfillmentService::class);

        $svc->createShipmentIfNeeded($order, 'shipped');
        $order->refresh();
        $firstTracking = $order->tracking_number;
        $firstPath = $order->ups_label_path;

        $second = $svc->createShipmentIfNeeded($order->fresh(), 'shipped');
        $this->assertNull($second);
        $order->refresh();
        $this->assertSame($firstTracking, $order->tracking_number);
        $this->assertSame($firstPath, $order->ups_label_path);
        Http::assertSentCount(2); // oauth + one ship only
    }

    public function test_unpaid_order_cannot_create_shipment(): void
    {
        $order = $this->makeUpsOrder([
            'status' => 'pending',
            'paid_at' => null,
            'payment_id' => null,
        ]);

        $this->expectException(UpsShipmentException::class);
        $this->expectExceptionMessage('Order not paid');
        app(OrderUpsFulfillmentService::class)->createShipmentIfNeeded($order, 'shipped');
    }

    public function test_cancelled_order_cannot_create_shipment(): void
    {
        $order = $this->makeUpsOrder(['status' => 'cancelled']);

        $this->expectException(UpsShipmentException::class);
        app(OrderUpsFulfillmentService::class)->createShipmentIfNeeded($order, 'shipped');
    }

    public function test_ups_api_failure_does_not_persist_shipment(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/shipments/*/ship' => Http::response([
                'response' => ['errors' => [['message' => 'Invalid account']]],
            ], 400),
        ]);
        $order = $this->makeUpsOrder();

        try {
            app(OrderUpsFulfillmentService::class)->createShipmentIfNeeded($order, 'shipped');
            $this->fail('Expected UpsShipmentException');
        } catch (UpsShipmentException) {
            // expected
        }

        $order->refresh();
        $this->assertNull($order->tracking_number);
        $this->assertNull($order->ups_shipment_created_at);
        $this->assertSame('paid', $order->status);
    }

    public function test_configurable_trigger_status(): void
    {
        config(['ups.shipment_trigger_status' => 'processing']);
        $order = $this->makeUpsOrder();
        $svc = app(OrderUpsFulfillmentService::class);

        $this->assertTrue($svc->shouldCreateShipment($order, 'processing'));
        $this->assertFalse($svc->shouldCreateShipment($order, 'shipped'));
    }
}
