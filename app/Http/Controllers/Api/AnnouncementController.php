<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function retail(): JsonResponse
    {
        return $this->list(Announcement::AUDIENCE_RETAIL);
    }

    public function wholesale(Request $request): JsonResponse
    {
        if (! in_array($request->user()?->role, ['wholesale', 'admin'], true)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return $this->list(Announcement::AUDIENCE_WHOLESALE);
    }

    private function list(string $audience): JsonResponse
    {
        $announcements = Announcement::query()->publishedFor($audience)->get();

        return response()->json([
            'announcements' => $announcements->map(fn ($a) => ApiFormatter::announcement($a))->values(),
        ]);
    }
}
