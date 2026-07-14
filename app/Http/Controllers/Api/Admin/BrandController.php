<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginatedResponse(Brand::query(), $request, fn ($b) => ApiFormatter::brand($b))
        );
    }

    public function all(): JsonResponse
    {
        $brands = Brand::where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'brands' => $brands->map(fn ($b) => ApiFormatter::brand($b))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $brand = Brand::create($this->validated($request));

        return response()->json([
            'message' => 'Brand created.',
            'brand' => ApiFormatter::brand($brand),
        ], 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $brand->update($this->validated($request));

        return response()->json([
            'message' => 'Brand updated.',
            'brand' => ApiFormatter::brand($brand->fresh()),
        ]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json(['message' => 'Brand deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('name', 'like', "%{$search}%");
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
    }

    protected function allowedSorts(): array
    {
        return ['name', 'created_at', 'id'];
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        return [
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'logo' => $data['logo'] ?? null,
            'description' => $data['description'] ?? null,
            'meta_title' => $data['metaTitle'] ?? null,
            'meta_description' => $data['metaDescription'] ?? null,
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
