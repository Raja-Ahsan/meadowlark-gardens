<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    public static function send(string $templateSlug, string $to, array $variables = []): bool
    {
        $template = EmailTemplate::where('slug', $templateSlug)->where('is_active', true)->first();
        if (! $template) {
            return false;
        }

        $subject = self::replaceVars($template->subject, $variables);
        $body = self::replaceVars($template->body, $variables);

        try {
            self::configureMailer();

            Mail::html(nl2br(e($body)), function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });

            return true;
        } catch (\Throwable $e) {
            Log::error('Email send failed: '.$e->getMessage());

            return false;
        }
    }

    public static function replaceVars(string $text, array $variables): string
    {
        foreach ($variables as $key => $value) {
            $text = str_replace('{{'.$key.'}}', (string) $value, $text);
        }

        return $text;
    }

    private static function configureMailer(): void
    {
        $host = Setting::get('smtp_host');
        if (! $host) {
            return;
        }

        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => Setting::get('smtp_port', 587),
            'mail.mailers.smtp.username' => Setting::get('smtp_username'),
            'mail.mailers.smtp.password' => Setting::get('smtp_password'),
            'mail.mailers.smtp.encryption' => Setting::get('smtp_encryption', 'tls'),
            'mail.from.address' => Setting::get('smtp_from_email', 'noreply@meadowlarkgardens.com'),
            'mail.from.name' => Setting::get('smtp_from_name', 'Meadowlark Gardens'),
        ]);
    }
}
