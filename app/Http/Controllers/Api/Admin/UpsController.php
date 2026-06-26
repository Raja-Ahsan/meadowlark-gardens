<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UpsShippingService;
use Illuminate\Http\JsonResponse;

class UpsController extends Controller
{
    public function test(UpsShippingService $ups): JsonResponse
    {
        if (! $ups->isEnabled()) {
            return response()->json([
                'message' => 'UPS is not enabled or credentials are missing.',
            ], 422);
        }

        try {
            $result = $ups->testConnection();

            return response()->json([
                'message' => 'UPS connection successful ('.$result['environment'].').',
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'UPS connection failed: '.$e->getMessage(),
            ], 422);
        }
    }
}
