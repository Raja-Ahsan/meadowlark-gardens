<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use App\Models\WholesaleApplication;
use Database\Seeders\CategorySeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EtsyImportService
{
    private string $importPath;

    /** @var array<string, int> */
    private array $userCache = [];

    public function __construct(?string $importPath = null)
    {
        $this->importPath = $importPath ?? database_path('imports/etsy');
    }

    public function run(): array
    {
        $this->assertFilesExist();

        $this->wipeCatalogData();
        (new CategorySeeder)->run();
        $this->importShopSettings();
        $productCount = $this->importProducts();
        $reviewCount = $this->importReviews();

        return [
            'products' => $productCount,
            'reviews' => $reviewCount,
        ];
    }

    private function assertFilesExist(): void
    {
        foreach (['EtsyListingsDownload.csv', 'reviews-1.json', 'reviews-2.json', 'shop_settings.json'] as $file) {
            if (! is_file("{$this->importPath}/{$file}")) {
                throw new \RuntimeException("Missing import file: {$this->importPath}/{$file}");
            }
        }
    }

    private function wipeCatalogData(): void
    {
        DB::table('wishlists')->delete();
        Review::query()->delete();
        DB::table('order_items')->delete();
        Order::query()->delete();
        Product::query()->delete();
        WholesaleApplication::query()->delete();
        $this->userCache = [];

        User::where('email', 'like', 'etsy.%@import.meadowlarkgardens.local')->delete();
    }

    private function importShopSettings(): void
    {
        $data = json_decode(file_get_contents("{$this->importPath}/shop_settings.json"), true);
        if (! is_array($data)) {
            return;
        }

        $billing = $data['billing_address'] ?? $data['credit_card']['billing_address'] ?? [];
        $address = trim(implode("\n", array_filter([
            $billing['first_line'] ?? '1200 Meadowlark Place',
            ($billing['city'] ?? 'Manchester').', '.($billing['state'] ?? 'TN').' '.($billing['zip_code'] ?? '37355'),
        ])));

        $phone = $data['phone_number'] ?? '';
        if (strlen($phone) === 10) {
            $phone = '('.substr($phone, 0, 3).') '.substr($phone, 3, 3).'-'.substr($phone, 6);
        }

        $members = collect($data['members'] ?? [])->pluck('name')->filter()->implode(',');
        $owner = $data['members'][0]['name'] ?? 'Tracy';
        $bio = html_entity_decode(strip_tags($data['members'][0]['bio'] ?? ''), ENT_QUOTES | ENT_HTML5);

        // Do not import payment or identity fields from Etsy exports.
        Setting::set('site_name', 'Meadowlark Gardens TN');
        Setting::set('shop_name', $data['name'] ?? 'MeadowlarkGardensTN');
        Setting::set('shop_owner', $owner);
        Setting::set('shop_location', 'Manchester, Tennessee');
        Setting::set('shop_avatar', $data['icon_url'] ?? '');
        Setting::set('shop_members', $members ?: 'Tracy,John');
        Setting::set('shop_years_active', '6');
        Setting::set('shop_response_time', 'Typically responds within a few hours');
        Setting::set('site_phone', $phone);
        Setting::set('site_email', Setting::get('site_email', 'hello@meadowlarkgardens.com'));
        Setting::set('contact_address', $address);
        Setting::set('footer_description', $bio ?: 'Rooted in Tennessee — propagating and growing quality plants from our backyard nursery.');
        Setting::set('contact_page_subtitle', 'We\'d love to hear from you. Our team usually responds within one business day.');
    }

    private function importProducts(): int
    {
        $rows = $this->parseCsv("{$this->importPath}/EtsyListingsDownload.csv");
        $categories = Category::all()->keyBy('slug');
        $usedSlugs = [];
        $count = 0;

        foreach ($rows as $index => $row) {
            $title = trim($row['TITLE'] ?? '');
            if ($title === '') {
                continue;
            }

            $slug = $this->uniqueSlug(Str::slug($title), $usedSlugs);
            $usedSlugs[] = $slug;

            $categorySlug = $this->detectCategory($title, $row['TAGS'] ?? '');
            $category = $categories->get($categorySlug) ?? $categories->first();
            $price = (float) ($row['PRICE'] ?? 0);
            $quantity = max(0, (int) ($row['QUANTITY'] ?? 0));
            $description = trim($row['DESCRIPTION'] ?? '');
            $tags = $this->parseTags($row['TAGS'] ?? '');

            $images = [];
            for ($i = 1; $i <= 10; $i++) {
                $url = trim($row["IMAGE{$i}"] ?? '');
                if ($url !== '') {
                    $images[] = $url;
                }
            }

            $sku = trim($row['SKU'] ?? '');
            if ($sku === '') {
                $sku = 'ETSY-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
            }

            $product = Product::create([
                'name' => $title,
                'slug' => $slug,
                'sku' => $sku,
                'type' => 'simple',
                'category_id' => $category?->id,
                'category' => $category?->name ?? 'Perennials',
                'price' => $price,
                'wholesale_price' => round($price * 0.6, 2),
                'image' => $images[0] ?? '',
                'description' => $description,
                'short_description' => $this->shortDescription($description),
                'tags' => $tags,
                'in_stock' => $quantity > 0,
                'stock_quantity' => $quantity,
                'manage_stock' => true,
                'min_wholesale_qty' => 5,
                'is_active' => true,
                'is_featured' => $index < 8,
            ]);

            foreach ($images as $sort => $url) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $url,
                    'alt' => $title,
                    'is_primary' => $sort === 0,
                    'sort_order' => $sort,
                ]);
            }

            $count++;
        }

        return $count;
    }

    private function importReviews(): int
    {
        $reviews1 = json_decode(file_get_contents("{$this->importPath}/reviews-1.json"), true) ?? [];
        $reviews2 = json_decode(file_get_contents("{$this->importPath}/reviews-2.json"), true) ?? [];
        $allReviews = array_merge($reviews2, $reviews1);

        $productIds = Product::orderBy('id')->pluck('id')->all();
        if ($productIds === []) {
            return 0;
        }

        $productCount = count($productIds);
        $reviewerNames = collect($allReviews)
            ->map(fn ($review) => trim($review['reviewer'] ?? '') ?: 'Buyer')
            ->unique()
            ->values();

        foreach ($reviewerNames as $name) {
            $this->reviewerUserId($name);
        }

        $rows = [];
        foreach ($allReviews as $review) {
            $reviewer = trim($review['reviewer'] ?? '') ?: 'Buyer';
            $body = trim($review['message'] ?? '');
            if ($body === '') {
                continue;
            }

            $orderId = (int) ($review['order_id'] ?? 0);
            $productId = $productIds[$orderId % $productCount];
            $userId = $this->userCache[Str::lower($reviewer)] ?? $this->reviewerUserId($reviewer);
            $rating = max(1, min(5, (int) ($review['star_rating'] ?? 5)));
            $reviewedAt = $this->parseReviewDate($review['date_reviewed'] ?? null)->format('Y-m-d H:i:s');

            $rows[] = [
                'product_id' => $productId,
                'user_id' => $userId,
                'order_id' => null,
                'rating' => $rating,
                'title' => null,
                'body' => $body,
                'review_category' => $this->detectReviewCategory($body),
                'quality_rating' => $rating,
                'delivery_rating' => $rating,
                'service_rating' => $rating,
                'seller_response' => null,
                'seller_responded_at' => null,
                'images' => json_encode([]),
                'is_verified_purchase' => true,
                'is_wholesale' => false,
                'status' => 'approved',
                'created_at' => $reviewedAt,
                'updated_at' => $reviewedAt,
            ];
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            Review::insert($chunk);
        }

        return count($rows);
    }

    private function reviewerUserId(string $reviewer): int
    {
        $key = Str::lower($reviewer);
        if (isset($this->userCache[$key])) {
            return $this->userCache[$key];
        }

        $email = 'etsy.'.substr(md5($key), 0, 12).'@import.meadowlarkgardens.local';

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => ucfirst($reviewer),
                'password' => Hash::make(Str::random(32)),
                'role' => 'customer',
                'approved' => true,
            ]
        );

        $this->userCache[$key] = $user->id;

        return $user->id;
    }

    private function detectCategory(string $title, string $tags): string
    {
        $text = Str::lower($title.' '.$tags);

        $rules = [
            'roses' => ['climbing rose', ' rose', 'rosa '],
            'japanese-maples' => ['japanese maple', 'acer palmatum', 'acer japonicum', 'acer shirasawanum'],
            'hydrangeas' => ['hydrangea'],
            'willows' => ['willow'],
            'lilacs' => ['lilac'],
            'fruit-trees-shrubs' => ['blueberry', 'fig ', 'raspberry', 'fruit tree'],
            'shade-perennials' => ['hosta', 'fern', 'astilbe', 'bleeding heart', 'heuchera', 'shade garden'],
            'flowering-trees' => ['redbud', 'dogwood', 'magnolia', 'flowering tree'],
            'evergreen-shrubs' => ['holly', 'boxwood', 'rhododendron', 'inkberry', 'nandina', 'pieris', 'evergreen shrub'],
            'specialty-evergreens' => ['conifer', 'spruce', 'pine', 'fir '],
            'flowering-shrubs' => ['spirea', 'weigela', 'azalea', 'loropetalum', 'mountain laurel', 'kalmia', 'hydrangea', 'fothergilla', 'deutzia', 'ninebark'],
            'ornamental-shrub' => ['smokebush', 'beautyberry', 'sweetspire'],
            'perennials' => ['perennial', 'coneflower', 'dianthus', 'daylily', 'iris', 'peony', 'sedum', 'phlox'],
        ];

        foreach ($rules as $slug => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    return $slug;
                }
            }
        }

        return 'perennials';
    }

    private function detectReviewCategory(string $body): ?string
    {
        $text = Str::lower($body);

        $rules = [
            'delivery_packaging' => ['packaged', 'packaging', 'packed', 'shipping', 'arrived', 'delivery'],
            'description_accuracy' => ['as described', 'exactly as', 'as promised', 'like the picture'],
            'seller_service' => ['seller', 'customer service', 'communication', 'responsive'],
            'quality' => ['quality', 'healthy', 'thriving', 'vibrant'],
            'appearance' => ['beautiful', 'gorgeous', 'stunning', 'looks great', 'lovely'],
            'condition' => ['condition', 'roots', 'leafs', 'leaves'],
            'sizing_fit' => ['size', 'huge', 'small', 'starter'],
        ];

        foreach ($rules as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    return $category;
                }
            }
        }

        return 'quality';
    }

    private function parseTags(string $raw): array
    {
        if ($raw === '') {
            return [];
        }

        return collect(explode(',', $raw))
            ->map(fn ($tag) => Str::title(str_replace('_', ' ', trim($tag))))
            ->filter()
            ->take(13)
            ->values()
            ->all();
    }

    private function shortDescription(string $description): string
    {
        $text = preg_replace('/\s+/', ' ', trim($description)) ?? '';
        if (preg_match('/This listing is for (.+?)(\.|$)/i', $text, $matches)) {
            return Str::limit($matches[1].'.', 220);
        }

        return Str::limit($text, 220);
    }

    private function parseReviewDate(?string $date): \DateTimeInterface
    {
        if ($date && ($parsed = \DateTime::createFromFormat('m/d/Y', $date))) {
            return $parsed;
        }

        return now();
    }

    /** @return array<int, array<string, string>> */
    private function parseCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        if ($handle === false) {
            throw new \RuntimeException("Unable to read CSV: {$path}");
        }

        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);

            return [];
        }

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) !== count($headers)) {
                continue;
            }
            $rows[] = array_combine($headers, $data);
        }

        fclose($handle);

        return $rows;
    }

    private function uniqueSlug(string $base, array $used): string
    {
        $slug = $base !== '' ? $base : 'product';
        $candidate = $slug;
        $i = 2;
        while (in_array($candidate, $used, true) || Product::where('slug', $candidate)->exists()) {
            $candidate = "{$slug}-{$i}";
            $i++;
        }

        return $candidate;
    }
}
