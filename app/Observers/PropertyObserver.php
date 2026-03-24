<?php

namespace App\Observers;

use App\Models\Property;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PropertyObserver
{
    /**
     * Handle the Property "created" event.
     * Auto-request indexing when new property is added
     */
    public function created(Property $property)
    {
        if ($property->status === 'active' || $property->status === 'approved') {
            $url = url('/property/' . $property->id);
            
            // Ping Google to crawl the new property
            $this->pingGoogle($url);
            
            // Also ping the sitemap
            $this->pingSitemap();
            
            Log::info('New property created - indexing requested', [
                'property_id' => $property->id,
                'url' => $url,
                'title' => $property->title ?? 'N/A'
            ]);
        }
    }

    /**
     * Handle the Property "updated" event.
     * Re-index when property details change
     */
    public function updated(Property $property)
    {
        // Only request re-indexing if important fields changed
        if ($property->wasChanged(['title', 'description', 'price', 'status', 'location', 'type'])) {
            $url = url('/property/' . $property->id);
            
            if ($property->status === 'active' || $property->status === 'approved') {
                // Request indexing for active properties
                $this->pingGoogle($url);
                
                Log::info('Property updated - re-indexing requested', [
                    'property_id' => $property->id,
                    'url' => $url,
                    'changed_fields' => array_keys($property->getChanges())
                ]);
            }
        }
    }

    /**
     * Handle the Property "deleted" event.
     * Notify Google that URL should be removed
     */
    public function deleted(Property $property)
    {
        $url = url('/property/' . $property->id);
        
        // Ping sitemap to update (property will be removed from sitemap)
        $this->pingSitemap();
        
        Log::info('Property deleted - sitemap updated', [
            'property_id' => $property->id,
            'url' => $url
        ]);
    }

    /**
     * Ping Google to crawl a specific URL
     * This notifies Google that content has changed
     */
    private function pingGoogle($url)
    {
        try {
            // Google's ping service for instant indexing
            $pingUrl = 'https://www.google.com/ping?sitemap=' . urlencode($url);
            
            // Send request asynchronously (won't slow down the main request)
            Http::timeout(3)->get($pingUrl);
            
            Log::info('Pinged Google for URL', ['url' => $url]);
        } catch (\Exception $e) {
            // Don't throw error if ping fails - it's not critical
            Log::warning('Failed to ping Google', [
                'url' => $url,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Ping Google Sitemap
     * Tells Google the sitemap has been updated
     */
    private function pingSitemap()
    {
        try {
            $sitemapUrl = url('/sitemap.xml');
            $pingUrl = 'https://www.google.com/ping?sitemap=' . urlencode($sitemapUrl);
            
            Http::timeout(3)->get($pingUrl);
            
            Log::info('Pinged Google sitemap', ['sitemap' => $sitemapUrl]);
        } catch (\Exception $e) {
            Log::warning('Failed to ping sitemap', [
                'error' => $e->getMessage()
            ]);
        }
    }
}