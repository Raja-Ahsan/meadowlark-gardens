<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query();

        return response()->json(
            $this->paginatedResponse($query, $request, fn ($m) => [
                'id' => (string) $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'subject' => $m->subject,
                'message' => $m->message,
                'createdAt' => $m->created_at->toIso8601String(),
            ])
        );
    }

    public function destroy(ContactMessage $message): JsonResponse
    {
        $message->delete();

        return response()->json(['message' => 'Message deleted.']);
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%");
        });
    }

    protected function allowedSorts(): array
    {
        return ['created_at', 'name', 'id'];
    }
}
