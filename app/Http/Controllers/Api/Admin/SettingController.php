<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\Setting;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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

        try {
            Mail::raw('This is a test email from Meadowlark Gardens admin panel.', function ($message) use ($data) {
                $message->to($data['to'])->subject('Meadowlark Gardens - Test Email');
            });

            return response()->json(['message' => 'Test email sent successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send: '.$e->getMessage()], 422);
        }
    }
}
