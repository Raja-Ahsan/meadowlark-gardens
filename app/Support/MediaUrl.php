<?php

namespace App\Support;

class MediaUrl
{
    public static function normalize(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return $path;
        }

        if (str_starts_with($path, '/storage/')) {
            return $path;
        }

        if (preg_match('#^https?://localhost(?::\d+)?(/storage/.+)$#', $path, $matches)) {
            return $matches[1];
        }

        if (preg_match('#^https?://127\.0\.0\.1(?::\d+)?(/storage/.+)$#', $path, $matches)) {
            return $matches[1];
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return '/storage/'.ltrim($path, '/');
    }

    public static function fromStoragePath(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }
}
