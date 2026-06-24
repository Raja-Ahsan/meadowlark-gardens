<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Perennials', 'slug' => 'perennials', 'sort_order' => 1],
            ['name' => 'Flowering Trees', 'slug' => 'flowering-trees', 'sort_order' => 2],
            ['name' => 'Flowering Shrubs', 'slug' => 'flowering-shrubs', 'sort_order' => 3],
            ['name' => 'Shade Perennials', 'slug' => 'shade-perennials', 'sort_order' => 4],
            ['name' => 'Roses', 'slug' => 'roses', 'sort_order' => 5],
            ['name' => 'Hydrangeas', 'slug' => 'hydrangeas', 'sort_order' => 6],
            ['name' => 'Fruit Trees & Shrubs', 'slug' => 'fruit-trees-shrubs', 'sort_order' => 7],
            ['name' => 'Willows', 'slug' => 'willows', 'sort_order' => 8],
            ['name' => 'Ornamental Shrub', 'slug' => 'ornamental-shrub', 'sort_order' => 9],
            ['name' => 'Japanese Maples', 'slug' => 'japanese-maples', 'sort_order' => 10],
            ['name' => 'Evergreen Shrubs', 'slug' => 'evergreen-shrubs', 'sort_order' => 11],
            ['name' => 'Specialty Evergreens', 'slug' => 'specialty-evergreens', 'sort_order' => 12],
            ['name' => 'Lilacs', 'slug' => 'lilacs', 'sort_order' => 13],
            ['name' => 'Conifers/Specialty', 'slug' => 'conifers-specialty', 'sort_order' => 14],
        ];

        $slugs = collect($categories)->pluck('slug')->all();

        Category::whereNotIn('slug', $slugs)->delete();

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'description' => "Shop our selection of {$cat['name']}.",
                    'is_active' => true,
                    'sort_order' => $cat['sort_order'],
                    'parent_id' => null,
                ]
            );
        }
    }
}
