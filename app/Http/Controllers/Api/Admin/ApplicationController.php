<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WholesaleApplication;
use App\Services\EmailService;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = WholesaleApplication::latest('submitted_at')->get();

        return response()->json([
            'applications' => $applications->map(fn ($a) => ApiFormatter::application($a))->values(),
        ]);
    }

    public function updateStatus(Request $request, WholesaleApplication $application): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $application->update(['status' => $data['status']]);

        if ($data['status'] === 'approved') {
            $password = Str::random(10);

            User::updateOrCreate(
                ['email' => $application->email],
                [
                    'name' => $application->contact_name,
                    'business_name' => $application->business_name,
                    'password' => Hash::make($password),
                    'role' => 'wholesale',
                    'approved' => true,
                ]
            );

            EmailService::send('wholesale_approved', $application->email, [
                'name' => $application->contact_name,
                'business_name' => $application->business_name,
            ]);
        }

        return response()->json([
            'message' => 'Application '.$data['status'].'.',
            'application' => ApiFormatter::application($application->fresh()),
        ]);
    }
}
