<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WholesaleApplication;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'estimatedMonthlyOrder' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
        ]);

        $application = WholesaleApplication::create([
            'business_name' => $data['businessName'],
            'contact_name' => $data['contactName'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'business_type' => $data['businessType'],
            'estimated_monthly_order' => $data['estimatedMonthlyOrder'],
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
