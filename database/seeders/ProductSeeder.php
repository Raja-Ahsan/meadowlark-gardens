<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    private array $images = [
        'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80',
    ];

    public function run(): void
    {
        DB::table('order_items')->delete();
        Product::query()->delete();

        $catalog = [
            'perennials' => [
                'Purple Coneflower', 'Black-Eyed Susan', 'Butterfly Weed', 'Wild Bergamot',
                'Blue Wild Indigo', 'Switchgrass',
            ],
            'flowering-trees' => ['Tennessee Redbud'],
            'flowering-shrubs' => [
                'Oakleaf Hydrangea', 'Fothergilla', 'Spirea Goldflame', 'Weigela Wine & Roses',
                'Azalea Encore', 'Loropetalum', 'Deutzia Chardonnay Pearls', 'Ninebark Diabolo',
                'Beautyberry', 'Sweetspire Little Henry', 'Virginia Sweetspire',
            ],
            'shade-perennials' => [
                'Hosta Sum and Substance', 'Bleeding Heart', 'Coral Bells Palace Purple', 'Fern Japanese Painted',
            ],
            'roses' => [
                'Knock Out Rose Red', 'Knock Out Rose Pink', 'Drift Rose Coral', 'Drift Rose Peach',
                'David Austin Gertrude Jekyll', 'Climbing Rose New Dawn', 'Floribunda Iceberg',
                'Hybrid Tea Mister Lincoln', 'Grandiflora Queen Elizabeth', 'Shrub Rose Carefree Wonder',
                'Climbing Rose Blaze', 'Miniature Rose Sun Sprinkles', 'Rugosa Rose Hansa',
                'English Rose Abraham Darby', 'Groundcover Rose Flower Carpet', 'Climbing Rose Don Juan',
                'Shrub Rose Home Run', 'Floribunda Julia Child',
            ],
            'hydrangeas' => [
                'Oakleaf Hydrangea Alice', 'Endless Summer Hydrangea', 'Limelight Hydrangea',
                'Pinky Winky Hydrangea', 'Annabelle Hydrangea',
            ],
            'fruit-trees-shrubs' => ['Blueberry Patriot', 'Fig Brown Turkey'],
            'willows' => ['Weeping Willow', 'Pussy Willow', 'Dappled Willow Hakuro Nishiki'],
            'ornamental-shrub' => ['Smokebush Royal Purple'],
            'japanese-maples' => [
                'Bloodgood Japanese Maple', 'Crimson Queen Japanese Maple', 'Emperor I Japanese Maple',
                'Coral Bark Japanese Maple', 'Green Lace Japanese Maple', 'Tamukeyama Japanese Maple',
                'Inaba Shidare Japanese Maple', 'Osakazuki Japanese Maple', 'Shishigashira Japanese Maple',
                'Viridis Japanese Maple', 'Seiryu Japanese Maple', 'Orangeola Japanese Maple',
                'Red Dragon Japanese Maple', 'Butterfly Japanese Maple', 'Sango Kaku Japanese Maple',
                'Beni Schichihenge Japanese Maple', 'Garnet Japanese Maple', 'Waterfall Japanese Maple',
                'Ryusen Japanese Maple', 'Koto No Ito Japanese Maple', 'Aoyagi Japanese Maple',
                'Beni Kawa Japanese Maple', 'Fireglow Japanese Maple', 'Lionheart Japanese Maple',
                'Moonfire Japanese Maple', 'Pixie Japanese Maple', 'Shaina Japanese Maple',
                'Twomblys Red Sentinel', 'Ukigumo Japanese Maple', 'Villa Taranto Japanese Maple',
                'Acer palmatum Atropurpureum', 'Acer palmatum Dissectum', 'Acer palmatum Katsura',
                'Acer palmatum Mikawa Yatsubusa', 'Acer palmatum Orange Dream', 'Acer palmatum Red Select',
                'Acer palmatum Skeeters Broom', 'Acer palmatum Trompenburg', 'Acer palmatum Wilsons Pink Dwarf',
                'Acer japonicum Aconitifolium', 'Acer shirasawanum Aureum', 'Acer shirasawanum Moonrise',
                'Acer palmatum Beni Otake', 'Acer palmatum Geisha', 'Acer palmatum Hubbs Red Willow',
                'Acer palmatum Kagiri Nishiki', 'Acer palmatum Mikazuki', 'Acer palmatum Oshio Beni',
                'Acer palmatum Red Filigree Lace', 'Acer palmatum Shigitatsu Sawa',
            ],
            'evergreen-shrubs' => [
                'American Holly', 'Boxwood Green Mountain', 'Inkberry Holly', 'Cherry Laurel',
                'Nandina Gulf Stream', 'Pieris Mountain Fire', 'Rhododendron Nova Zembla',
                'Skip Laurel', 'Yew Hicksii',
            ],
            'specialty-evergreens' => ['Dwarf Alberta Spruce', 'Gold Mop Cypress'],
            'lilacs' => ['Common Purple Lilac', 'Miss Kim Lilac', 'Bloomerang Lilac', 'President Grevy Lilac'],
            'conifers-specialty' => [
                'Eastern Red Cedar', 'Norway Spruce', 'Blue Atlas Cedar', 'Dawn Redwood',
            ],
        ];

        $generalExtras = [
            'Southern Magnolia', 'River Birch', 'Little Bluestem', 'American Holly',
            'Tennessee Redbud', 'Wild Bergamot', 'Switchgrass', 'Blueberry Patriot', 'Smokebush Royal Purple',
        ];

        $saleSlugs = ['purple-coneflower', 'bloodgood-japanese-maple'];
        $sku = 1;

        foreach ($catalog as $slug => $names) {
            $category = Category::where('slug', $slug)->first();
            if (! $category) {
                continue;
            }

            foreach ($names as $index => $name) {
                $productSlug = Str::slug($name);
                $basePrice = $this->basePrice($slug);
                $onSale = in_array($productSlug, $saleSlugs, true);

                Product::create([
                    'name' => $name,
                    'slug' => $productSlug,
                    'sku' => 'MG-'.str_pad((string) $sku++, 4, '0', STR_PAD_LEFT),
                    'type' => 'simple',
                    'category' => $category->name,
                    'category_id' => $category->id,
                    'price' => $basePrice + ($index % 5) * 2.5,
                    'sale_price' => $onSale ? round(($basePrice + ($index % 5) * 2.5) * 0.85, 2) : null,
                    'wholesale_price' => round(($basePrice + ($index % 5) * 2.5) * 0.6, 2),
                    'image' => $this->images[$index % count($this->images)],
                    'description' => "Premium {$name} grown locally at Meadowlark Gardens. Hardy, healthy, and ready for your Tennessee landscape.",
                    'short_description' => "Quality {$category->name} for home and commercial landscapes.",
                    'badge' => $index === 0 ? 'Bestseller' : null,
                    'in_stock' => true,
                    'stock_quantity' => rand(15, 120),
                    'manage_stock' => true,
                    'is_active' => true,
                    'is_featured' => $index < 2,
                    'min_wholesale_qty' => 5,
                ]);
            }
        }

        foreach ($generalExtras as $index => $name) {
            Product::create([
                'name' => $name,
                'slug' => Str::slug($name).'-general',
                'sku' => 'MG-'.str_pad((string) $sku++, 4, '0', STR_PAD_LEFT),
                'type' => 'simple',
                'category' => 'General',
                'category_id' => null,
                'price' => 34.99 + ($index % 4) * 5,
                'wholesale_price' => round((34.99 + ($index % 4) * 5) * 0.6, 2),
                'image' => $this->images[$index % count($this->images)],
                'description' => "Premium {$name} from Meadowlark Gardens nursery stock.",
                'short_description' => 'Nursery favorite — available while supplies last.',
                'in_stock' => true,
                'stock_quantity' => rand(20, 80),
                'manage_stock' => true,
                'is_active' => true,
                'min_wholesale_qty' => 5,
            ]);
        }
    }

    private function basePrice(string $slug): float
    {
        return match ($slug) {
            'japanese-maples' => 89.99,
            'roses' => 24.99,
            'flowering-trees', 'fruit-trees-shrubs' => 49.99,
            'hydrangeas', 'flowering-shrubs', 'evergreen-shrubs' => 29.99,
            'willows' => 39.99,
            'conifers-specialty', 'specialty-evergreens' => 54.99,
            'lilacs' => 34.99,
            default => 12.99,
        };
    }
}
