<?php

namespace App\Services;

use App\Exceptions\UpsShipmentException;
use App\Models\Order;
use App\Support\ShippingWeight;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UpsShipmentService
{
    public function __construct(private UpsShippingService $ups) {}

    public function shipmentEndpoint(): string
    {
        return $this->ups->baseUrl().'/api/shipments/'.config('ups.api_version', 'v2409').'/ship';
    }

    /**
     * Create a UPS shipment for an order using the checkout-selected service.
     *
     * @return array{
     *   trackingNumber: string,
     *   shipmentId: string|null,
     *   labelPath: string|null,
     *   environment: string,
     *   serviceCode: string,
     *   serviceName: string
     * }
     */
    public function createShipmentForOrder(Order $order): array
    {
        if (! $this->ups->isEnabled()) {
            throw new UpsShipmentException(
                'UPS is not enabled',
                'UPS shipping is not configured. Add credentials before creating a shipment.',
            );
        }

        $account = $this->ups->accountNumber();
        if ($account === '') {
            throw new UpsShipmentException(
                'UPS account number missing',
                'UPS account number is required to create a shipment.',
            );
        }

        $serviceCode = trim((string) $order->shipping_method_code);
        if ($serviceCode === '' || strtolower((string) $order->shipping_carrier) !== 'ups') {
            throw new UpsShipmentException(
                'Order is not a UPS shipment',
                'This order does not have a UPS shipping method selected at checkout.',
            );
        }

        $shipTo = is_array($order->shipping_address) ? $order->shipping_address : [];
        if ($shipTo === []) {
            throw new UpsShipmentException(
                'Missing shipping address',
                'Order is missing a shipping address.',
            );
        }

        $weightLbs = $this->orderWeightLbs($order);
        $payload = $this->buildShipmentRequest($order, $shipTo, $serviceCode, $weightLbs);

        Log::info('UPS shipment creation started', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'service_code' => $serviceCode,
            'environment' => $this->ups->environment(),
            'weight_lbs' => $weightLbs,
            'postal' => $shipTo['postalCode'] ?? $shipTo['postal_code'] ?? null,
        ]);

        $started = microtime(true);
        $token = $this->ups->getAccessToken();

        try {
            $response = Http::timeout((int) config('ups.timeout_seconds', 15))
                ->connectTimeout((int) config('ups.connect_timeout_seconds', 5))
                ->withToken($token)
                ->withHeaders([
                    'transId' => substr(uniqid('mg_ship_', true), 0, 32),
                    'transactionSrc' => 'meadowlark_garden',
                ])
                ->acceptJson()
                ->asJson()
                ->post($this->shipmentEndpoint(), $payload);
        } catch (ConnectionException $e) {
            Log::warning('UPS shipment connection failure', [
                'order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);
            throw new UpsShipmentException(
                $e->getMessage(),
                'UPS shipment timed out. The order was not marked as shipped. Please try again.',
            );
        }

        if ($response->status() === 401) {
            $token = $this->ups->getAccessToken(true);
            $response = Http::timeout((int) config('ups.timeout_seconds', 15))
                ->connectTimeout((int) config('ups.connect_timeout_seconds', 5))
                ->withToken($token)
                ->withHeaders([
                    'transId' => substr(uniqid('mg_ship_', true), 0, 32),
                    'transactionSrc' => 'meadowlark_garden',
                ])
                ->acceptJson()
                ->asJson()
                ->post($this->shipmentEndpoint(), $payload);
        }

        $elapsedMs = (int) round((microtime(true) - $started) * 1000);
        $json = $response->json() ?? [];

        if (! $response->successful()) {
            Log::warning('UPS shipment creation failed', [
                'order_id' => $order->id,
                'status' => $response->status(),
                'elapsed_ms' => $elapsedMs,
                'error' => data_get($json, 'response.errors.0.message')
                    ?? data_get($json, 'response.errors.0.code')
                    ?? 'http_'.$response->status(),
            ]);
            throw UpsShipmentException::fromUpsResponse(is_array($json) ? $json : [], $response->status());
        }

        $parsed = $this->parseShipmentResponse(is_array($json) ? $json : []);
        if ($parsed['trackingNumber'] === '') {
            throw new UpsShipmentException(
                'UPS response missing tracking number',
                'UPS did not return a tracking number. The order was not marked as shipped.',
            );
        }

        $labelPath = null;
        if ($parsed['labelBase64'] !== '') {
            $labelPath = $this->storeLabel($order, $parsed['labelBase64'], $parsed['labelFormat']);
        }

        Log::info('UPS shipment created', [
            'order_id' => $order->id,
            'tracking_number' => $parsed['trackingNumber'],
            'shipment_id' => $parsed['shipmentId'],
            'elapsed_ms' => $elapsedMs,
            'environment' => $this->ups->environment(),
        ]);

        return [
            'trackingNumber' => $parsed['trackingNumber'],
            'shipmentId' => $parsed['shipmentId'],
            'labelPath' => $labelPath,
            'environment' => $this->ups->environment(),
            'serviceCode' => $serviceCode,
            'serviceName' => (string) ($order->shipping_method_name ?: $this->ups->serviceName($serviceCode)),
        ];
    }

    /**
     * @param  array<string, mixed>  $shipTo
     * @return array<string, mixed>
     */
    public function buildShipmentRequest(Order $order, array $shipTo, string $serviceCode, float $weightLbs): array
    {
        $shipper = $this->ups->shipperAddress();
        $account = $this->ups->accountNumber();
        $weight = number_format(max(0.1, $weightLbs), 1, '.', '');
        $phone = $this->shipperPhone();
        $toPhone = $this->destinationPhone($order, $shipTo);

        $addressLines = array_values(array_filter([
            $shipTo['addressLine1'] ?? $shipTo['address1'] ?? '',
            $shipTo['addressLine2'] ?? $shipTo['address2'] ?? '',
        ], fn ($v) => filled($v)));

        $toName = trim(($shipTo['firstName'] ?? '').' '.($shipTo['lastName'] ?? ''))
            ?: trim((string) ($shipTo['name'] ?? $order->customer_name ?: 'Customer'));

        $shipment = [
            'Description' => 'Order '.$order->order_number,
            'Shipper' => [
                'Name' => $shipper['name'],
                'AttentionName' => $shipper['name'],
                'ShipperNumber' => $account,
                'Phone' => ['Number' => $phone],
                'Address' => [
                    'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                    'City' => $shipper['city'],
                    'StateProvinceCode' => strtoupper($shipper['state']),
                    'PostalCode' => $shipper['postalCode'],
                    'CountryCode' => strtoupper($shipper['country']),
                ],
            ],
            'ShipTo' => array_filter([
                'Name' => $toName,
                'AttentionName' => $toName,
                'Phone' => ['Number' => $toPhone],
                'Address' => array_filter([
                    'AddressLine' => $addressLines !== [] ? $addressLines : ['Address'],
                    'City' => (string) ($shipTo['city'] ?? ''),
                    'StateProvinceCode' => strtoupper((string) ($shipTo['state'] ?? '')),
                    'PostalCode' => (string) ($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? ''),
                    'CountryCode' => strtoupper((string) ($shipTo['country'] ?? 'US')),
                    'ResidentialAddressIndicator' => '',
                ], fn ($v, $k) => $k === 'ResidentialAddressIndicator' || filled($v), ARRAY_FILTER_USE_BOTH),
            ]),
            'ShipFrom' => [
                'Name' => $shipper['name'],
                'AttentionName' => $shipper['name'],
                'Phone' => ['Number' => $phone],
                'Address' => [
                    'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                    'City' => $shipper['city'],
                    'StateProvinceCode' => strtoupper($shipper['state']),
                    'PostalCode' => $shipper['postalCode'],
                    'CountryCode' => strtoupper($shipper['country']),
                ],
            ],
            'PaymentInformation' => [
                'ShipmentCharge' => [
                    'Type' => '01',
                    'BillShipper' => [
                        'AccountNumber' => $account,
                    ],
                ],
            ],
            'Service' => [
                'Code' => $serviceCode,
                'Description' => (string) ($order->shipping_method_name ?: $this->ups->serviceName($serviceCode)),
            ],
            'Package' => [
                'Description' => 'Garden plants / supplies',
                'Packaging' => [
                    'Code' => '02',
                    'Description' => 'Customer Supplied Package',
                ],
                'PackageWeight' => [
                    'UnitOfMeasurement' => [
                        'Code' => 'LBS',
                        'Description' => 'Pounds',
                    ],
                    'Weight' => $weight,
                ],
            ],
        ];

        if (filled($shipTo['company'] ?? null)) {
            $shipment['ShipTo']['AttentionName'] = (string) $shipTo['company'];
        }

        return [
            'ShipmentRequest' => [
                'Request' => [
                    'SubVersion' => str_replace('v', '', (string) config('ups.api_version', 'v2409')),
                    'RequestOption' => 'nonvalidate',
                    'TransactionReference' => [
                        'CustomerContext' => 'Order '.$order->order_number,
                    ],
                ],
                'Shipment' => $shipment,
                'LabelSpecification' => [
                    'LabelImageFormat' => [
                        'Code' => 'GIF',
                        'Description' => 'GIF',
                    ],
                    'HTTPUserAgent' => 'Mozilla/4.5',
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $json
     * @return array{trackingNumber: string, shipmentId: string|null, labelBase64: string, labelFormat: string}
     */
    public function parseShipmentResponse(array $json): array
    {
        $results = data_get($json, 'ShipmentResponse.ShipmentResults', []);
        $package = data_get($results, 'PackageResults');

        if (is_array($package) && array_is_list($package)) {
            $package = $package[0] ?? [];
        }
        if (! is_array($package)) {
            $package = [];
        }

        $tracking = (string) (
            data_get($package, 'TrackingNumber')
            ?? data_get($results, 'ShipmentIdentificationNumber')
            ?? ''
        );

        $shipmentId = data_get($results, 'ShipmentIdentificationNumber');
        $label = (string) data_get($package, 'ShippingLabel.GraphicImage', '');
        $format = strtolower((string) data_get($package, 'ShippingLabel.ImageFormat.Code', 'gif'));

        return [
            'trackingNumber' => $tracking,
            'shipmentId' => filled($shipmentId) ? (string) $shipmentId : null,
            'labelBase64' => $label,
            'labelFormat' => in_array($format, ['gif', 'png', 'zpl', 'epl'], true) ? $format : 'gif',
        ];
    }

    public function orderWeightLbs(Order $order): float
    {
        $order->loadMissing(['items.product', 'items.variation']);
        $default = (float) config('ups.default_package_weight_lbs', 2);
        $weight = 0.0;

        foreach ($order->items as $item) {
            $qty = max(1, (int) $item->quantity);
            $unit = $default;
            if ($item->variation?->weight) {
                $unit = (float) $item->variation->weight;
            } elseif ($item->product?->weight) {
                $unit = (float) $item->product->weight;
            }
            $weight += ShippingWeight::toPounds($unit) * $qty;
        }

        return ShippingWeight::normalizeLbs($weight > 0 ? $weight : $default);
    }

    private function storeLabel(Order $order, string $base64, string $format): string
    {
        $binary = base64_decode($base64, true);
        if ($binary === false || $binary === '') {
            throw new UpsShipmentException(
                'Invalid label base64',
                'UPS returned an invalid shipping label. The order was not marked as shipped.',
            );
        }

        $path = 'ups-labels/order-'.$order->id.'-'.now()->format('YmdHis').'.'.$format;
        Storage::disk('local')->put($path, $binary);

        return $path;
    }

    private function shipperPhone(): string
    {
        $phone = (string) config('ups.shipper.phone', '9317284000');

        return preg_replace('/\D+/', '', $phone) ?: '9317284000';
    }

    /** @param  array<string, mixed>  $shipTo */
    private function destinationPhone(Order $order, array $shipTo): string
    {
        $billing = is_array($order->billing_address) ? $order->billing_address : [];
        $raw = (string) (
            $shipTo['phone']
            ?? $billing['phone']
            ?? config('ups.shipper.phone', '9317284000')
        );
        $digits = preg_replace('/\D+/', '', $raw) ?: '0000000000';

        return $digits;
    }
}
