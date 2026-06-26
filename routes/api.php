<?php

use App\Http\Controllers\Api\Admin\ApplicationController as AdminApplicationController;
use App\Http\Controllers\Api\Admin\AttributeController as AdminAttributeController;
use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\ContactMessageController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\ShippingController as AdminShippingController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UpsController;
use App\Http\Controllers\Api\Admin\VariationController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\CustomerReviewController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\SiteSettingController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\WholesaleApplicationController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/products/{product}/reviews', [CustomerReviewController::class, 'index']);

Route::get('/shop', [ShopController::class, 'profile']);
Route::get('/shop/reviews', [ShopController::class, 'reviews']);
Route::get('/site-settings', [SiteSettingController::class, 'index']);

Route::get('/payments/config', [PaymentController::class, 'config']);
Route::post('/shipping/quote', [ShippingController::class, 'quote']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/wholesale/applications', [WholesaleApplicationController::class, 'store']);
Route::post('/orders/retail', [OrderController::class, 'storeRetail']);
Route::post('/coupons/validate', [CouponController::class, 'validateCode']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/auth/password', [AuthController::class, 'updatePassword']);

    Route::post('/upload', [UploadController::class, 'store']);

    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/check/{product}', [WishlistController::class, 'check']);

    Route::post('/reviews', [CustomerReviewController::class, 'store']);
    Route::get('/my-reviews', [CustomerReviewController::class, 'myReviews']);

    Route::get('/orders/{order}/invoice', [InvoiceController::class, 'show']);

    Route::post('/payments/stripe/intent', [PaymentController::class, 'createStripeIntent']);
    Route::post('/payments/paypal/confirm', [PaymentController::class, 'confirmPaypal']);

    Route::get('/wholesale/orders', [OrderController::class, 'wholesaleIndex']);
    Route::post('/wholesale/orders', [OrderController::class, 'storeWholesale']);

    Route::get('/customer/orders', [OrderController::class, 'customerIndex']);
    Route::post('/customer/orders', [OrderController::class, 'storeCustomer']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [StatsController::class, 'index']);
        Route::get('/export', [StatsController::class, 'export']);

        Route::post('/upload', [UploadController::class, 'store']);

        Route::apiResource('products', AdminProductController::class);
        Route::post('/products/{product}/variations', [VariationController::class, 'store']);
        Route::put('/products/{product}/variations/{variation}', [VariationController::class, 'update']);
        Route::delete('/products/{product}/variations/{variation}', [VariationController::class, 'destroy']);

        Route::get('/categories/all', [AdminCategoryController::class, 'all']);
        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);
        Route::get('/brands/all', [AdminBrandController::class, 'all']);
        Route::apiResource('brands', AdminBrandController::class)->except(['show']);

        Route::get('/attributes/all', [AdminAttributeController::class, 'all']);
        Route::apiResource('attributes', AdminAttributeController::class)->except(['show']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{order}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus']);

        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::patch('/customers/{customer}', [AdminCustomerController::class, 'update']);

        Route::apiResource('coupons', AdminCouponController::class)->except(['show']);
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/reviews/{review}/status', [AdminReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);

        Route::get('/applications', [AdminApplicationController::class, 'index']);
        Route::patch('/applications/{application}/status', [AdminApplicationController::class, 'updateStatus']);

        Route::get('/contact-messages', [ContactMessageController::class, 'index']);
        Route::delete('/contact-messages/{message}', [ContactMessageController::class, 'destroy']);

        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
        Route::get('/email-templates', [AdminSettingController::class, 'emailTemplates']);
        Route::put('/email-templates/{template}', [AdminSettingController::class, 'updateEmailTemplate']);
        Route::post('/test-email', [AdminSettingController::class, 'testEmail']);

        Route::get('/shipping', [AdminShippingController::class, 'index']);
        Route::post('/shipping/zones', [AdminShippingController::class, 'storeZone']);
        Route::put('/shipping/zones/{zone}', [AdminShippingController::class, 'updateZone']);
        Route::delete('/shipping/zones/{zone}', [AdminShippingController::class, 'destroyZone']);
        Route::post('/shipping/methods', [AdminShippingController::class, 'storeMethod']);
        Route::put('/shipping/methods/{method}', [AdminShippingController::class, 'updateMethod']);
        Route::delete('/shipping/methods/{method}', [AdminShippingController::class, 'destroyMethod']);
        Route::post('/ups/test', [UpsController::class, 'test']);
    });
});
