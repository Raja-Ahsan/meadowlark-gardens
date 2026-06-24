<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Tennessee Redbud', 'category' => 'Trees', 'price' => 34.99, 'wholesale_price' => 22.00, 'image' => 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=800&q=80', 'description' => 'A stunning native flowering tree with vibrant magenta-pink blooms in early spring. Perfect for Tennessee landscapes.', 'badge' => 'Native', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Purple Coneflower', 'category' => 'Perennials', 'price' => 8.99, 'wholesale_price' => 4.50, 'image' => 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80', 'description' => 'Beloved native perennial with daisy-like purple petals. Drought-tolerant and beloved by pollinators.', 'badge' => 'Bestseller', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Oakleaf Hydrangea', 'category' => 'Shrubs', 'price' => 24.99, 'wholesale_price' => 15.00, 'image' => 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=800&q=80', 'description' => 'Four-season interest with white flower clusters, exfoliating bark, and fiery fall foliage.', 'badge' => null, 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Black-Eyed Susan', 'category' => 'Perennials', 'price' => 6.99, 'wholesale_price' => 3.50, 'image' => 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?auto=format&fit=crop&w=800&q=80', 'description' => 'Cheerful golden-yellow wildflower that blooms all summer long. A Tennessee meadow staple.', 'badge' => 'Native', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'River Birch', 'category' => 'Trees', 'price' => 49.99, 'wholesale_price' => 32.00, 'image' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', 'description' => 'Elegant multi-stem tree with peeling, cinnamon-colored bark. Thrives in moist Tennessee soil.', 'badge' => null, 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Butterfly Weed', 'category' => 'Perennials', 'price' => 7.49, 'wholesale_price' => 3.75, 'image' => 'https://images.unsplash.com/photo-1530092376999-2431865aa8df?auto=format&fit=crop&w=800&q=80', 'description' => 'Brilliant orange milkweed that attracts monarch butterflies. Heat and drought tolerant.', 'badge' => 'Pollinator', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Switchgrass', 'category' => 'Grasses', 'price' => 11.99, 'wholesale_price' => 6.50, 'image' => 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80', 'description' => 'Upright native ornamental grass with airy seed heads. Turns golden-red in autumn.', 'badge' => 'Native', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Southern Magnolia', 'category' => 'Trees', 'price' => 59.99, 'wholesale_price' => 40.00, 'image' => 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&w=800&q=80', 'description' => 'Iconic Southern evergreen with large, fragrant white blossoms. A Tennessee classic.', 'badge' => 'Bestseller', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Wild Bergamot', 'category' => 'Perennials', 'price' => 7.99, 'wholesale_price' => 4.00, 'image' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', 'description' => 'Fragrant lavender blooms attract bees, butterflies, and hummingbirds from July–September.', 'badge' => 'Pollinator', 'in_stock' => false, 'min_wholesale_qty' => 5],
            ['name' => 'American Holly', 'category' => 'Shrubs', 'price' => 29.99, 'wholesale_price' => 19.00, 'image' => 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=800&q=80', 'description' => 'Evergreen native shrub with brilliant red berries in winter. Birds adore it.', 'badge' => null, 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Blue Wild Indigo', 'category' => 'Perennials', 'price' => 9.99, 'wholesale_price' => 5.50, 'image' => 'https://images.unsplash.com/photo-1490750967868-88df5691cc83?auto=format&fit=crop&w=800&q=80', 'description' => 'Stunning deep blue flower spikes in late spring followed by decorative black seed pods.', 'badge' => 'Native', 'in_stock' => true, 'min_wholesale_qty' => 5],
            ['name' => 'Little Bluestem', 'category' => 'Grasses', 'price' => 10.99, 'wholesale_price' => 5.75, 'image' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', 'description' => 'Fine-textured native grass that turns copper-orange in fall. Exceptional winter interest.', 'badge' => null, 'in_stock' => true, 'min_wholesale_qty' => 5],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
