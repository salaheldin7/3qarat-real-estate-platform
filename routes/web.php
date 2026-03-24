<?php

// web.php

use Illuminate\Support\Facades\Route;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Property;
use App\Http\Controllers\SitemapController;

Route::get('/robots.txt', function() {
    $content = "User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /seller-panel/
Disallow: /my-ads/
Disallow: /profile/

User-agent: Googlebot
Allow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

Sitemap: https://3qaraty.icu/sitemap.xml";

    return response($content, 200)
        ->header('Content-Type', 'text/plain');
});

// Sitemap routes (your existing code)
Route::withoutMiddleware(['web'])->group(function () {
    Route::get('sitemap.xml', [SitemapController::class, 'index']);
    Route::get('sitemap-test', [SitemapController::class, 'test']);
    Route::get('generate-sitemap', [SitemapController::class, 'generate']);
});