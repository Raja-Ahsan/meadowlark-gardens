<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpsShippingService
{
    public function isEnabled(): bool
    {
        return Setting::get('ups_enabled') === 'true'
            && Setting::get('ups_client_id')
            && Setting::get('ups_client_secret');
    }

    public function baseUrl(): string
    {
        $sandbox = Setting::get('ups_sandbox', 'true') === 'true';

        return $sandbox
            ? config('ups.sandbox_url')
            : config('ups.production_url');
    }

    public function testConnection(): array
    {
        $token = $this->getAccessToken(true);

        return [
            'connected' => true,
            'environment' => Setting::get('ups_sandbox', 'true') === 'true' ? 'sandbox' : 'production',
            'tokenPreview' => substr($token, 0, 12).'...',
        ];
    }

    /** @return array<int, array{carrier: string, code: string, name: string, cost: float, currency: string, etaDays: int|null}> */
    public function getRates(array $shipTo, float $totalWeightLbs): array
    {
        $token = $this->getAccessToken();
        $payload = $this->buildRateRequest($shipTo, max(0.1, $totalWeightLbs));

        $response = Http::withToken($token)
            ->withHeaders([
                'transId' => substr(uniqid('mg_', true), 0, 32),
                'transactionSrc' => 'meadowlark_garden',
            ])
            ->post(
                $this->baseUrl().'/api/rating/'.config('ups.api_version').'/Shop',
                $payload
            );

        if (! $response->successful()) {
            Log::warning('UPS rate request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('UPS could not return shipping rates.');
        }

        return $this->parseRates($response->json());
    }

    public function getAccessToken(bool $forceRefresh = false): string
    {
        $cacheKey = 'ups.access_token.'.(Setting::get('ups_sandbox', 'true') === 'true' ? 'sandbox' : 'prod');

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        return Cache::remember($cacheKey, 7000, function () {
            $clientId = Setting::get('ups_client_id');
            $clientSecret = Setting::get('ups_client_secret');

            $response = Http::asForm()
                ->withBasicAuth($clientId, $clientSecret)
                ->withHeaders(array_filter([
                    'x-merchant-id' => Setting::get('ups_account_number') ?: null,
                ]))
                ->post($this->baseUrl().'/security/v1/oauth/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if (! $response->successful()) {
                throw new \RuntimeException('UPS authentication failed.');
            }

            $token = $response->json('access_token');
            if (! $token) {
                throw new \RuntimeException('UPS authentication returned no token.');
            }

            return $token;
        });
    }

    private function buildRateRequest(array $shipTo, float $weightLbs): array
    {
        $shipper = $this->shipperAddress();
        $weight = number_format($weightLbs, 1, '.', '');

        return [
            'RateRequest' => [
                'Request' => [
                    'TransactionReference' => [
                        'CustomerContext' => 'Meadowlark Gardens rate quote',
                    ],
                ],
                'Shipment' => [
                    'Shipper' => [
                        'Name' => $shipper['name'],
                        'ShipperNumber' => Setting::get('ups_account_number', ''),
                        'Address' => [
                            'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                            'City' => $shipper['city'],
                            'StateProvinceCode' => $shipper['state'],
                            'PostalCode' => $shipper['postalCode'],
                            'CountryCode' => $shipper['country'],
                        ],
                    ],
                    'ShipTo' => [
                        'Name' => trim(($shipTo['firstName'] ?? '').' '.($shipTo['lastName'] ?? '')) ?: 'Customer',
                        'Address' => [
                            'AddressLine' => array_values(array_filter([
                                $shipTo['addressLine1'] ?? $shipTo['address1'] ?? '',
                            ])),
                            'City' => $shipTo['city'] ?? '',
                            'StateProvinceCode' => $shipTo['state'] ?? '',
                            'PostalCode' => $shipTo['postalCode'] ?? $shipTo['postal_code'] ?? '',
                            'CountryCode' => $shipTo['country'] ?? 'US',
                        ],
                    ],
                    'ShipFrom' => [
                        'Name' => $shipper['name'],
                        'Address' => [
                            'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                            'City' => $shipper['city'],
                            'StateProvinceCode' => $shipper['state'],
                            'PostalCode' => $shipper['postalCode'],
                            'CountryCode' => $shipper['country'],
                        ],
                    ],
                    'PaymentDetails' => [
                        'ShipmentCharge' => [
                            'Type' => '01',
                            'BillShipper' => [
                                'AccountNumber' => Setting::get('ups_account_number', ''),
                            ],
                        ],
                    ],
                    'Service' => [
                        'Code' => '03',
                        'Description' => 'UPS Ground',
                    ],
                    'NumOfPieces' => '1',
                    'Package' => [
                        'PackagingType' => [
                            'Code' => '02',
                            'Description' => 'Package',
                        ],
                        'PackageWeight' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'LBS',
                                'Description' => 'Pounds',
                            ],
                            'Weight' => $weight,
                        ],
                    ],
                ],
            ],
        ];
    }

    /** @return array{name: string, addressLine1: string, city: string, state: string, postalCode: string, country: string} */
    private function shipperAddress(): array
    {
        return [
            'name' => Setting::get('ups_shipper_name', Setting::get('site_name', 'Meadowlark Gardens TN')),
            'addressLine1' => Setting::get('ups_shipper_address_line', '1200 Meadowlark Place'),
            'city' => Setting::get('ups_shipper_city', 'Manchester'),
            'state' => Setting::get('ups_shipper_state', 'TN'),
            'postalCode' => Setting::get('ups_shipper_postal_code', '37355'),
            'country' => Setting::get('ups_shipper_country', 'US'),
        ];
    }

    /** @return array<int, array{carrier: string, code: string, name: string, cost: float, currency: string, etaDays: int|null}> */
    private function parseRates(array $json): array
    {
        $rated = data_get($json, 'RateResponse.RatedShipment', []);

        if ($rated === []) {
            return [];
        }

        if (isset($rated['Service'])) {
            $rated = [$rated];
        }

        $rates = [];

        foreach ($rated as $shipment) {
            $code = (string) data_get($shipment, 'Service.Code', '');
            if ($code === '') {
                continue;
            }

            $cost = (float) data_get($shipment, 'TotalCharges.MonetaryValue', 0);
            $eta = data_get($shipment, 'GuaranteedDelivery.BusinessDaysInTransit')
                ?? data_get($shipment, 'TimeInTransit.ServiceSummary.EstimatedArrival.BusinessDaysInTransit');

            $rates[] = [
                'carrier' => 'ups',
                'code' => $code,
                'name' => data_get($shipment, 'Service.Description') ?: $this->serviceName($code),
                'cost' => round($cost, 2),
                'currency' => (string) data_get($shipment, 'TotalCharges.CurrencyCode', 'USD'),
                'etaDays' => $eta !== null ? (int) $eta : null,
            ];
        }

        usort($rates, fn ($a, $b) => $a['cost'] <=> $b['cost']);

        return $rates;
    }

    private function serviceName(string $code): string
    {
        return match ($code) {
            '01' => 'UPS Next Day Air',
            '02' => 'UPS 2nd Day Air',
            '03' => 'UPS Ground',
            '12' => 'UPS 3 Day Select',
            '13' => 'UPS Next Day Air Saver',
            '14' => 'UPS Next Day Air Early',
            '59' => 'UPS 2nd Day Air A.M.',
            default => 'UPS Service '.$code,
        };
    }
}
