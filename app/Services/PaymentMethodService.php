<?php

namespace App\Services;

use App\Models\Setting;

class PaymentMethodService
{
    public static function enabledLabels(): array
    {
        $methods = [];

        if (Setting::get('stripe_enabled') === 'true') {
            $methods[] = 'Credit Card';
        }
        if (Setting::get('paypal_enabled') === 'true') {
            $methods[] = 'PayPal';
        }
        if (Setting::get('bank_transfer_enabled') === 'true') {
            $methods[] = 'Bank Transfer';
        }
        if (Setting::get('cod_enabled') === 'true') {
            $methods[] = 'Cash on Delivery';
        }

        return $methods;
    }
}
