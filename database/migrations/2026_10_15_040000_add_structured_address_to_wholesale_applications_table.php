<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wholesale_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('wholesale_applications', 'address_line_1')) {
                $table->string('address_line_1')->nullable()->after('address');
            }
            if (! Schema::hasColumn('wholesale_applications', 'address_line_2')) {
                $table->string('address_line_2')->nullable()->after('address_line_1');
            }
            if (! Schema::hasColumn('wholesale_applications', 'city')) {
                $table->string('city', 100)->nullable()->after('address_line_2');
            }
            if (! Schema::hasColumn('wholesale_applications', 'state')) {
                $table->string('state', 16)->nullable()->after('city');
            }
            if (! Schema::hasColumn('wholesale_applications', 'postal_code')) {
                $table->string('postal_code', 20)->nullable()->after('state');
            }
            if (! Schema::hasColumn('wholesale_applications', 'country')) {
                $table->string('country', 2)->nullable()->after('postal_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('wholesale_applications', function (Blueprint $table) {
            foreach (['address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country'] as $column) {
                if (Schema::hasColumn('wholesale_applications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
