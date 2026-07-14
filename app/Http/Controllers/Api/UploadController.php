<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\MediaUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'max:5120'],
            'folder' => ['nullable', 'string', 'max:50'],
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');
        $name = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $name, 'public');

        return response()->json([
            'url' => MediaUrl::fromStoragePath($path),
            'path' => MediaUrl::fromStoragePath($path),
        ]);
    }
}
