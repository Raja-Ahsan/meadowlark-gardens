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
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,gif,webp,svg,bmp,ico,heic,heif', 'max:10240'],
            'folder' => ['nullable', 'string', 'max:50', 'regex:/^[A-Za-z0-9_\-]+$/'],
        ], [
            'file.uploaded' => 'The image failed to upload. It may be too large — please try a smaller image.',
            'file.max' => 'The image may not be larger than 10 MB.',
            'file.mimes' => 'Please upload a JPG, PNG, WEBP, GIF, SVG, ICO or HEIC image.',
        ]);

        $folder = $request->input('folder', 'uploads');
        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension() ?: ($file->guessExtension() ?: 'jpg'));
        $name = Str::uuid().'.'.$extension;
        $path = $file->storeAs($folder, $name, 'public');

        return response()->json([
            'url' => MediaUrl::fromStoragePath($path),
            'path' => MediaUrl::fromStoragePath($path),
        ]);
    }
}
