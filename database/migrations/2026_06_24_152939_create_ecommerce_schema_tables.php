<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->string('sku')->nullable()->unique()->after('slug');
            $table->enum('type', ['simple', 'variable'])->default('simple')->after('sku');
            $table->foreignId('category_id')->nullable()->after('type')->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->decimal('sale_price', 10, 2)->nullable()->after('price');
            $table->decimal('sale_wholesale_price', 10, 2)->nullable()->after('wholesale_price');
            $table->unsignedInteger('stock_quantity')->default(0)->after('in_stock');
            $table->unsignedInteger('low_stock_threshold')->default(5)->after('stock_quantity');
            $table->boolean('manage_stock')->default(true)->after('low_stock_threshold');
            $table->boolean('allow_backorder')->default(false)->after('manage_stock');
            $table->text('short_description')->nullable()->after('description');
            $table->json('tags')->nullable()->after('short_description');
            $table->boolean('is_featured')->default(false)->after('tags');
            $table->boolean('is_active')->default(true)->after('is_featured');
            $table->decimal('weight', 8, 2)->nullable()->after('is_active');
            $table->string('meta_title')->nullable()->after('weight');
            $table->string('meta_description')->nullable()->after('meta_title');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['select', 'color', 'text'])->default('select');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->string('color_code')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('wholesale_price', 10, 2)->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->string('image')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->json('attribute_values')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('company')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address_line_1');
            $table->string('address_line_2')->nullable();
            $table->string('city');
            $table->string('state');
            $table->string('postal_code');
            $table->string('country')->default('US');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->enum('type', ['percentage', 'fixed', 'free_shipping'])->default('percentage');
            $table->decimal('value', 10, 2)->default(0);
            $table->decimal('min_cart_value', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('per_user_limit')->nullable();
            $table->boolean('wholesale_only')->default(false);
            $table->boolean('retail_only')->default(false);
            $table->json('product_ids')->nullable();
            $table->json('category_ids')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('body');
            $table->json('images')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_wholesale')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('payment_method');
            $table->decimal('subtotal', 10, 2)->nullable()->after('coupon_code');
            $table->decimal('discount', 10, 2)->default(0)->after('subtotal');
            $table->decimal('tax', 10, 2)->default(0)->after('discount');
            $table->decimal('shipping_cost', 10, 2)->default(0)->after('tax');
            $table->json('billing_address')->nullable()->after('shipping_cost');
            $table->json('shipping_address')->nullable()->after('billing_address');
            $table->text('order_notes')->nullable()->after('shipping_address');
            $table->string('tracking_number')->nullable()->after('order_notes');
            $table->string('payment_id')->nullable()->after('tracking_number');
            $table->timestamp('paid_at')->nullable()->after('payment_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('variation_id')->nullable()->after('product_id')->constrained('product_variations')->nullOnDelete();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('countries')->nullable();
            $table->json('states')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['flat_rate', 'free_shipping', 'local_delivery', 'weight_based', 'price_based'])->default('flat_rate');
            $table->decimal('cost', 10, 2)->default(0);
            $table->decimal('min_order_amount', 10, 2)->nullable();
            $table->string('estimated_days')->nullable();
            $table->boolean('wholesale_only')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('subject');
            $table->text('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('model_type')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->timestamp('email_verified_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
        });

        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('email_templates');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('shipping_zones');
        Schema::dropIfExists('order_status_histories');

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variation_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'coupon_code', 'subtotal', 'discount', 'tax', 'shipping_cost',
                'billing_address', 'shipping_address', 'order_notes',
                'tracking_number', 'payment_id', 'paid_at',
            ]);
        });

        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('coupons');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('product_variations');
        Schema::dropIfExists('attribute_values');
        Schema::dropIfExists('attributes');
        Schema::dropIfExists('product_images');

        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('brand_id');
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn([
                'slug', 'sku', 'type', 'sale_price', 'sale_wholesale_price',
                'stock_quantity', 'low_stock_threshold', 'manage_stock', 'allow_backorder',
                'short_description', 'tags', 'is_featured', 'is_active', 'weight',
                'meta_title', 'meta_description',
            ]);
        });

        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
    }
};
