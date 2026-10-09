<?php

namespace App\Services;

use App\Exceptions\UpsRateException;
use App\Models\Setting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class UpsShippingService
{
    public function isEnabled(): bool
    {
        if (! $this->clientId() || ! $this->clientSecret()) {
            return false;
        }

        $envEnabled = config('ups.enabled');
        if ($envEnabled !== null && $envEnabled !== '') {
            return filter_var($envEnabled, FILTER_VALIDATE_BOOLEAN);
        }

        return $this->setting('ups_enabled') === 'true';
    }

    public function environment(): string
    {
        $env = strtolower((string) config('ups.environment', 'sandbox'));
        if (in_array($env, ['production', 'live', 'prod'], true)) {
            return 'production';
        }

        // Legacy admin setting fallback when env credentials are absent.
        if ($env === 'sandbox' && ! filled(config('ups.client_id')) && $this->setting('ups_sandbox', 'true') === 'false') {
            return 'production';
        }

        return 'sandbox';
    }

    public function isSandbox(): bool
    {
        return $this->environment() === 'sandbox';
    }

    public function baseUrl(): string
    {
        return $this->isSandbox()
            ? (string) config('ups.sandbox_url')
            : (string) config('ups.production_url');
    }

    public function clientId(): ?string
    {
        $fromEnv = config('ups.client_id');
        if (filled($fromEnv)) {
            return (string) $fromEnv;
        }

        $fromSettings = $this->setting('ups_client_id');

        return filled($fromSettings) ? (string) $fromSettings : null;
    }

    public function clientSecret(): ?string
    {
        $fromEnv = config('ups.client_secret');
        if (filled($fromEnv)) {
            return (string) $fromEnv;
        }

        $fromSettings = $this->setting('ups_client_secret');

        return filled($fromSettings) ? (string) $fromSettings : null;
    }

    public function accountNumber(): string
    {
        $fromEnv = config('ups.account_number');
        if (filled($fromEnv)) {
            return (string) $fromEnv;
        }

        return (string) ($this->setting('ups_account_number', '') ?? '');
    }

    public function testConnection(): array
    {
        $token = $this->getAccessToken(true);

        return [
            'connected' => filled($token),
            'environment' => $this->environment(),
            'tokenPreview' => substr($token, 0, 8).'…',
        ];
    }

    /**
     * @param  array<string, mixed>  $shipTo
     * @return array<int, array{carrier: string, code: string, name: string, cost: float, currency: string, etaDays: int|null}>
     */
    public function getRates(array $shipTo, float $totalWeightLbs): array
    {
        $started = microtime(true);
        $token = $this->getAccessToken();
        $payload = $this->buildRateRequest($shipTo, max(0.1, $totalWeightLbs));

        Log::info('UPS rate request started', [
            'environment' => $this->environment(),
            'postal' => $shipTo['postalCode'] ?? $shipTo['postal_code'] ?? null,
            'country' => $shipTo['country'] ?? 'US',
            'weightLbs' => round($totalWeightLbs, 2),
        ]);

        try {
            $response = Http::timeout((int) config('ups.timeout_seconds', 15))
                ->connectTimeout((int) config('ups.connect_timeout_seconds', 5))
                ->withToken($token)
                ->withHeaders([
                    'transId' => substr(uniqid('mg_', true), 0, 32),
                    'transactionSrc' => 'meadowlark_garden',
                ])
                ->acceptJson()
                ->asJson()
                ->post(
                    $this->baseUrl().'/api/rating/'.config('ups.api_version').'/Shop',
                    $payload
                );
        } catch (ConnectionException $e) {
            Log::warning('UPS rate request timeout/connection failure', [
                'message' => $e->getMessage(),
            ]);
            throw new UpsRateException(
                $e->getMessage(),
                'Shipping rates are temporarily unavailable. Please try again in a moment.',
            );
        }

        $elapsedMs = (int) round((microtime(true) - $started) * 1000);

        if ($response->status() === 401) {
            // Token may have expired early — refresh once.
            $token = $this->getAccessToken(true);
            $response = Http::timeout((int) config('ups.timeout_seconds', 15))
                ->connectTimeout((int) config('ups.connect_timeout_seconds', 5))
                ->withToken($token)
                ->withHeaders([
                    'transId' => substr(uniqid('mg_', true), 0, 32),
                    'transactionSrc' => 'meadowlark_garden',
                ])
                ->acceptJson()
                ->asJson()
                ->post(
                    $this->baseUrl().'/api/rating/'.config('ups.api_version').'/Shop',
                    $payload
                );
        }

        if (! $response->successful()) {
            $json = $response->json() ?? [];
            Log::warning('UPS rate request failed', [
                'status' => $response->status(),
                'elapsed_ms' => $elapsedMs,
                'error' => data_get($json, 'response.errors.0.message')
                    ?? data_get($json, 'response.errors.0.code')
                    ?? 'http_'.$response->status(),
            ]);
            throw UpsRateException::fromUpsResponse(is_array($json) ? $json : [], $response->status());
        }

        $rates = $this->parseRates($response->json() ?? []);

        Log::info('UPS rate request completed', [
            'elapsed_ms' => $elapsedMs,
            'services' => count($rates),
        ]);

        if ($rates === []) {
            throw new UpsRateException(
                'UPS returned no rated shipments',
                'No shipping methods are available for this address.',
                'postalCode',
            );
        }

        return $rates;
    }

    public function getAccessToken(bool $forceRefresh = false): string
    {
        $cacheKey = 'ups.oauth_token.'.$this->environment().'.'.sha1((string) $this->clientId());

        if ($forceRefresh) {
            Cache::forget($cacheKey);
        }

        $cached = Cache::get($cacheKey);
        if (is_string($cached) && $cached !== '') {
            return $cached;
        }

        $clientId = $this->clientId();
        $clientSecret = $this->clientSecret();
        if (! $clientId || ! $clientSecret) {
            throw new \RuntimeException('UPS credentials are not configured.');
        }

        try {
            $response = Http::timeout((int) config('ups.timeout_seconds', 15))
                ->connectTimeout((int) config('ups.connect_timeout_seconds', 5))
                ->asForm()
                ->withBasicAuth($clientId, $clientSecret)
                ->withHeaders(array_filter([
                    'x-merchant-id' => $this->accountNumber() ?: null,
                ]))
                ->post($this->baseUrl().'/security/v1/oauth/token', [
                    'grant_type' => 'client_credentials',
                ]);
        } catch (ConnectionException $e) {
            Log::warning('UPS OAuth connection failure', ['message' => $e->getMessage()]);
            throw new UpsRateException(
                $e->getMessage(),
                'Shipping rates are temporarily unavailable. Please try again in a moment.',
            );
        }

        if (! $response->successful()) {
            Log::warning('UPS OAuth failed', [
                'status' => $response->status(),
                'environment' => $this->environment(),
            ]);
            throw new UpsRateException(
                'UPS OAuth HTTP '.$response->status(),
                'Shipping rates are temporarily unavailable. Please try again in a moment.',
            );
        }

        $token = (string) $response->json('access_token');
        if ($token === '') {
            throw new UpsRateException(
                'UPS authentication returned no token',
                'Shipping rates are temporarily unavailable. Please try again in a moment.',
            );
        }

        $expiresIn = (int) ($response->json('expires_in') ?? 14399);
        // Refresh a bit early so checkout never uses an almost-expired token.
        $ttl = max(60, min(7000, $expiresIn - 120));
        Cache::put($cacheKey, $token, $ttl);

        Log::info('UPS OAuth token cached', [
            'environment' => $this->environment(),
            'ttl_seconds' => $ttl,
        ]);

        return $token;
    }

    /**
     * @param  array<string, mixed>  $shipTo
     * @return array<string, mixed>
     */
    public function buildRateRequest(array $shipTo, float $weightLbs): array
    {
        $shipper = $this->shipperAddress();
        $weight = number_format($weightLbs, 1, '.', '');
        $account = $this->accountNumber();

        $addressLines = array_values(array_filter([
            $shipTo['addressLine1'] ?? $shipTo['address1'] ?? '',
            $shipTo['addressLine2'] ?? $shipTo['address2'] ?? '',
        ], fn ($v) => filled($v)));

        $shipment = [
            'Shipper' => [
                'Name' => $shipper['name'],
                'ShipperNumber' => $account,
                'Address' => [
                    'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                    'City' => $shipper['city'],
                    'StateProvinceCode' => strtoupper($shipper['state']),
                    'PostalCode' => $shipper['postalCode'],
                    'CountryCode' => strtoupper($shipper['country']),
                ],
            ],
            'ShipTo' => [
                'Name' => trim(($shipTo['firstName'] ?? '').' '.($shipTo['lastName'] ?? ''))
                    ?: trim((string) ($shipTo['name'] ?? 'Customer')),
                'Address' => array_filter([
                    'AddressLine' => $addressLines !== [] ? $addressLines : ['Address'],
                    'City' => (string) ($shipTo['city'] ?? ''),
                    'StateProvinceCode' => strtoupper((string) ($shipTo['state'] ?? '')),
                    'PostalCode' => (string) ($shipTo['postalCode'] ?? $shipTo['postal_code'] ?? ''),
                    'CountryCode' => strtoupper((string) ($shipTo['country'] ?? 'US')),
                    // Empty value marks residential for UPS Rating API.
                    'ResidentialAddressIndicator' => '',
                ], fn ($v, $k) => $k === 'ResidentialAddressIndicator' || filled($v), ARRAY_FILTER_USE_BOTH),
            ],
            'ShipFrom' => [
                'Name' => $shipper['name'],
                'Address' => [
                    'AddressLine' => array_values(array_filter([$shipper['addressLine1']])),
                    'City' => $shipper['city'],
                    'StateProvinceCode' => strtoupper($shipper['state']),
                    'PostalCode' => $shipper['postalCode'],
                    'CountryCode' => strtoupper($shipper['country']),
                ],
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
        ];

        if ($account !== '') {
            $shipment['PaymentDetails'] = [
                'ShipmentCharge' => [
                    'Type' => '01',
                    'BillShipper' => [
                        'AccountNumber' => $account,
                    ],
                ],
            ];
        }

        return [
            'RateRequest' => [
                'Request' => [
                    'TransactionReference' => [
                        'CustomerContext' => 'Meadowlark Gardens rate quote',
                    ],
                ],
                'Shipment' => $shipment,
            ],
        ];
    }

    /** @return array{name: string, addressLine1: string, city: string, state: string, postalCode: string, country: string} */
    public function shipperAddress(): array
    {
        return [
            'name' => (string) $this->setting(
                'ups_shipper_name',
                $this->setting('site_name', config('ups.shipper.name', 'Meadowlark Gardens TN'))
            ),
            'addressLine1' => (string) $this->setting(
                'ups_shipper_address_line',
                config('ups.shipper.address_line', '1200 Meadowlark Place')
            ),
            'city' => (string) $this->setting('ups_shipper_city', config('ups.shipper.city', 'Manchester')),
            'state' => (string) $this->setting('ups_shipper_state', config('ups.shipper.state', 'TN')),
            'postalCode' => (string) $this->setting(
                'ups_shipper_postal_code',
                config('ups.shipper.postal_code', '37355')
            ),
            'country' => (string) $this->setting('ups_shipper_country', config('ups.shipper.country', 'US')),
        ];
    }

    private function setting(string $key, mixed $default = null): mixed
    {
        try {
            if (! Schema::hasTable('settings')) {
                return $default;
            }

            return Setting::get($key, $default);
        } catch (\Throwable) {
            return $default;
        }
    }

    /**
     * @param  array<string, mixed>  $json
     * @return array<int, array{carrier: string, code: string, name: string, cost: float, currency: string, etaDays: int|null}>
     */
    public function parseRates(array $json): array
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
                'name' => (string) (data_get($shipment, 'Service.Description') ?: $this->serviceName($code)),
                'cost' => round($cost, 2),
                'currency' => (string) data_get($shipment, 'TotalCharges.CurrencyCode', 'USD'),
                'etaDays' => $eta !== null ? (int) $eta : null,
            ];
        }

        usort($rates, fn ($a, $b) => $a['cost'] <=> $b['cost']);

        return $rates;
    }

    public function serviceName(string $code): string
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
