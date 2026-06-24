<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\WholesaleApplication;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            BrandSeeder::class,
            EcommerceSeeder::class,
            AttributeSeeder::class,
            ReviewSeeder::class,
        ]);

        WholesaleApplication::create([
            'business_name' => 'Green Thumb Nursery',
            'contact_name' => 'Sarah Mitchell',
            'email' => 'sarah@greenthumb.com',
            'phone' => '(615) 555-0191',
            'address' => '245 Garden Way, Nashville, TN 37201',
            'business_type' => 'Retail Nursery',
            'estimated_monthly_order' => '$2,000 - $5,000',
            'status' => 'pending',
            'submitted_at' => now()->subDays(3),
        ]);

        WholesaleApplication::create([
            'business_name' => 'Bloom & Grow Landscaping',
            'contact_name' => 'Marcus Johnson',
            'email' => 'marcus@bloomgrow.com',
            'phone' => '(865) 555-0247',
            'address' => '88 Creekside Blvd, Knoxville, TN 37902',
            'business_type' => 'Landscaping Company',
            'estimated_monthly_order' => '$5,000 - $10,000',
            'status' => 'pending',
            'submitted_at' => now()->subDays(1),
        ]);

        $wholesaleUser = User::where('email', 'wholesale@demo.com')->first();
        $products = Product::all()->keyBy('name');

        if ($wholesaleUser && $products->isNotEmpty()) {
            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Y').'-001',
                'user_id' => $wholesaleUser->id,
                'business_name' => $wholesaleUser->business_name,
                'type' => 'wholesale',
                'total' => 332.50,
                'status' => 'delivered',
                'payment_method' => 'Net 30',
            ]);

            $order->items()->createMany([
                ['product_id' => $products->first()->id, 'quantity' => 10, 'unit_price' => 22.00],
                ['product_id' => $products->skip(1)->first()->id, 'quantity' => 25, 'unit_price' => 4.50],
            ]);
        }
    }
}
