<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthorizeNetService
{
    public function isConfigured(): bool
    {
        return filled(config('services.authorize_net.api_login_id'))
            && filled(config('services.authorize_net.transaction_key'))
            && filled(config('services.authorize_net.client_key'));
    }

    public function isSandbox(): bool
    {
        return (bool) config('services.authorize_net.sandbox', true);
    }

    /**
     * Direct card payloads are only allowed in sandbox (Accept.js needs HTTPS; local HTTP cannot tokenize).
     */
    public function allowsDirectCard(): bool
    {
        return $this->isSandbox();
    }

    public function endpoint(): string
    {
        return $this->isSandbox()
            ? 'https://apitest.authorize.net/xml/v1/request.api'
            : 'https://api.authorize.net/xml/v1/request.api';
    }

    /**
     * Charge a payment nonce from Accept.js (opaqueData).
     *
     * @return array{success: bool, transId?: string, message?: string, raw?: mixed}
     */
    public function chargeOpaqueData(
        float $amount,
        string $dataDescriptor,
        string $dataValue,
        string $invoiceNumber,
        ?string $email = null
    ): array {
        return $this->createTransaction(
            $amount,
            [
                'opaqueData' => [
                    'dataDescriptor' => $dataDescriptor,
                    'dataValue' => $dataValue,
                ],
            ],
            $invoiceNumber,
            $email
        );
    }

    /**
     * Sandbox-only: charge raw card data (for local HTTP where Accept.js refuses to run).
     *
     * @param  array{cardNumber: string, expMonth: string, expYear: string, cardCode: string}  $card
     * @return array{success: bool, transId?: string, message?: string, raw?: mixed}
     */
    public function chargeCard(
        float $amount,
        array $card,
        string $invoiceNumber,
        ?string $email = null
    ): array {
        if (! $this->allowsDirectCard()) {
            return ['success' => false, 'message' => 'Direct card entry is only available in Authorize.net sandbox.'];
        }

        $number = preg_replace('/\D+/', '', (string) ($card['cardNumber'] ?? '')) ?: '';
        $month = str_pad(preg_replace('/\D+/', '', (string) ($card['expMonth'] ?? '')) ?: '', 2, '0', STR_PAD_LEFT);
        $year = preg_replace('/\D+/', '', (string) ($card['expYear'] ?? '')) ?: '';
        if (strlen($year) === 2) {
            $year = '20'.$year;
        }
        $code = preg_replace('/\D+/', '', (string) ($card['cardCode'] ?? '')) ?: '';

        if (strlen($number) < 13 || strlen($month) !== 2 || strlen($year) !== 4 || strlen($code) < 3) {
            return ['success' => false, 'message' => 'Invalid card details.'];
        }

        return $this->createTransaction(
            $amount,
            [
                'creditCard' => [
                    'cardNumber' => $number,
                    'expirationDate' => $year.'-'.$month,
                    'cardCode' => $code,
                ],
            ],
            $invoiceNumber,
            $email
        );
    }

    /**
     * @param  array<string, mixed>  $payment
     * @return array{success: bool, transId?: string, message?: string, raw?: mixed}
     */
    private function createTransaction(
        float $amount,
        array $payment,
        string $invoiceNumber,
        ?string $email = null
    ): array {
        if (! $this->isConfigured()) {
            return ['success' => false, 'message' => 'Authorize.net is not configured.'];
        }

        $payload = [
            'createTransactionRequest' => [
                'merchantAuthentication' => [
                    'name' => config('services.authorize_net.api_login_id'),
                    'transactionKey' => config('services.authorize_net.transaction_key'),
                ],
                'refId' => substr(preg_replace('/[^A-Za-z0-9\-]/', '', $invoiceNumber) ?: uniqid('ord'), 0, 20),
                'transactionRequest' => [
                    'transactionType' => 'authCaptureTransaction',
                    'amount' => number_format($amount, 2, '.', ''),
                    'payment' => $payment,
                    'order' => [
                        'invoiceNumber' => substr($invoiceNumber, 0, 20),
                        'description' => 'Meadowlark Gardens order '.$invoiceNumber,
                    ],
                    'customer' => array_filter([
                        'email' => $email,
                    ]),
                ],
            ],
        ];

        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->asJson()
                ->post($this->endpoint(), $payload);
        } catch (\Throwable $e) {
            Log::error('Authorize.net request failed', ['error' => $e->getMessage()]);

            return ['success' => false, 'message' => 'Payment gateway connection failed.'];
        }

        // Authorize.net often prefixes JSON with a UTF-8 BOM, which breaks json_decode.
        $body = preg_replace('/^\xEF\xBB\xBF/', '', (string) $response->body()) ?? '';
        $json = json_decode($body, true);
        if (! is_array($json)) {
            Log::error('Authorize.net returned unreadable response', [
                'status' => $response->status(),
                'body' => substr($body, 0, 500),
            ]);

            return ['success' => false, 'message' => 'Payment gateway returned an invalid response.'];
        }

        $txn = $json['transactionResponse'] ?? [];
        $resultCode = $json['messages']['resultCode'] ?? null;
        $responseCode = (string) ($txn['responseCode'] ?? '');

        if ($resultCode === 'Ok' && in_array($responseCode, ['1', '4'], true) && ! empty($txn['transId'])) {
            return [
                'success' => true,
                'transId' => (string) $txn['transId'],
                'raw' => $json,
            ];
        }

        $message = $txn['errors'][0]['errorText']
            ?? $json['messages']['message'][0]['text']
            ?? 'Card payment was declined.';

        Log::warning('Authorize.net charge declined', [
            'invoice' => $invoiceNumber,
            'message' => $message,
            'responseCode' => $responseCode,
        ]);

        return [
            'success' => false,
            'message' => $message,
            'raw' => $json,
        ];
    }
}
