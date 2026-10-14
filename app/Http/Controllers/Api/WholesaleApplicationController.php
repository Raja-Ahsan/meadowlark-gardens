<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\WholesaleApplication;
use App\Services\EmailService;
use App\Services\NotificationService;
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
            'addressLine1' => ['required', 'string', 'max:255'],
            'addressLine2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:16'],
            'postalCode' => ['required', 'string', 'max:20', 'regex:/^\d{3,10}$/'],
            'country' => ['nullable', 'string', 'size:2'],
            // Legacy single-field submissions still accepted (kept for compatibility).
            'address' => ['nullable', 'string'],
            'businessType' => ['required', 'string', 'max:255'],
            'licenseDocument' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,heic,heif,doc,docx', 'max:10240'],
            'message' => ['nullable', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'licenseDocument.uploaded' => 'The license file could not be uploaded. It may be too large — please choose a smaller file or take a new photo.',
            'licenseDocument.max' => 'The license file must be 10MB or smaller.',
            'licenseDocument.mimes' => 'The license must be a PDF, Word document, or image (JPG, PNG, WEBP, HEIC).',
            'postalCode.regex' => 'ZIP code must be 3–10 digits (numbers only).',
        ]);

        $file = $request->file('licenseDocument');
        $extension = strtolower($file->getClientOriginalExtension() ?: ($file->guessExtension() ?: 'bin'));
        $name = Str::uuid().'.'.$extension;
        $path = $file->storeAs('wholesale-licenses', $name, 'public');

        $addressLine1 = trim($data['addressLine1']);
        $addressLine2 = trim((string) ($data['addressLine2'] ?? ''));
        $city = trim($data['city']);
        $state = strtoupper(trim($data['state']));
        $postalCode = trim($data['postalCode']);
        $country = strtoupper(trim((string) ($data['country'] ?? 'US'))) ?: 'US';

        $cityState = trim(implode(', ', array_filter([$city, $state], fn ($part) => $part !== '')));
        $formattedAddress = implode("\n", array_values(array_filter([
            $addressLine1,
            $addressLine2,
            trim($cityState.($postalCode !== '' ? ' '.$postalCode : '')),
        ], fn ($line) => $line !== '')));

        $application = WholesaleApplication::create([
            'business_name' => $data['businessName'],
            'contact_name' => $data['contactName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $formattedAddress,
            'address_line_1' => $addressLine1,
            'address_line_2' => $addressLine2 !== '' ? $addressLine2 : null,
            'city' => $city,
            'state' => $state,
            'postal_code' => $postalCode,
            'country' => $country,
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
                'address' => $application->formattedAddress(),
                'business_type' => $application->business_type,
                'headline' => 'New wholesale application',
                'cta' => [
                    'label' => 'Review applications',
                    'url' => url('/admin/wholesalers'),
                ],
            ]);
        }

        NotificationService::toAdmins(
            'application',
            'New wholesale application',
            "{$application->business_name} ({$application->contact_name}) applied for a wholesale account.",
            '/admin/wholesalers?status=pending'
        );

        return response()->json([
            'message' => 'Application submitted successfully! We will review it within 2–3 business days.',
            'application' => ApiFormatter::application($application),
        ], 201);
    }
}
