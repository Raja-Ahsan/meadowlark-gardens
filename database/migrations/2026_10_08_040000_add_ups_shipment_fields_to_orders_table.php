<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'ups_shipment_id')) {
                $table->string('ups_shipment_id', 64)->nullable()->after('tracking_number');
            }
            if (! Schema::hasColumn('orders', 'ups_label_path')) {
                $table->string('ups_label_path')->nullable()->after('ups_shipment_id');
            }
            if (! Schema::hasColumn('orders', 'ups_shipment_environment')) {
                $table->string('ups_shipment_environment', 32)->nullable()->after('ups_label_path');
            }
            if (! Schema::hasColumn('orders', 'ups_shipment_created_at')) {
                $table->timestamp('ups_shipment_created_at')->nullable()->after('ups_shipment_environment');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = [
                'ups_shipment_id',
                'ups_label_path',
                'ups_shipment_environment',
                'ups_shipment_created_at',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
