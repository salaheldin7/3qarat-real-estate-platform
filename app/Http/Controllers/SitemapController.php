<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SitemapController extends Controller
{
    /**
     * Generate sitemap dynamically
     */
    public function index()
    {
        // Disable session for this request (prevents cookies)
        config(['session.driver' => 'array']);
        
        try {
            // Start XML
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Static pages - All your important pages
            $staticPages = [
                // Main pages
                ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
                ['url' => '/marketplace', 'priority' => '0.9', 'changefreq' => 'daily'],
                ['url' => '/properties', 'priority' => '0.9', 'changefreq' => 'daily'],
                
                // About & Contact
                ['url' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
                ['url' => '/contact', 'priority' => '0.8', 'changefreq' => 'monthly'],
                
                // Auth pages
                ['url' => '/login', 'priority' => '0.6', 'changefreq' => 'yearly'],
                ['url' => '/register', 'priority' => '0.6', 'changefreq' => 'yearly'],
                
                // Additional pages (add more if you have)
                // ['url' => '/blog', 'priority' => '0.7', 'changefreq' => 'weekly'],
                // ['url' => '/faq', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ];

            // Add static pages
            foreach ($staticPages as $page) {
                $xml .= '<url>';
                $xml .= '<loc>' . url($page['url']) . '</loc>';
                $xml .= '<lastmod>' . Carbon::now()->toAtomString() . '</lastmod>';
                $xml .= '<changefreq>' . $page['changefreq'] . '</changefreq>';
                $xml .= '<priority>' . $page['priority'] . '</priority>';
                $xml .= '</url>';
            }

            // Get ALL properties from database
            try {
                $properties = DB::table('properties')
                    ->whereIn('status', ['active', 'approved', 'published']) // Include all active statuses
                    ->select('id', 'updated_at', 'created_at')
                    ->orderBy('updated_at', 'desc')
                    ->get();

                // Add each property with /property/{id} format
                foreach ($properties as $property) {
                    $xml .= '<url>';
                    $xml .= '<loc>' . url('/property/' . $property->id) . '</loc>';
                    $xml .= '<lastmod>' . Carbon::parse($property->updated_at)->toAtomString() . '</lastmod>';
                    $xml .= '<changefreq>daily</changefreq>';
                    $xml .= '<priority>0.8</priority>';
                    $xml .= '</url>';
                }

                // Successfully fetched properties
            } catch (\Exception $e) {
                // If properties table doesn't exist or query fails, continue without properties
                Log::warning('Could not fetch properties for sitemap: ' . $e->getMessage());
            }

            // Close XML
            $xml .= '</urlset>';

            // Return response with proper headers
            return response($xml, 200, [
                'Content-Type' => 'application/xml; charset=utf-8',
                'Cache-Control' => 'public, max-age=1800', // Cache for 30 minutes
            ]);

        } catch (\Exception $e) {
            Log::error('Sitemap generation failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to generate sitemap',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test endpoint to check if controller is working
     */
    public function test()
    {
        $propertiesCount = 0;
        
        try {
            $propertiesCount = DB::table('properties')
                ->whereIn('status', ['active', 'approved', 'published'])
                ->count();
        } catch (\Exception $e) {
            // Table might not exist yet
        }

        return response()->json([
            'status' => 'working',
            'message' => 'SitemapController is accessible',
            'sitemap_url' => url('/sitemap.xml'),
            'properties_count' => $propertiesCount,
            'static_pages' => [
                'Homepage' => url('/'),
                'Marketplace' => url('/marketplace'),
                'Properties' => url('/properties'),
                'About' => url('/about'),
                'Contact' => url('/contact'),
                'Login' => url('/login'),
                'Register' => url('/register'),
            ],
            'timestamp' => now()
        ]);
    }

    /**
     * Generate and save static file
     */
    public function generate()
    {
        try {
            $response = $this->index();
            $xml = $response->getContent();
            
            // Save to public folder
            $path = public_path('sitemap.xml');
            file_put_contents($path, $xml);
            
            // Ping Google that sitemap has been updated
            $this->pingGoogle();
            
            $fileExists = file_exists($path);
            $fileSize = $fileExists ? filesize($path) : 0;
            
            return response()->json([
                'success' => true,
                'message' => 'Sitemap generated, saved, and Google notified',
                'path' => $path,
                'url' => url('sitemap.xml'),
                'file_exists' => $fileExists,
                'file_size' => number_format($fileSize) . ' bytes',
                'google_pinged' => true,
                'timestamp' => now()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ping Google to notify about sitemap update
     */
    private function pingGoogle()
    {
        try {
            $sitemapUrl = url('/sitemap.xml');
            $pingUrl = 'https://www.google.com/ping?sitemap=' . urlencode($sitemapUrl);
            
            // Ping Google
            file_get_contents($pingUrl);
            
            Log::info('Google pinged about sitemap update', ['sitemap' => $sitemapUrl]);
            
            return true;
        } catch (\Exception $e) {
            Log::warning('Failed to ping Google', ['error' => $e->getMessage()]);
            return false;
        }
    }
}