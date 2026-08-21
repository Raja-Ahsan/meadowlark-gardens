<?php

use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\SitemapController;
use App\Support\PublicSiteSettings;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// Signed print pages — must be registered BEFORE the SPA catch-all.
Route::get('/print/orders/{order}/invoice', [InvoiceController::class, 'showSigned'])
    ->middleware('signed')
    ->name('orders.print.invoice');

Route::get('/print/orders/{order}/packing-slip', [InvoiceController::class, 'packingSlipSigned'])
    ->middleware('signed')
    ->name('orders.print.packing-slip');

Route::get('/{any?}', function () {
    return view('app', [
        'siteSettings' => PublicSiteSettings::toArray(),
    ]);
})->where('any', '.*');
