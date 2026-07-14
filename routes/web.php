<?php

use App\Http\Controllers\SitemapController;
use App\Support\PublicSiteSettings;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

Route::get('/{any?}', function () {
    return view('app', [
        'siteSettings' => PublicSiteSettings::toArray(),
    ]);
})->where('any', '.*');
