<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;

class EmailService
{
    /** @var array<string, array{view: string, headline: string, intro: string}> */
    private const ORDER_VIEWS = [
        'order_confirmation' => [
            'view' => 'emails.order-confirmation',
            'headline' => 'Thank you for your order',
            'intro' => 'We\'ve received your order and are getting it ready. A summary is below.',
        ],
        'new_order_admin' => [
            'view' => 'emails.new-order-admin',
            'headline' => 'New order received',
            'intro' => 'A customer just placed an order on your store.',
        ],
        'payment_confirmation' => [
            'view' => 'emails.order-status',
            'headline' => 'Payment received',
            'intro' => 'We\'ve successfully received payment for your order.',
        ],
        'order_processing' => [
            'view' => 'emails.order-status',
            'headline' => 'Your order is being processed',
            'intro' => 'Our team is preparing your plants for shipment.',
        ],
        'order_packed' => [
            'view' => 'emails.order-status',
            'headline' => 'Your order has been packed',
            'intro' => 'Your order is packed and will ship soon.',
        ],
        'shipping_confirmation' => [
            'view' => 'emails.order-status',
            'headline' => 'Your order is on the way',
            'intro' => 'Great news — your order has shipped.',
        ],
        'delivery_confirmation' => [
            'view' => 'emails.order-status',
            'headline' => 'Your order has been delivered',
            'intro' => 'Your plants have arrived. We hope they bring beauty to your garden.',
        ],
        'order_completed' => [
            'view' => 'emails.order-status',
            'headline' => 'Order complete',
            'intro' => 'Your order is complete. Thank you for shopping with us.',
        ],
        'order_cancelled' => [
            'view' => 'emails.order-status',
            'headline' => 'Order cancelled',
            'intro' => 'Your order has been cancelled. Contact us if you have questions.',
        ],
        'order_refunded' => [
            'view' => 'emails.order-status',
            'headline' => 'Refund processed',
            'intro' => 'A refund for your order has been processed.',
        ],
    ];

    public static function send(string $templateSlug, string $to, array $variables = []): bool
    {
        $template = EmailTemplate::where('slug', $templateSlug)->where('is_active', true)->first();
        if (! $template && ! isset(self::ORDER_VIEWS[$templateSlug])) {
            return false;
        }

        $brand = self::brand();
        $variables = array_merge([
            'site_name' => $brand['site_name'],
            'site_email' => $brand['site_email'],
            'site_phone' => $brand['site_phone'],
            'site_url' => $brand['site_url'],
        ], $variables);

        $subject = $template
            ? self::replaceVars($template->subject, $variables)
            : ($brand['site_name'].' notification');

        try {
            self::configureMailer();

            if (isset($variables['order']) && is_array($variables['order'])) {
                $meta = self::ORDER_VIEWS[$templateSlug] ?? [
                    'view' => 'emails.order-status',
                    'headline' => 'Order update',
                    'intro' => 'Here is an update on your order.',
                ];

                $html = View::make($meta['view'], [
                    'brand' => $brand,
                    'subject' => $subject,
                    'headline' => $variables['headline'] ?? $meta['headline'],
                    'intro' => $variables['intro'] ?? $meta['intro'],
                    'name' => $variables['name'] ?? ($variables['order']['customer_name'] ?? 'there'),
                    'order' => $variables['order'],
                    'account' => $variables['account'] ?? null,
                    'cta' => $variables['cta'] ?? null,
                    'isAdmin' => $templateSlug === 'new_order_admin',
                ])->render();
            } else {
                $body = $template ? self::replaceVars($template->body, $variables) : '';
                $html = View::make('emails.simple', [
                    'brand' => $brand,
                    'subject' => $subject,
                    'headline' => $variables['headline'] ?? $subject,
                    'name' => $variables['name'] ?? 'there',
                    'bodyHtml' => nl2br(e($body)),
                    'cta' => $variables['cta'] ?? null,
                ])->render();
            }

            Mail::html($html, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });

            return true;
        } catch (\Throwable $e) {
            Log::error('Email send failed: '.$e->getMessage());

            return false;
        }
    }

    /**
     * @param  array{name?: string, account_email?: string, account_password?: string, account_is_new?: bool, credentials_sent?: bool}  $options
     */
    public static function sendOrder(string $templateSlug, string $to, Order $order, array $options = []): bool
    {
        $orderData = OrderDetailsPresenter::structured($order);
        $flat = OrderDetailsPresenter::forEmail($order);
        $brand = self::brand();

        $account = null;
        if (! empty($options['credentials_sent']) && ! empty($options['account_email']) && ! empty($options['account_password'])) {
            $account = [
                'email' => $options['account_email'],
                'password' => $options['account_password'],
                'is_new' => (bool) ($options['account_is_new'] ?? true),
            ];
        }

        $cta = null;
        if ($templateSlug === 'new_order_admin') {
            $cta = [
                'label' => 'Open admin orders',
                'url' => rtrim($brand['site_url'], '/').'/admin/orders',
            ];
        } elseif ($templateSlug !== 'new_order_admin') {
            $cta = [
                'label' => 'View My Account',
                'url' => rtrim($brand['site_url'], '/').'/account',
            ];
        }

        return self::send($templateSlug, $to, array_merge($flat, [
            'name' => $options['name'] ?? $orderData['customer_name'] ?: 'there',
            'order' => $orderData,
            'account' => $account,
            'cta' => $cta,
            'customer_name' => $orderData['customer_name'],
            'customer_email' => $orderData['customer_email'],
        ]));
    }

    public static function replaceVars(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            if (is_array($value) || is_object($value)) {
                continue;
            }
            $text = str_replace('{{'.$key.'}}', (string) $value, $text);
        }

        return $text;
    }

    /**
     * @return array{site_name: string, site_email: string, site_phone: string, site_url: string, from_name: string}
     */
    public static function brand(): array
    {
        $url = rtrim((string) config('app.url', ''), '/');

        return [
            'site_name' => (string) Setting::get('site_name', Setting::get('smtp_from_name', 'Meadowlark Gardens')),
            'site_email' => (string) Setting::get('site_email', Setting::get('smtp_from_email', '')),
            'site_phone' => (string) Setting::get('site_phone', ''),
            'site_url' => $url !== '' ? $url : 'http://localhost',
            'from_name' => (string) Setting::get('smtp_from_name', Setting::get('site_name', 'Meadowlark Gardens')),
        ];
    }

    public static function configureMailer(): void
    {
        $host = Setting::get('smtp_host');
        if (! $host) {
            return;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.transport' => 'smtp',
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => (int) Setting::get('smtp_port', 587),
            'mail.mailers.smtp.username' => Setting::get('smtp_username'),
            'mail.mailers.smtp.password' => Setting::get('smtp_password'),
            'mail.mailers.smtp.encryption' => Setting::get('smtp_encryption', 'tls') ?: null,
            'mail.from.address' => Setting::get('smtp_from_email', 'noreply@meadowlarkgardens.com'),
            'mail.from.name' => Setting::get('smtp_from_name', 'Meadowlark Gardens'),
        ]);
    }
}
