<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\WholesaleApplication;
use App\Services\EmailService;
use App\Support\ApiFormatter;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class WholesaleApplicationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'businessName' => ['required', 'string', 'max:255'],
            'contactName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string'],
            'businessType' => ['required', 'string', 'max:255'],
            'licenseDocument' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx', 'max:10240'],
            'message' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $file = $request->file('licenseDocument');
        $name = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('wholesale-licenses', $name, 'public');

        $application = WholesaleApplication::create([
            'business_name' => $data['businessName'],
            'contact_name' => $data['contactName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'business_type' => $data['businessType'],
            'license_document' => MediaUrl::fromStoragePath($path),
            'estimated_monthly_order' => '',
            'message' => $data['message'] ?? null,
            'password' => Hash::make($data['password']),
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        $adminEmail = Setting::get('site_email');
        if ($adminEmail) {
            EmailService::send('wholesale_application_admin', $adminEmail, [
                'name' => 'Admin',
                'business_name' => $application->business_name,
                'contact_name' => $application->contact_name,
                'email' => $application->email,
                'phone' => $application->phone,
                'business_type' => $application->business_type,
                'headline' => 'New wholesale application',
                'cta' => [
                    'label' => 'Review applications',
                    'url' => url('/admin/wholesalers'),
                ],
            ]);
        }

        return response()->json([
            'message' => 'Application submitted successfully! We will review it within 2–3 business days.',
            'application' => ApiFormatter::application($application),
        ], 201);
    }
}
