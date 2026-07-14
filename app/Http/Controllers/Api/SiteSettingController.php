<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\PublicSiteSettings;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'settings' => PublicSiteSettings::toArray(),
        ]);
    }
}
