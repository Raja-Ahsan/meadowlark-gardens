<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')->where('min_wholesale_qty', 5)->update(['min_wholesale_qty' => 25]);
    }

    public function down(): void
    {
        //
    }
};
