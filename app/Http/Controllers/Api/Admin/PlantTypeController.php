<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\PlantType;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PlantTypeController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginatedResponse(PlantType::query(), $request, fn ($t) => ApiFormatter::plantType($t))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $plantType = PlantType::create($this->validated($request));

        return response()->json([
            'message' => 'Plant type created.',
            'plantType' => ApiFormatter::plantType($plantType),
        ], 201);
    }

    public function update(Request $request, PlantType $plantType): JsonResponse
    {
        $plantType->update($this->validated($request, $plantType));

        return response()->json([
            'message' => 'Plant type updated.',
            'plantType' => ApiFormatter::plantType($plantType->fresh()),
        ]);
    }

    public function destroy(PlantType $plantType): JsonResponse
    {
        $plantType->delete();

        return response()->json(['message' => 'Plant type deleted.']);
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

    private function validated(Request $request, ?PlantType $plantType = null): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('plant_types', 'slug')->ignore($plantType?->id),
            ],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'isPublished' => ['nullable', 'boolean'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
        ]);

        $slug = ! empty($data['slug'])
            ? Str::slug($data['slug'])
            : Str::slug($data['title']);

        return [
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'image' => $data['image'] ?? null,
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_published' => $data['isPublished'] ?? true,
            'meta_title' => $data['metaTitle'] ?? null,
            'meta_description' => $data['metaDescription'] ?? null,
        ];
    }
}
