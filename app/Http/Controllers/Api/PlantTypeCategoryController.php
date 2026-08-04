<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantTypeCategory;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;

class PlantTypeCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = PlantTypeCategory::query()
            ->where('is_published', true)
            ->with(['publishedPlantTypes' => fn ($q) => $q->orderBy('sort_order')->orderBy('title')])
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json([
            'categories' => $categories
                ->map(fn ($c) => ApiFormatter::plantTypeCategory($c, true))
                ->values(),
        ]);
    }
}
