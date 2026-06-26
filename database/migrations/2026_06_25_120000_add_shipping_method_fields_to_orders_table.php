<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_carrier', 32)->nullable()->after('shipping_cost');
            $table->string('shipping_method_code', 32)->nullable()->after('shipping_carrier');
            $table->string('shipping_method_name')->nullable()->after('shipping_method_code');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_carrier', 'shipping_method_code', 'shipping_method_name']);
        });
    }
};
