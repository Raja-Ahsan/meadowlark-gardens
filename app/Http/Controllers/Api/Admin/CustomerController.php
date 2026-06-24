<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = User::whereIn('role', ['customer', 'wholesale']);

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($u) => ApiFormatter::user($u))
        );
    }

    public function update(Request $request, User $customer): JsonResponse
    {
        if (! in_array($customer->role, ['customer', 'wholesale'], true)) {
            return response()->json(['message' => 'Invalid customer.'], 422);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'businessName' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'approved' => ['sometimes', 'boolean'],
            'role' => ['sometimes', 'in:customer,wholesale'],
        ]);

        $customer->update([
            'name' => $data['name'] ?? $customer->name,
            'business_name' => $data['businessName'] ?? $customer->business_name,
            'phone' => $data['phone'] ?? $customer->phone,
            'approved' => $data['approved'] ?? $customer->approved,
            'role' => $data['role'] ?? $customer->role,
        ]);

        return response()->json([
            'message' => 'Customer updated.',
            'customer' => ApiFormatter::user($customer->fresh()),
        ]);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('business_name', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }
        if ($request->has('approved')) {
            $query->where('approved', filter_var($request->approved, FILTER_VALIDATE_BOOLEAN));
        }
    }

    protected function allowedSorts(): array
    {
        return ['name', 'email', 'created_at', 'id'];
    }
}
