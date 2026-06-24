<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $base = config('app.url');
        $urls = [
            ['loc' => $base.'/', 'priority' => '1.0'],
            ['loc' => $base.'/shop', 'priority' => '0.9'],
            ['loc' => $base.'/about', 'priority' => '0.7'],
            ['loc' => $base.'/contact', 'priority' => '0.7'],
            ['loc' => $base.'/wholesale/apply', 'priority' => '0.6'],
        ];

        Product::where('is_active', true)->each(function (Product $p) use (&$urls, $base) {
            $slug = $p->slug ?? $p->id;
            $urls[] = ['loc' => $base.'/product/'.$slug, 'priority' => '0.8'];
        });

        Category::where('is_active', true)->each(function (Category $c) use (&$urls, $base) {
            $urls[] = ['loc' => $base.'/shop?category='.$c->slug, 'priority' => '0.7'];
        });

        Brand::where('is_active', true)->each(function (Brand $b) use (&$urls, $base) {
            $urls[] = ['loc' => $base.'/shop?brand='.$b->slug, 'priority' => '0.6'];
        });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($urls as $url) {
            $xml .= '<url>';
            $xml .= '<loc>'.htmlspecialchars($url['loc']).'</loc>';
            $xml .= '<priority>'.$url['priority'].'</priority>';
            $xml .= '</url>';
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
