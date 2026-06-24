<?php

use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WholesaleApplicationController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/wholesale/applications', [WholesaleApplicationController::class, 'store']);
Route::post('/orders/retail', [OrderController::class, 'storeRetail']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    Route::get('/wholesale/orders', [OrderController::class, 'wholesaleIndex']);
    Route::post('/wholesale/orders', [OrderController::class, 'storeWholesale']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [StatsController::class, 'index']);
        Route::apiResource('products', AdminProductController::class)->except(['show']);
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::get('/applications', [AdminApplicationController::class, 'index']);
        Route::patch('/applications/{application}/status', [AdminApplicationController::class, 'updateStatus']);
    });
});
