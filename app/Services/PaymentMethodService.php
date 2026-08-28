<?php

namespace App\Services;

use App\Models\Setting;

class PaymentMethodService
{
    public const LABEL_AUTHORIZE = 'Credit Card';

    public const LABEL_STRIPE = 'Credit Card (Stripe)';

    public static function isAuthorizeEnabled(): bool
    {
        $flag = Setting::get('authorize_net_enabled');

        if ($flag === null || $flag === '') {
            return filled(config('services.authorize_net.api_login_id'));
        }

        return $flag === 'true';
    }

    public static function enabledLabels(): array
    {
        $methods = [];

        if (self::isAuthorizeEnabled()) {
            $methods[] = self::LABEL_AUTHORIZE;
        }
        if (Setting::get('stripe_enabled') === 'true') {
            $methods[] = self::LABEL_STRIPE;
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
