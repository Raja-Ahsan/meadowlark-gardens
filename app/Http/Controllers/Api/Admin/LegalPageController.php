<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LegalPage;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LegalPageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = LegalPage::orderBy('title')->get();

        return response()->json([
            'pages' => $pages->map(fn ($p) => ApiFormatter::legalPage($p))->values(),
        ]);
    }

    public function update(Request $request, LegalPage $legalPage): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:500'],
            'isPublished' => ['sometimes', 'boolean'],
        ]);

        $legalPage->update([
            'title' => $data['title'] ?? $legalPage->title,
            'content' => array_key_exists('content', $data) ? $data['content'] : $legalPage->content,
            'meta_title' => $data['metaTitle'] ?? $legalPage->meta_title,
            'meta_description' => $data['metaDescription'] ?? $legalPage->meta_description,
            'is_published' => $data['isPublished'] ?? $legalPage->is_published,
        ]);

        return response()->json([
            'message' => 'Page updated successfully.',
            'page' => ApiFormatter::legalPage($legalPage->fresh()),
        ]);
    }
}
