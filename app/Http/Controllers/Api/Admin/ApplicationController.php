<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WholesaleApplication;
use App\Services\EmailService;
use App\Services\NotificationService;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $response = $this->paginatedResponse(
            WholesaleApplication::query(),
            $request,
            fn ($a) => ApiFormatter::application($a)
        );

        $statusCounts = WholesaleApplication::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $response['counts'] = [
            'all' => (int) $statusCounts->sum(),
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'approved' => (int) ($statusCounts['approved'] ?? 0),
            'rejected' => (int) ($statusCounts['rejected'] ?? 0),
        ];

        return response()->json($response);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('business_name', 'like', "%{$search}%")
                ->orWhere('contact_name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('address', 'like', "%{$search}%")
                ->orWhere('business_type', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if ($request->filled('status') && in_array($request->status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $request->status);
        }
    }

    protected function allowedSorts(): array
    {
        return ['submitted_at', 'business_name', 'created_at', 'id'];
    }

    public function updateStatus(Request $request, WholesaleApplication $application): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $application->update(['status' => $data['status']]);

        if ($data['status'] === 'approved') {
            $passwordHash = $application->password
                ?: Hash::make(Str::random(10));

            $wholesaler = User::updateOrCreate(
                ['email' => $application->email],
                [
                    'name' => $application->contact_name,
                    'business_name' => $application->business_name,
                    'password' => $passwordHash,
                    'role' => 'wholesale',
                    'approved' => true,
                ]
            );

            EmailService::send('wholesale_approved', $application->email, [
                'name' => $application->contact_name,
                'business_name' => $application->business_name,
            ]);

            NotificationService::toUser(
                $wholesaler,
                'account',
                'Welcome to the Wholesale Portal',
                'Your wholesale account has been approved. You can now place wholesale orders.',
                '/wholesale/portal'
            );
        }

        return response()->json([
            'message' => 'Application '.$data['status'].'.',
            'application' => ApiFormatter::application($application->fresh()),
        ]);
    }

    public function license(WholesaleApplication $application): \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
    {
        if (! $application->license_document) {
            return response()->json(['message' => 'No license document found.'], 404);
        }

        $relative = ltrim(preg_replace('#^/storage/#', '', $application->license_document) ?? '', '/');

        if (! Storage::disk('public')->exists($relative)) {
            return response()->json(['message' => 'License file missing on server.'], 404);
        }

        $absolute = Storage::disk('public')->path($relative);
        $mime = mime_content_type($absolute) ?: 'application/octet-stream';

        return response()->file($absolute, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="'.basename($relative).'"',
        ]);
    }
}
