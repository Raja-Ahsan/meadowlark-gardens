<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $sellerName = 'John Moser';
        $products = Product::where('is_active', true)->take(5)->get();

        if ($products->isEmpty()) {
            return;
        }

        $reviewers = [
            ['name' => 'Thao', 'email' => 'thao.review@demo.com'],
            ['name' => 'Tanya', 'email' => 'tanya.review@demo.com'],
            ['name' => 'Ruey-I', 'email' => 'rueyi.review@demo.com'],
            ['name' => 'Amandatory', 'email' => 'amandatory.review@demo.com'],
            ['name' => 'Tamara', 'email' => 'tamara.review@demo.com'],
            ['name' => 'Katie', 'email' => 'katie.review@demo.com'],
            ['name' => 'Brian', 'email' => 'brian.review@demo.com'],
            ['name' => 'Analise', 'email' => 'analise.review@demo.com'],
        ];

        $users = collect($reviewers)->map(fn ($r) => User::updateOrCreate(
            ['email' => $r['email']],
            ['name' => $r['name'], 'password' => Hash::make('password123'), 'role' => 'customer', 'approved' => true]
        ));

        $samples = [
            [
                'rating' => 5,
                'body' => 'healthy plant love it',
                'category' => 'condition',
                'response' => "Thank you so much, I'm glad you like it!!!",
                'daysAgo' => 9,
            ],
            [
                'rating' => 5,
                'body' => 'Shipping was fast, packed very securely, plants came full of leafs, roots protected and came as described. Would order here again. Thank you for the quality and care of the plants!',
                'category' => 'delivery_packaging',
                'response' => 'Thank you so much, Tanya! I really appreciate it!',
                'daysAgo' => 14,
            ],
            [
                'rating' => 5,
                'body' => "Item came as described, and with detailed instructions on how to acclimate the plant to its new environment. Item was packed with care, and bounced back from shipping shock really quickly. Can't wait to see how it grows in its new home! Would order from this seller again!",
                'category' => 'description_accuracy',
                'response' => 'Thank you again!!',
                'daysAgo' => 24,
            ],
            [
                'rating' => 5,
                'body' => 'My plant arrived exactly when promised. It was packaged so well that my fully leafed plant was just damp. It did not drop a single leaf in the box. I AM EXTREMELY HAPPY WITH MY PURCHASE AND CAN\'T WAIT TO SEE HOW IT GROWS. I HIGHLY RECOMMEND THIS NURSERY.',
                'category' => 'quality',
                'response' => 'Thank you so much!!! It really means a lot!!',
                'daysAgo' => 37,
                'images' => ['https://images.unsplash.com/photo-1466781783364-36c955e42a7f?auto=format&fit=crop&w=400&q=80'],
            ],
            [
                'rating' => 5,
                'body' => 'Beautiful addition to my garden, looks great and thriving after a week!',
                'category' => 'appearance',
                'response' => 'So glad it is doing well for you!',
                'daysAgo' => 5,
                'images' => ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80'],
            ],
            [
                'rating' => 5,
                'body' => 'very healthy plant i cant wait to watch it grow!',
                'category' => 'condition',
                'response' => null,
                'daysAgo' => 1,
            ],
            [
                'rating' => 5,
                'body' => 'Good size starter plant now thriving and has at least doubled in size in 6-8 wks.',
                'category' => 'sizing_fit',
                'response' => 'Wonderful to hear!',
                'daysAgo' => 2,
                'images' => ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80'],
            ],
            [
                'rating' => 4,
                'body' => 'The plants were as described. Seller service was helpful when I had a question.',
                'category' => 'seller_service',
                'response' => 'Happy to help anytime!',
                'daysAgo' => 3,
            ],
        ];

        foreach ($products as $productIndex => $product) {
            foreach ($samples as $sampleIndex => $sample) {
                $user = $users[($productIndex + $sampleIndex) % $users->count()];

                Review::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'user_id' => $user->id,
                        'body' => $sample['body'],
                    ],
                    [
                        'rating' => $sample['rating'],
                        'quality_rating' => $sample['rating'],
                        'delivery_rating' => $sample['rating'],
                        'service_rating' => $sample['rating'],
                        'review_category' => $sample['category'],
                        'images' => $sample['images'] ?? [],
                        'is_verified_purchase' => true,
                        'status' => 'approved',
                        'seller_response' => $sample['response'],
                        'seller_responded_at' => $sample['response'] ? now()->subDays($sample['daysAgo'])->addDay() : null,
                        'created_at' => now()->subDays($sample['daysAgo']),
                        'updated_at' => now()->subDays($sample['daysAgo']),
                    ]
                );
            }
        }
    }
}
