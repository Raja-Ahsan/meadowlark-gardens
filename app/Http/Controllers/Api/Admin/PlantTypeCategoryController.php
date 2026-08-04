<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\PlantTypeCategory;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PlantTypeCategoryController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginatedResponse(
                PlantTypeCategory::query()->withCount('plantTypes'),
                $request,
                fn ($c) => array_merge(ApiFormatter::plantTypeCategory($c), [
                    'typeCount' => (int) $c->plant_types_count,
                ])
            )
        );
    }

    public function all(): JsonResponse
    {
        $categories = PlantTypeCategory::query()
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return response()->json([
            'categories' => $categories->map(fn ($c) => ApiFormatter::plantTypeCategory($c))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $category = PlantTypeCategory::create($this->validated($request));

        return response()->json([
            'message' => 'Plant type category created.',
            'category' => ApiFormatter::plantTypeCategory($category),
        ], 201);
    }

    public function update(Request $request, PlantTypeCategory $plantTypeCategory): JsonResponse
    {
        $plantTypeCategory->update($this->validated($request, $plantTypeCategory));

        return response()->json([
            'message' => 'Plant type category updated.',
            'category' => ApiFormatter::plantTypeCategory($plantTypeCategory->fresh()),
        ]);
    }

    public function destroy(PlantTypeCategory $plantTypeCategory): JsonResponse
    {
        $plantTypeCategory->delete();

        return response()->json(['message' => 'Plant type category deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function (Builder $q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('slug', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->has('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }
    }

    protected function allowedSorts(): array
    {
        return ['title', 'sort_order', 'created_at', 'id'];
    }

    private function validated(Request $request, ?PlantTypeCategory $category = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('plant_type_categories', 'slug')->ignore($category?->id),
            ],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'string', 'max:500'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'isPublished' => ['nullable', 'boolean'],
        ]);

        $slug = ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['title']);

        return [
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? null,
            'image' => $data['image'] ?? null,
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_published' => $data['isPublished'] ?? true,
        ];
    }
}
