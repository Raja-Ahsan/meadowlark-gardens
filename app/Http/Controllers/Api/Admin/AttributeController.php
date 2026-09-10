<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttributeController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = Attribute::with('values');

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($a) => $this->format($a))
        );
    }

    public function all(): JsonResponse
    {
        $attributes = Attribute::with('values')->where('is_active', true)->orderBy('name')->get();

        return response()->json([
            'attributes' => $attributes->map(fn ($a) => $this->format($a))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['nullable', 'in:select,color,text'],
            'values' => ['nullable', 'array'],
            'values.*.value' => ['required', 'string'],
            'values.*.colorCode' => ['nullable', 'string'],
        ]);

        $attribute = Attribute::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'type' => $data['type'] ?? 'select',
            'is_active' => true,
        ]);

        $this->syncValues($attribute, $data['values'] ?? []);

        return response()->json([
            'message' => 'Attribute created.',
            'attribute' => $this->format($attribute->fresh('values')),
        ], 201);
    }

    public function update(Request $request, Attribute $attribute): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:select,color,text'],
            'isActive' => ['sometimes', 'boolean'],
            'values' => ['nullable', 'array'],
            'values.*.value' => ['required', 'string'],
            'values.*.colorCode' => ['nullable', 'string'],
        ]);

        $attribute->update([
            'name' => $data['name'] ?? $attribute->name,
            'slug' => isset($data['name']) ? Str::slug($data['name']) : $attribute->slug,
            'type' => $data['type'] ?? $attribute->type,
            'is_active' => $data['isActive'] ?? $attribute->is_active,
        ]);

        if (isset($data['values'])) {
            $attribute->values()->delete();
            $this->syncValues($attribute, $data['values']);
        }

        return response()->json([
            'message' => 'Attribute updated.',
            'attribute' => $this->format($attribute->fresh('values')),
        ]);
    }

    public function destroy(Attribute $attribute): JsonResponse
    {
        $attribute->delete();

        return response()->json(['message' => 'Attribute deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('name', 'like', "%{$search}%");
    }

    protected function allowedSorts(): array
    {
        return ['name', 'created_at', 'id'];
    }

    private function syncValues(Attribute $attribute, array $values): void
    {
        foreach ($values as $i => $val) {
            $attribute->values()->create([
                'value' => $val['value'],
                'color_code' => $val['colorCode'] ?? null,
                'sort_order' => $i,
            ]);
        }
    }

    private function format(Attribute $attribute): array
    {
        $attribute->loadMissing('values');

        return [
            'id' => (string) $attribute->id,
            'name' => $attribute->name,
            'slug' => $attribute->slug,
            'type' => $attribute->type,
            'isActive' => (bool) $attribute->is_active,
            'values' => $attribute->values->map(fn (AttributeValue $v) => [
                'id' => (string) $v->id,
                'value' => $v->value,
                'colorCode' => $v->color_code,
            ])->values()->all(),
        ];
    }
}
