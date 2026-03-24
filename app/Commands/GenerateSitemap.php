<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\SitemapGenerator;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate sitemap.xml and save to public folder';

    public function handle()
    {
        $this->info('Generating sitemap...');
        $path = public_path('sitemap.xml');

        SitemapGenerator::create(config('app.url'))->writeToFile($path);

        $this->info("Sitemap written to: {$path}");
        return 0;
    }
}
