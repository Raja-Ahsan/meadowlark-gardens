<?php

namespace Database\Seeders;

use App\Models\Attribute;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        $attributes = [
            [
                'name' => 'Color',
                'slug' => 'color',
                'type' => 'color',
                'values' => [
                    ['value' => 'Red', 'color_code' => '#DC2626'],
                    ['value' => 'Pink', 'color_code' => '#EC4899'],
                    ['value' => 'Purple', 'color_code' => '#9333EA'],
                    ['value' => 'White', 'color_code' => '#F9FAFB'],
                    ['value' => 'Yellow', 'color_code' => '#EAB308'],
                ],
            ],
            [
                'name' => 'Size',
                'slug' => 'size',
                'type' => 'select',
                'values' => [
                    ['value' => 'Small (1 gal)'],
                    ['value' => 'Medium (3 gal)'],
                    ['value' => 'Large (5 gal)'],
                    ['value' => 'Extra Large (7 gal)'],
                ],
            ],
            [
                'name' => 'Flower Type',
                'slug' => 'flower-type',
                'type' => 'select',
                'values' => [
                    ['value' => 'Perennial'],
                    ['value' => 'Annual'],
                    ['value' => 'Bulb'],
                    ['value' => 'Shrub'],
                    ['value' => 'Tree'],
                ],
            ],
        ];

        foreach ($attributes as $attr) {
            $attribute = Attribute::create([
                'name' => $attr['name'],
                'slug' => $attr['slug'],
                'type' => $attr['type'],
                'is_active' => true,
            ]);

            foreach ($attr['values'] as $i => $val) {
                $attribute->values()->create([
                    'value' => $val['value'],
                    'color_code' => $val['color_code'] ?? null,
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
