<?php

namespace App\Exceptions;

use RuntimeException;

class UpsRateException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly string $userMessage,
        private readonly ?string $field = null,
        private readonly ?string $upsCode = null,
    ) {
        parent::__construct($message);
    }

    public function getUserMessage(): string
    {
        return $this->userMessage;
    }

    public function getField(): ?string
    {
        return $this->field;
    }

    public function getUpsCode(): ?string
    {
        return $this->upsCode;
    }

    /**
     * Map a UPS API error payload to a customer-safe exception.
     *
     * @param  array<string, mixed>  $json
     */
    public static function fromUpsResponse(array $json, int $status): self
    {
        $upsMessage = (string) (
            data_get($json, 'response.errors.0.message')
            ?? data_get($json, 'Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description')
            ?? ''
        );
        $upsCode = (string) (
            data_get($json, 'response.errors.0.code')
            ?? data_get($json, 'Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Code')
            ?? ''
        );

        $lower = strtolower($upsMessage);

        if (
            str_contains($lower, 'postal')
            || str_contains($lower, 'zip')
            || str_contains($lower, 'invalid for')
        ) {
            return new self(
                $upsMessage !== '' ? $upsMessage : 'UPS rejected postal code',
                'ZIP code does not match the selected city/state. Please enter a valid shipping address.',
                'postalCode',
                $upsCode !== '' ? $upsCode : null,
            );
        }

        if (str_contains($lower, 'city')) {
            return new self(
                $upsMessage !== '' ? $upsMessage : 'UPS rejected city',
                'City does not match the selected state/ZIP. Please enter a valid shipping address.',
                'city',
                $upsCode !== '' ? $upsCode : null,
            );
        }

        if (str_contains($lower, 'state') || str_contains($lower, 'province')) {
            return new self(
                $upsMessage !== '' ? $upsMessage : 'UPS rejected state',
                'State does not match the selected city/ZIP. Please enter a valid shipping address.',
                'state',
                $upsCode !== '' ? $upsCode : null,
            );
        }

        if (str_contains($lower, 'address') || $status === 400) {
            return new self(
                $upsMessage !== '' ? $upsMessage : 'UPS rejected address',
                'Please enter a valid shipping address.',
                'postalCode',
                $upsCode !== '' ? $upsCode : null,
            );
        }

        return new self(
            $upsMessage !== '' ? $upsMessage : 'UPS rate request failed (HTTP '.$status.')',
            'Shipping rates are temporarily unavailable. Please try again in a moment.',
            null,
            $upsCode !== '' ? $upsCode : null,
        );
    }
}
