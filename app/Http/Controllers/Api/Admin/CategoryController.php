<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = Category::with('parent');

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($c) => ApiFormatter::category($c))
        );
    }

    public function all(): JsonResponse
    {
        $categories = Category::where('is_active', true)->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'categories' => $categories->map(fn ($c) => ApiFormatter::category($c))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $category = Category::create($this->validated($request));

        return response()->json([
            'message' => 'Category created.',
            'category' => ApiFormatter::category($category),
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($this->validated($request, $category));

        return response()->json([
            'message' => 'Category updated.',
            'category' => ApiFormatter::category($category->fresh('parent')),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json(['message' => 'Cannot delete category with subcategories.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%");
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id === 'null' ? null : $request->parent_id);
        }
    }

    protected function allowedSorts(): array
    {
        return ['name', 'sort_order', 'created_at', 'id'];
    }

    private function validated(Request $request, ?Category $category = null): array
    {
        $data = $request->validate([
            'parentId' => ['nullable', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
            'isActive' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
        ]);

        return [
            'parent_id' => $data['parentId'] ?? null,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
            'meta_title' => $data['metaTitle'] ?? null,
            'meta_description' => $data['metaDescription'] ?? null,
            'is_active' => $data['isActive'] ?? true,
            'sort_order' => $data['sortOrder'] ?? 0,
        ];
    }
}
