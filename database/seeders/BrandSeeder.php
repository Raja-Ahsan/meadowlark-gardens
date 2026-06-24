<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Meadowlark Native', 'slug' => 'meadowlark-native', 'description' => 'Our signature native plant collection.'],
            ['name' => 'Southern Heritage', 'slug' => 'southern-heritage', 'description' => 'Classic Southern garden favorites.'],
            ['name' => 'Pollinator Paradise', 'slug' => 'pollinator-paradise', 'description' => 'Plants that attract bees, butterflies, and hummingbirds.'],
        ];

        foreach ($brands as $brand) {
            Brand::create([...$brand, 'is_active' => true]);
        }
    }
}
