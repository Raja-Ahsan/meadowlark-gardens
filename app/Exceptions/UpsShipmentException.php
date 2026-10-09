<?php

namespace App\Exceptions;

use RuntimeException;

class UpsShipmentException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly string $userMessage,
        private readonly ?string $upsCode = null,
    ) {
        parent::__construct($message);
    }

    public function getUserMessage(): string
    {
        return $this->userMessage;
    }

    public function getUpsCode(): ?string
    {
        return $this->upsCode;
    }

    /**
     * @param  array<string, mixed>  $json
     */
    public static function fromUpsResponse(array $json, int $status): self
    {
        $upsMessage = (string) (
            data_get($json, 'response.errors.0.message')
            ?? data_get($json, 'Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description')
            ?? data_get($json, 'ShipmentResponse.Response.Alert.Description')
            ?? ''
        );
        $upsCode = (string) (
            data_get($json, 'response.errors.0.code')
            ?? data_get($json, 'Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Code')
            ?? ''
        );

        $user = $upsMessage !== ''
            ? 'UPS shipment could not be created: '.$upsMessage
            : 'UPS shipment could not be created. Please verify the shipping address and account settings.';

        return new self(
            $upsMessage !== '' ? $upsMessage : 'UPS shipment HTTP '.$status,
            $user,
            $upsCode !== '' ? $upsCode : null,
        );
    }
}
