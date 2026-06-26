<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;

class LegalPageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = LegalPage::where('is_published', true)
            ->orderBy('title')
            ->get(['slug', 'title']);

        return response()->json([
            'pages' => $pages->map(fn ($p) => [
                'slug' => $p->slug,
                'title' => $p->title,
            ])->values(),
        ]);
    }

    public function show(LegalPage $legalPage): JsonResponse
    {
        if (! $legalPage->is_published) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        return response()->json([
            'page' => ApiFormatter::legalPage($legalPage),
        ]);
    }
}
