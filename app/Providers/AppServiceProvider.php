<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Property;
use App\Observers\PropertyObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
          if (config('app.env') === 'production') {
        \URL::forceScheme('https');
    }
        // Register property observer for auto-indexing
        Property::observe(PropertyObserver::class);
    }
}