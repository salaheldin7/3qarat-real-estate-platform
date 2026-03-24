<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SitemapController;

/*
|--------------------------------------------------------------------------
| Public Routes (No Middleware)
|--------------------------------------------------------------------------
|
| These routes are for public content that should not have sessions,
| CSRF tokens, or cookies. Perfect for bots, crawlers, and search engines.
|
*/

// Sitemap routes (no session, no CSRF, no cookies)
Route::get('sitemap.xml', [SitemapController::class, 'index']);
Route::get('sitemap-test', [SitemapController::class, 'test']);
Route::get('generate-sitemap', [SitemapController::class, 'generate']);

// You can add robots.txt here too if needed
// Route::get('robots.txt', [RobotsController::class, 'index']);