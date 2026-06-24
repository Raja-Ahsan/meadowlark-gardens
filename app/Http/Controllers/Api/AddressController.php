<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->orderBy('label')->get();

        return response()->json([
            'addresses' => $addresses->map(fn ($a) => $this->format($a))->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        if ($data['is_default']) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->addresses()->create($data);

        return response()->json([
            'message' => 'Address saved.',
            'address' => $this->format($address),
        ], 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $this->validated($request);

        if ($data['is_default']) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json([
            'message' => 'Address updated.',
            'address' => $this->format($address->fresh()),
        ]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'addressLine1' => ['required', 'string', 'max:255'],
            'addressLine2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postalCode' => ['required', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:2'],
            'isDefault' => ['nullable', 'boolean'],
        ]);

        return [
            'label' => $data['label'] ?? 'Home',
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'company' => $data['company'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address_line_1' => $data['addressLine1'],
            'address_line_2' => $data['addressLine2'] ?? null,
            'city' => $data['city'],
            'state' => $data['state'],
            'postal_code' => $data['postalCode'],
            'country' => $data['country'] ?? 'US',
            'is_default' => $data['isDefault'] ?? false,
        ];
    }

    private function format(Address $address): array
    {
        return [
            'id' => (string) $address->id,
            'label' => $address->label,
            'firstName' => $address->first_name,
            'lastName' => $address->last_name,
            'company' => $address->company,
            'phone' => $address->phone,
            'email' => $address->email,
            'addressLine1' => $address->address_line_1,
            'addressLine2' => $address->address_line_2,
            'city' => $address->city,
            'state' => $address->state,
            'postalCode' => $address->postal_code,
            'country' => $address->country,
            'isDefault' => (bool) $address->is_default,
        ];
    }
}
