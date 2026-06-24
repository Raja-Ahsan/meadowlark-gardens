<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('review_category')->nullable()->after('body');
            $table->unsignedTinyInteger('quality_rating')->nullable()->after('review_category');
            $table->unsignedTinyInteger('delivery_rating')->nullable()->after('quality_rating');
            $table->unsignedTinyInteger('service_rating')->nullable()->after('delivery_rating');
            $table->text('seller_response')->nullable()->after('service_rating');
            $table->timestamp('seller_responded_at')->nullable()->after('seller_response');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn([
                'review_category',
                'quality_rating',
                'delivery_rating',
                'service_rating',
                'seller_response',
                'seller_responded_at',
            ]);
        });
    }
};
