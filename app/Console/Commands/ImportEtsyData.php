<?php

namespace App\Console\Commands;

use App\Services\EtsyImportService;
use Illuminate\Console\Command;

class ImportEtsyData extends Command
{
    protected $signature = 'etsy:import {--path= : Custom path to Etsy import files}';

    protected $description = 'Replace catalog data with Etsy listings, reviews, and shop settings';

    public function handle(EtsyImportService $import): int
    {
        $path = $this->option('path');
        if ($path) {
            $import = new EtsyImportService($path);
        }

        $this->warn('This will remove existing products, reviews, and orders, then import Etsy data.');

        if (! $this->confirm('Continue?', true)) {
            return self::FAILURE;
        }

        $result = $import->run();

        $this->info("Imported {$result['products']} products and {$result['reviews']} reviews.");

        return self::SUCCESS;
    }
}
