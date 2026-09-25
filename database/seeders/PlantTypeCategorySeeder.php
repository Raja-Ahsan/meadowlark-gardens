<?php

namespace Database\Seeders;

use App\Models\PlantTypeCategory;
use Illuminate\Database\Seeder;

class PlantTypeCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'title' => 'Japanese Maples',
                'slug' => 'japanese-maples',
                'excerpt' => 'Elegant foliage trees prized for color, form, and year-round interest in Tennessee landscapes.',
                'image' => 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 1,
            ],
            [
                'title' => 'Hydrangeas',
                'slug' => 'hydrangeas',
                'excerpt' => 'Show-stopping blooms for borders, foundations, and cut flowers — grown open-air for backyard strength.',
                'image' => 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 2,
            ],
            [
                'title' => 'Roses',
                'slug' => 'roses',
                'excerpt' => 'Classic fragrance and color for gardens that want lasting beauty and strong outdoor-grown plants.',
                'image' => 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 3,
            ],
            [
                'title' => 'Coneflowers',
                'slug' => 'coneflowers',
                'excerpt' => 'Pollinator favorites with sturdy blooms that thrive in sunny Tennessee gardens.',
                'image' => 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 4,
            ],
            [
                'title' => 'Hostas',
                'slug' => 'hostas',
                'excerpt' => 'Shade-loving foliage plants that add texture and calm color beneath trees and along borders.',
                'image' => 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 5,
            ],
            [
                'title' => 'Azaleas',
                'slug' => 'azaleas',
                'excerpt' => 'Spring showstoppers for woodland edges and foundation plantings across the Southeast.',
                'image' => 'https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 6,
            ],
            [
                'title' => 'Daylilies',
                'slug' => 'daylilies',
                'excerpt' => 'Easy, colorful perennials that return year after year with minimal fuss.',
                'image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 7,
            ],
            [
                'title' => 'Boxwoods',
                'slug' => 'boxwoods',
                'excerpt' => 'Evergreen structure for hedges, borders, and formal garden accents.',
                'image' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 8,
            ],
            [
                'title' => 'Lavender',
                'slug' => 'lavender',
                'excerpt' => 'Fragrant, sun-loving plants for borders, pathways, and pollinator gardens.',
                'image' => 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 9,
            ],
            [
                'title' => 'Ferns',
                'slug' => 'ferns',
                'excerpt' => 'Lush texture for shade gardens, woodland edges, and moist planting beds.',
                'image' => 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 10,
            ],
            [
                'title' => 'Flowering Trees',
                'slug' => 'flowering-trees',
                'excerpt' => 'Seasonal bloom and lasting structure for landscapes that need a strong focal point.',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
                'sort_order' => 11,
            ],
            [
                'title' => 'Perennial Borders',
                'slug' => 'perennial-borders',
                'excerpt' => 'Mixed perennial plantings that return each year with color, texture, and pollinator support.',
                'image' => 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
                'sort_order' => 12,
            ],
        ];

        foreach ($categories as $category) {
            PlantTypeCategory::updateOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_published' => true])
            );
        }
    }
}
