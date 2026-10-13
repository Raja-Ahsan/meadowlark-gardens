<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:20'],
        ]);

        ContactMessage::create($data);

        NotificationService::toAdmins(
            'message',
            'New message from '.$data['name'],
            Str::limit($data['subject'], 120),
            '/admin/contact'
        );

        return response()->json(['message' => 'Thank you! We will get back to you soon.']);
    }
}
