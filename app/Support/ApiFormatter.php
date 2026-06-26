<?php

namespace App\Support;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\EmailTemplate;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\User;
use App\Models\WholesaleApplication;

class ApiFormatter
{
    public static function product(Product $product, bool $detailed = false): array
    {
        $product->loadMissing(['categoryRelation', 'brand', 'images', 'variations']);

        $categoryName = $product->categoryRelation?->name ?? $product->category;

        $data = [
            'id' => (string) $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'type' => $product->type ?? 'simple',
            'category' => $categoryName,
            'categoryId' => $product->category_id ? (string) $product->category_id : null,
            'brandId' => $product->brand_id ? (string) $product->brand_id : null,
            'brandName' => $product->brand?->name,
            'price' => (float) $product->price,
            'salePrice' => $product->sale_price ? (float) $product->sale_price : null,
            'wholesalePrice' => (float) $product->wholesale_price,
            'saleWholesalePrice' => $product->sale_wholesale_price ? (float) $product->sale_wholesale_price : null,
            'image' => MediaUrl::normalize($product->image),
            'description' => $product->description,
            'shortDescription' => $product->short_description,
            'badge' => $product->badge,
            'inStock' => $product->isInStock(),
            'stockQuantity' => (int) ($product->stock_quantity ?? 0),
            'lowStockThreshold' => (int) ($product->low_stock_threshold ?? 5),
            'manageStock' => (bool) ($product->manage_stock ?? true),
            'allowBackorder' => (bool) ($product->allow_backorder ?? false),
            'minWholesaleQty' => (int) $product->min_wholesale_qty,
            'tags' => $product->tags ?? [],
            'isFeatured' => (bool) ($product->is_featured ?? false),
            'isActive' => (bool) ($product->is_active ?? true),
            'weight' => $product->weight ? (float) $product->weight : null,
            'metaTitle' => $product->meta_title,
            'metaDescription' => $product->meta_description,
            'images' => $product->images->map(fn ($img) => [
                'id' => (string) $img->id,
                'path' => MediaUrl::normalize($img->path),
                'alt' => $img->alt,
                'isPrimary' => $img->is_primary,
            ])->values()->all(),
            'variations' => $product->variations->map(fn ($v) => self::variation($v))->values()->all(),
        ];

        if ($detailed) {
            $data['averageRating'] = round($product->reviews()->where('status', 'approved')->avg('rating') ?? 0, 1);
            $data['reviewCount'] = $product->reviews()->where('status', 'approved')->count();
        }

        return $data;
    }

    public static function variation(\App\Models\ProductVariation $v): array
    {
        return [
            'id' => (string) $v->id,
            'sku' => $v->sku,
            'barcode' => $v->barcode,
            'price' => (float) $v->price,
            'salePrice' => $v->sale_price ? (float) $v->sale_price : null,
            'wholesalePrice' => $v->wholesale_price ? (float) $v->wholesale_price : null,
            'stockQuantity' => (int) $v->stock_quantity,
            'image' => MediaUrl::normalize($v->image),
            'weight' => $v->weight ? (float) $v->weight : null,
            'attributeValues' => $v->attribute_values ?? [],
            'isActive' => (bool) $v->is_active,
        ];
    }

    public static function category(Category $category): array
    {
        $category->loadMissing('parent');

        return [
            'id' => (string) $category->id,
            'parentId' => $category->parent_id ? (string) $category->parent_id : null,
            'parentName' => $category->parent?->name,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'metaTitle' => $category->meta_title,
            'metaDescription' => $category->meta_description,
            'isActive' => (bool) $category->is_active,
            'sortOrder' => (int) $category->sort_order,
            'productCount' => $category->products()->count(),
        ];
    }

    public static function brand(Brand $brand): array
    {
        return [
            'id' => (string) $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'logo' => $brand->logo,
            'description' => $brand->description,
            'metaTitle' => $brand->meta_title,
            'metaDescription' => $brand->meta_description,
            'isActive' => (bool) $brand->is_active,
            'productCount' => $brand->products()->count(),
        ];
    }

    public static function user(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'businessName' => $user->business_name ?? $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => ($v = MediaUrl::normalize($user->avatar)) ? $v : null,
            'role' => $user->role,
            'approved' => (bool) $user->approved,
            'createdAt' => $user->created_at?->toIso8601String(),
            'orderCount' => $user->orders()->count(),
        ];
    }

    public static function coupon(Coupon $coupon): array
    {
        return [
            'id' => (string) $coupon->id,
            'code' => $coupon->code,
            'description' => $coupon->description,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'minCartValue' => $coupon->min_cart_value ? (float) $coupon->min_cart_value : null,
            'maxDiscount' => $coupon->max_discount ? (float) $coupon->max_discount : null,
            'usageLimit' => $coupon->usage_limit,
            'usageCount' => (int) $coupon->usage_count,
            'perUserLimit' => $coupon->per_user_limit,
            'wholesaleOnly' => (bool) $coupon->wholesale_only,
            'retailOnly' => (bool) $coupon->retail_only,
            'productIds' => $coupon->product_ids ?? [],
            'categoryIds' => $coupon->category_ids ?? [],
            'startsAt' => $coupon->starts_at?->toIso8601String(),
            'expiresAt' => $coupon->expires_at?->toIso8601String(),
            'isActive' => (bool) $coupon->is_active,
        ];
    }

    public static function review(Review $review): array
    {
        $review->loadMissing(['product', 'user']);

        return [
            'id' => (string) $review->id,
            'productId' => (string) $review->product_id,
            'productName' => $review->product?->name,
            'userId' => (string) $review->user_id,
            'userName' => $review->user?->name,
            'rating' => (int) $review->rating,
            'title' => $review->title,
            'body' => $review->body,
            'reviewCategory' => $review->review_category,
            'qualityRating' => $review->quality_rating ? (int) $review->quality_rating : null,
            'deliveryRating' => $review->delivery_rating ? (int) $review->delivery_rating : null,
            'serviceRating' => $review->service_rating ? (int) $review->service_rating : null,
            'sellerResponse' => $review->seller_response,
            'sellerRespondedAt' => $review->seller_responded_at?->toIso8601String(),
            'images' => collect($review->images ?? [])->map(fn ($img) => MediaUrl::normalize(is_string($img) ? $img : ($img['url'] ?? '')))->filter()->values()->all(),
            'isVerifiedPurchase' => (bool) $review->is_verified_purchase,
            'isWholesale' => (bool) $review->is_wholesale,
            'status' => $review->status,
            'createdAt' => $review->created_at->toIso8601String(),
        ];
    }

    public static function application(WholesaleApplication $app): array
    {
        return [
            'id' => (string) $app->id,
            'businessName' => $app->business_name,
            'contactName' => $app->contact_name,
            'email' => $app->email,
            'phone' => $app->phone,
            'address' => $app->address,
            'businessType' => $app->business_type,
            'estimatedMonthlyOrder' => $app->estimated_monthly_order,
            'message' => $app->message,
            'status' => $app->status,
            'submittedAt' => $app->submitted_at->toIso8601String(),
        ];
    }

    public static function order(Order $order): array
    {
        $order->loadMissing(['items.product', 'items.variation', 'user']);

        return [
            'id' => (string) $order->id,
            'orderNumber' => $order->order_number,
            'userId' => $order->user_id ? (string) $order->user_id : '',
            'businessName' => $order->business_name ?? $order->customer_name ?? '',
            'customerName' => $order->customer_name,
            'customerEmail' => $order->customer_email,
            'type' => $order->type,
            'items' => $order->items->map(fn ($item) => [
                'product' => self::product($item->product),
                'variation' => $item->variation ? self::variation($item->variation) : null,
                'variationId' => $item->variation_id ? (string) $item->variation_id : null,
                'quantity' => (int) $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'lineTotal' => round((float) $item->unit_price * (int) $item->quantity, 2),
            ])->values()->all(),
            'subtotal' => $order->subtotal ? (float) $order->subtotal : (float) $order->total,
            'discount' => (float) ($order->discount ?? 0),
            'tax' => (float) ($order->tax ?? 0),
            'shippingCost' => (float) ($order->shipping_cost ?? 0),
            'shippingCarrier' => $order->shipping_carrier,
            'shippingMethodCode' => $order->shipping_method_code,
            'shippingMethodName' => $order->shipping_method_name,
            'total' => (float) $order->total,
            'status' => $order->status,
            'createdAt' => $order->created_at->toIso8601String(),
            'paymentMethod' => $order->payment_method,
            'couponCode' => $order->coupon_code,
            'billingAddress' => $order->billing_address,
            'shippingAddress' => $order->shipping_address,
            'orderNotes' => $order->order_notes,
            'trackingNumber' => $order->tracking_number,
        ];
    }

    public static function shippingZone(ShippingZone $zone): array
    {
        $zone->loadMissing('methods');

        return [
            'id' => (string) $zone->id,
            'name' => $zone->name,
            'countries' => $zone->countries ?? [],
            'states' => $zone->states ?? [],
            'isActive' => (bool) $zone->is_active,
            'methods' => $zone->methods->map(fn ($m) => self::shippingMethod($m))->values()->all(),
        ];
    }

    public static function shippingMethod(ShippingMethod $method): array
    {
        return [
            'id' => (string) $method->id,
            'shippingZoneId' => (string) $method->shipping_zone_id,
            'name' => $method->name,
            'type' => $method->type,
            'cost' => (float) $method->cost,
            'minOrderAmount' => $method->min_order_amount ? (float) $method->min_order_amount : null,
            'estimatedDays' => $method->estimated_days,
            'wholesaleOnly' => (bool) $method->wholesale_only,
            'isActive' => (bool) $method->is_active,
        ];
    }

    public static function emailTemplate(EmailTemplate $template): array
    {
        return [
            'id' => (string) $template->id,
            'slug' => $template->slug,
            'name' => $template->name,
            'subject' => $template->subject,
            'body' => $template->body,
            'isActive' => (bool) $template->is_active,
        ];
    }

    public static function legalPage(\App\Models\LegalPage $page): array
    {
        return [
            'id' => (string) $page->id,
            'slug' => $page->slug,
            'title' => $page->title,
            'content' => $page->content ?? '',
            'metaTitle' => $page->meta_title,
            'metaDescription' => $page->meta_description,
            'isPublished' => (bool) $page->is_published,
            'updatedAt' => $page->updated_at?->toIso8601String(),
        ];
    }
}
