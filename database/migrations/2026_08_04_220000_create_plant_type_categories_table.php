<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plant_type_categories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });

        Schema::table('plant_types', function (Blueprint $table) {
            $table->foreignId('plant_type_category_id')
                ->nullable()
                ->after('id')
                ->constrained('plant_type_categories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('plant_types', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plant_type_category_id');
        });

        Schema::dropIfExists('plant_type_categories');
    }
};
