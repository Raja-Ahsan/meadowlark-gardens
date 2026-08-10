<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WholesaleApplication;
use App\Support\ApiFormatter;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Application submitted successfully! We will review it within 2–3 business days.',
            'application' => ApiFormatter::application($application),
        ], 201);
    }
}
