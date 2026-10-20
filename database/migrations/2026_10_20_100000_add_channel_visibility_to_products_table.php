<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (! Schema::hasColumn('products', 'show_on_retail')) {
                $table->boolean('show_on_retail')->default(true)->after('is_active');
            }
            if (! Schema::hasColumn('products', 'show_on_wholesale')) {
                $table->boolean('show_on_wholesale')->default(true)->after('show_on_retail');
            }
        });

        // Preserve current storefront behavior: existing products stay on both portals.
        DB::table('products')->update([
            'show_on_retail' => true,
            'show_on_wholesale' => true,
        ]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'show_on_wholesale')) {
                $table->dropColumn('show_on_wholesale');
            }
            if (Schema::hasColumn('products', 'show_on_retail')) {
                $table->dropColumn('show_on_retail');
            }
        });
    }
};
