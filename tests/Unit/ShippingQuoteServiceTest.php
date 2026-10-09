<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\Setting;
use App\Services\ShippingQuoteService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ShippingQuoteServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        Http::preventStrayRequests();

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
            $table->string('sku')->nullable();
            $table->string('type')->default('simple');
            $table->decimal('price', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('in_stock')->default(true);
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->boolean('manage_stock')->default(false);
            $table->boolean('is_active')->default(true);
            $table->decimal('weight', 8, 2)->nullable();
            $table->timestamps();
        });

        config([
            'ups.enabled' => true,
            'ups.client_id' => 'test-client',
            'ups.client_secret' => 'test-secret',
            'ups.account_number' => 'A123',
            'ups.environment' => 'sandbox',
            'ups.sandbox_url' => 'https://wwwcie.ups.com',
            'ups.production_url' => 'https://onlinetools.ups.com',
            'ups.api_version' => 'v2409',
            'ups.default_package_weight_lbs' => 2,
            'ups.weight_unit' => 'lb',
            'ups.quote_ttl_seconds' => 1800,
        ]);

        Setting::set('ups_enabled', 'true');
        Setting::set('ups_free_shipping_threshold', '0');
        Setting::set('ups_shipper_name', 'MG');
        Setting::set('ups_shipper_address_line', '1200 Meadowlark Place');
        Setting::set('ups_shipper_city', 'Manchester');
        Setting::set('ups_shipper_state', 'TN');
        Setting::set('ups_shipper_postal_code', '37355');
        Setting::set('ups_shipper_country', 'US');
        Setting::set('tax_rate', '9.25');
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('settings');
        parent::tearDown();
    }

    private function fakeUpsRates(float $ground = 12.5): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response([
                'RateResponse' => [
                    'RatedShipment' => [
                        [
                            'Service' => ['Code' => '03', 'Description' => 'UPS Ground'],
                            'TotalCharges' => ['MonetaryValue' => (string) $ground, 'CurrencyCode' => 'USD'],
                        ],
                        [
                            'Service' => ['Code' => '02', 'Description' => 'UPS 2nd Day Air'],
                            'TotalCharges' => ['MonetaryValue' => '30.00', 'CurrencyCode' => 'USD'],
                        ],
                    ],
                ],
            ], 200),
        ]);
    }

    private function makeProduct(float $weight = 1.5): Product
    {
        return Product::create([
            'name' => 'Test Plant',
            'slug' => 'test-plant-'.uniqid(),
            'sku' => 'SKU-'.uniqid(),
            'type' => 'simple',
            'price' => 20,
            'description' => 'Test',
            'in_stock' => true,
            'stock_quantity' => 10,
            'manage_stock' => true,
            'is_active' => true,
            'weight' => $weight,
        ]);
    }

    public function test_quantity_multiplies_weight(): void
    {
        $product = $this->makeProduct(2.0);
        $lbs = app(ShippingQuoteService::class)->calculateWeightLbs([
            ['productId' => $product->id, 'quantity' => 3],
        ]);
        $this->assertSame(6.0, $lbs);
    }

    public function test_quote_returns_ups_services_and_quote_id(): void
    {
        $this->fakeUpsRates();
        $product = $this->makeProduct();

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => [
                'addressLine1' => '1 Main',
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $this->assertSame('ups', $quote['source']);
        $this->assertNotEmpty($quote['quoteId']);
        $this->assertCount(2, $quote['rates']);
        $this->assertTrue(Cache::has('shipping.quote.'.$quote['quoteId']));
    }

    public function test_resolve_uses_server_cost_not_client_manipulation(): void
    {
        $this->fakeUpsRates(15.00);
        $product = $this->makeProduct();
        $addr = [
            'addressLine1' => '1 Main',
            'city' => 'Nashville',
            'state' => 'TN',
            'postalCode' => '37201',
            'country' => 'US',
        ];
        $items = [['productId' => $product->id, 'quantity' => 1]];

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Shipping cost has changed');

        app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
            'shippingQuoteId' => $quote['quoteId'],
            'shippingMethod' => [
                'carrier' => 'ups',
                'code' => '03',
                'name' => 'UPS Ground',
                'cost' => 0.01,
            ],
        ]);
    }

    public function test_resolve_accepts_valid_cached_selection(): void
    {
        $this->fakeUpsRates(15.00);
        $product = $this->makeProduct();
        $addr = [
            'addressLine1' => '1 Main',
            'city' => 'Nashville',
            'state' => 'TN',
            'postalCode' => '37201',
            'country' => 'US',
        ];
        $items = [['productId' => $product->id, 'quantity' => 1]];

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $resolved = app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
            'shippingQuoteId' => $quote['quoteId'],
            'shippingMethod' => [
                'carrier' => 'ups',
                'code' => '03',
                'name' => 'UPS Ground',
                'cost' => 15.00,
            ],
        ]);

        $this->assertSame(15.0, $resolved['cost']);
        $this->assertSame('ups', $resolved['carrier']);
        $this->assertSame('03', $resolved['code']);
    }

    public function test_order_total_includes_ups_shipping(): void
    {
        $this->fakeUpsRates(12.50);
        $product = $this->makeProduct();
        $addr = [
            'addressLine1' => '1 Main',
            'city' => 'Nashville',
            'state' => 'TN',
            'postalCode' => '37201',
            'country' => 'US',
        ];
        $items = [['productId' => $product->id, 'quantity' => 1]];
        $subtotal = 20.0;
        $discount = 0.0;
        $taxRate = 0.0925;

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => $subtotal,
            'type' => 'retail',
        ]);

        $resolved = app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => $addr,
            'items' => $items,
            'subtotal' => $subtotal,
            'type' => 'retail',
            'shippingQuoteId' => $quote['quoteId'],
            'shippingMethod' => $quote['rates'][0],
        ]);

        $shipping = $resolved['cost'];
        $taxable = max(0, $subtotal - $discount);
        $tax = round($taxable * $taxRate, 2);
        $total = round(max(0, $subtotal - $discount + $tax + $shipping), 2);

        $this->assertSame(12.5, $shipping);
        $this->assertSame(34.35, $total); // 20 + 1.85 tax + 12.50 shipping
    }

    public function test_address_change_invalidates_cached_quote(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::sequence()
                ->push([
                    'RateResponse' => [
                        'RatedShipment' => [[
                            'Service' => ['Code' => '03', 'Description' => 'UPS Ground'],
                            'TotalCharges' => ['MonetaryValue' => '15.00', 'CurrencyCode' => 'USD'],
                        ]],
                    ],
                ], 200)
                ->push([
                    'RateResponse' => [
                        'RatedShipment' => [[
                            'Service' => ['Code' => '03', 'Description' => 'UPS Ground'],
                            'TotalCharges' => ['MonetaryValue' => '18.00', 'CurrencyCode' => 'USD'],
                        ]],
                    ],
                ], 200),
        ]);

        $product = $this->makeProduct();
        $items = [['productId' => $product->id, 'quantity' => 1]];
        $svc = app(ShippingQuoteService::class);

        $quote = $svc->quote([
            'shippingAddress' => [
                'addressLine1' => '1 Main',
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $this->assertSame(15.0, $quote['rates'][0]['cost']);

        $cached = Cache::get('shipping.quote.'.$quote['quoteId']);
        $this->assertIsArray($cached);

        $newAddress = [
            'addressLine1' => '99 Other',
            'city' => 'Memphis',
            'state' => 'TN',
            'postalCode' => '38103',
            'country' => 'US',
        ];
        $this->assertNotSame(
            $cached['fingerprint'],
            $svc->fingerprint($newAddress, $items, 20, 'retail', false)
        );

        // Stale Nashville price must be rejected once destination (and UPS rate) changes.
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Shipping cost has changed');
        $svc->resolveShippingCost([
            'shippingAddress' => $newAddress,
            'items' => $items,
            'subtotal' => 20,
            'type' => 'retail',
            'shippingQuoteId' => $quote['quoteId'],
            'shippingMethod' => [
                'carrier' => 'ups',
                'code' => '03',
                'name' => 'UPS Ground',
                'cost' => 15.00,
            ],
        ]);
    }

    public function test_cart_quantity_change_invalidates_fingerprint(): void
    {
        $svc = app(ShippingQuoteService::class);
        $product = $this->makeProduct();
        $addr = ['city' => 'Nashville', 'state' => 'TN', 'postalCode' => '37201', 'country' => 'US'];

        $fp1 = $svc->fingerprint($addr, [['productId' => $product->id, 'quantity' => 1]], 20, 'retail', false);
        $fp2 = $svc->fingerprint($addr, [['productId' => $product->id, 'quantity' => 2]], 20, 'retail', false);
        $this->assertNotSame($fp1, $fp2);
    }

    public function test_no_fallback_when_ups_unavailable(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response(['error' => 'down'], 500),
        ]);
        $product = $this->makeProduct();

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $this->assertSame('none', $quote['source']);
        $this->assertSame([], $quote['rates']);
        $this->assertNull($quote['quoteId']);
        $this->assertNotEmpty($quote['error']);
        $this->assertStringNotContainsString('9.99', json_encode($quote));
        $this->assertStringNotContainsString('Standard Shipping', json_encode($quote));
    }

    public function test_mismatched_city_state_zip_returns_no_rates(): void
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
        $product = $this->makeProduct();

        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => [
                'addressLine1' => '100 Main St',
                'city' => 'Adamsville',
                'state' => 'TN',
                'postalCode' => '02141',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
        ]);

        $this->assertSame([], $quote['rates']);
        $this->assertNull($quote['quoteId']);
        $this->assertSame('postalCode', array_key_first($quote['fieldErrors']));
        $this->assertStringContainsString('ZIP code does not match', $quote['fieldErrors']['postalCode']);
    }

    public function test_resolve_rejects_order_without_ups_quote_after_api_failure(): void
    {
        Http::fake([
            '*/security/v1/oauth/token' => Http::response(['access_token' => 'tok', 'expires_in' => 3600], 200),
            '*/api/rating/*/Shop' => Http::response([
                'response' => ['errors' => [['message' => 'The postal code 02141 is invalid for TN United States.']]],
            ], 400),
        ]);
        $product = $this->makeProduct();

        $this->expectException(HttpException::class);

        app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => [
                'city' => 'Adamsville',
                'state' => 'TN',
                'postalCode' => '02141',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
            'shippingQuoteId' => 'stale-quote-id',
            'shippingMethod' => [
                'carrier' => 'flat',
                'code' => 'FLAT',
                'name' => 'Standard Shipping',
                'cost' => 9.99,
            ],
        ]);
    }

    public function test_free_shipping_coupon_path(): void
    {
        $product = $this->makeProduct();
        $quote = app(ShippingQuoteService::class)->quote([
            'shippingAddress' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
            'freeShipping' => true,
        ]);

        $this->assertSame('promotion', $quote['source']);
        $this->assertSame(0.0, $quote['rates'][0]['cost']);
        Http::assertNothingSent();
    }

    public function test_resolve_requires_quote_id_without_coupon(): void
    {
        $product = $this->makeProduct();

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Please calculate shipping');

        app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
            'shippingMethod' => [
                'carrier' => 'ups',
                'code' => '03',
                'name' => 'UPS Ground',
                'cost' => 12.5,
            ],
        ]);
    }

    public function test_client_free_code_without_coupon_is_rejected(): void
    {
        $product = $this->makeProduct();

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Please calculate shipping');

        app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
            'shippingMethod' => [
                'carrier' => 'free',
                'code' => 'FREE',
                'name' => 'Free Shipping',
                'cost' => 0,
            ],
        ]);
    }

    public function test_coupon_free_shipping_resolve_without_quote_id(): void
    {
        $product = $this->makeProduct();
        $resolved = app(ShippingQuoteService::class)->resolveShippingCost([
            'shippingAddress' => [
                'city' => 'Nashville',
                'state' => 'TN',
                'postalCode' => '37201',
                'country' => 'US',
            ],
            'items' => [['productId' => $product->id, 'quantity' => 1]],
            'subtotal' => 20,
            'type' => 'retail',
            'freeShipping' => true,
            'shippingMethod' => [
                'carrier' => 'free',
                'code' => 'FREE',
                'name' => 'Free Shipping',
                'cost' => 0,
            ],
        ]);

        $this->assertSame(0.0, $resolved['cost']);
        $this->assertSame('FREE', $resolved['code']);
    }
}
