<?php

namespace Database\Seeders;

use App\Services\EtsyImportService;
use Illuminate\Database\Seeder;

class EtsyImportSeeder extends Seeder
{
    public function run(): void
    {
        $result = app(EtsyImportService::class)->run();

        $this->command?->info("Imported {$result['products']} products and {$result['reviews']} reviews from Etsy.");
    }
}
