<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\HandlesPaginatedListing;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\NotificationService;
use App\Support\ApiFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    use HandlesPaginatedListing;

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->paginatedResponse(
                Announcement::query(),
                $request,
                fn ($a) => ApiFormatter::announcement($a)
            )
        );
    }

    public function store(Request $request): JsonResponse
    {
        $announcement = Announcement::create($this->validated($request));

        if ($announcement->is_published) {
            $this->notifyAudience($announcement);
        }

        return response()->json([
            'message' => 'Announcement created.',
            'announcement' => ApiFormatter::announcement($announcement),
        ], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $wasPublished = (bool) $announcement->is_published;
        $previousSides = $this->sidesOf($announcement->audience);
        $announcement->update($this->validated($request));

        if ($announcement->is_published) {
            $newSides = $wasPublished
                ? array_values(array_diff($this->sidesOf($announcement->audience), $previousSides))
                : $this->sidesOf($announcement->audience);
            if ($newSides) {
                $this->notifyAudience($announcement, $newSides);
            }
        }

        return response()->json([
            'message' => 'Announcement updated.',
            'announcement' => ApiFormatter::announcement($announcement->fresh()),
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }

    /** @return list<string> */
    private function sidesOf(string $audience): array
    {
        return $audience === Announcement::AUDIENCE_ALL ? Announcement::AUDIENCES : [$audience];
    }

    /** @param  list<string>|null  $sides  Defaults to every side the announcement is shown on. */
    private function notifyAudience(Announcement $announcement, ?array $sides = null): void
    {
        foreach ($sides ?? $this->sidesOf($announcement->audience) as $side) {
            $wholesale = $side === Announcement::AUDIENCE_WHOLESALE;

            NotificationService::toUsersWhere(
                fn ($q) => $wholesale
                    ? $q->where('role', 'wholesale')->where('approved', true)
                    : $q->where('role', 'customer'),
                'announcement',
                $announcement->title,
                Str::limit((string) $announcement->excerpt, 140),
                $wholesale ? '/wholesale/portal?tab=announcements' : '/announcements'
            );
        }
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where(function (Builder $q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('excerpt', 'like', "%{$search}%");
        });
    }

    protected function applyFilters(Builder $query, Request $request): void
    {
        if (in_array($request->input('audience'), Announcement::AUDIENCES, true)) {
            $query->whereIn('audience', [$request->input('audience'), Announcement::AUDIENCE_ALL]);
        }
    }

    protected function allowedSorts(): array
    {
        return ['title', 'event_date', 'created_at', 'id'];
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'audience' => ['required', Rule::in(Announcement::STORED_AUDIENCES)],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:500'],
            'eventDate' => ['nullable', 'date'],
            'isPublished' => ['nullable', 'boolean'],
        ]);

        return [
            'audience' => $data['audience'],
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? null,
            'image' => $data['image'] ?? null,
            'event_date' => $data['eventDate'] ?? null,
            'is_published' => $data['isPublished'] ?? true,
        ];
    }
}
