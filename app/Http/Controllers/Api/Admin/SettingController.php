<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Support\ApiFormatter;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::orderBy('group')->orderBy('key')->get()
            ->groupBy('group')
            ->map(fn ($group) => $group->pluck('value', 'key'));

        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'group' => ['nullable', 'string'],
        ]);

        $group = $data['group'] ?? 'general';

        foreach ($data['settings'] as $key => $value) {
            Setting::set($key, is_array($value) ? json_encode($value) : (string) $value, $group);
        }

        return response()->json(['message' => 'Settings saved.']);
    }

    public function emailTemplates(): JsonResponse
    {
        $templates = EmailTemplate::orderBy('name')->get();

        return response()->json([
            'templates' => $templates->map(fn ($t) => ApiFormatter::emailTemplate($t))->values(),
        ]);
    }

    public function updateEmailTemplate(Request $request, EmailTemplate $template): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'subject' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $template->update([
            'name' => $data['name'] ?? $template->name,
            'subject' => $data['subject'] ?? $template->subject,
            'body' => $data['body'] ?? $template->body,
            'is_active' => $data['isActive'] ?? $template->is_active,
        ]);

        return response()->json([
            'message' => 'Template updated.',
            'template' => ApiFormatter::emailTemplate($template->fresh()),
        ]);
    }

    public function testEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'to' => ['required', 'email'],
        ]);

        if (! Setting::get('smtp_host')) {
            return response()->json([
                'message' => 'Configure and save SMTP settings (host, port, credentials) before sending a test.',
            ], 422);
        }

        try {
            EmailService::configureMailer();
            $brand = EmailService::brand();

            $html = View::make('emails.simple', [
                'brand' => $brand,
                'subject' => $brand['site_name'].' - Test Email',
                'headline' => 'SMTP test successful',
                'name' => 'Admin',
                'bodyHtml' => '<p>Your Meadowlark Gardens email settings are configured correctly.</p>',
                'cta' => ['label' => 'Visit website', 'url' => $brand['site_url']],
            ])->render();

            Mail::html($html, function ($message) use ($data, $brand) {
                $message->to($data['to'])->subject($brand['site_name'].' - Test Email');
            });

            return response()->json(['message' => 'Test email sent successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send: '.$e->getMessage()], 422);
        }
    }
}
