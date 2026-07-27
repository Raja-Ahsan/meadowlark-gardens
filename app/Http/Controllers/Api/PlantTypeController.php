<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantType;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;

class PlantTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = PlantType::where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json([
            'plantTypes' => $types->map(fn ($t) => ApiFormatter::plantType($t))->values(),
        ]);
    }

    public function show(PlantType $plantType): JsonResponse
    {
        if (! $plantType->is_published) {
            return response()->json(['message' => 'Plant type not found.'], 404);
        }

        return response()->json([
            'plantType' => ApiFormatter::plantType($plantType),
        ]);
    }
}
