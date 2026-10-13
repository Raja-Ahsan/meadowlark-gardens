<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\SiteNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Bell notifications. Failures are logged and swallowed so they never break
 * the action that triggered them (orders, applications, etc.).
 */
class NotificationService
{
    public static function toUser(?User $user, string $kind, string $title, string $message = '', ?string $url = null): void
    {
        if (! $user) {
            return;
        }

        try {
            $user->notify(new SiteNotification($kind, $title, $message, $url));
        } catch (\Throwable $e) {
            Log::warning('Notification failed', ['user' => $user->id, 'kind' => $kind, 'error' => $e->getMessage()]);
        }
    }

    public static function toAdmins(string $kind, string $title, string $message = '', ?string $url = null): void
    {
        self::toUsersWhere(fn ($q) => $q->where('role', 'admin'), $kind, $title, $message, $url);
    }

    /**
     * Bulk insert so large audiences (e.g. every retail customer) stay fast.
     *
     * @param  callable(\Illuminate\Database\Eloquent\Builder): mixed  $scope
     */
    public static function toUsersWhere(callable $scope, string $kind, string $title, string $message = '', ?string $url = null): void
    {
        try {
            $data = json_encode(['kind' => $kind, 'title' => $title, 'message' => $message, 'url' => $url]);
            $now = now();
            $query = User::query()->select('id');
            $scope($query);

            $query->chunkById(500, function ($users) use ($data, $now) {
                DB::table('notifications')->insert($users->map(fn ($u) => [
                    'id' => (string) Str::uuid(),
                    'type' => SiteNotification::class,
                    'notifiable_type' => User::class,
                    'notifiable_id' => $u->id,
                    'data' => $data,
                    'read_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all());
            });
        } catch (\Throwable $e) {
            Log::warning('Bulk notification failed', ['kind' => $kind, 'error' => $e->getMessage()]);
        }
    }
}
