<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'governorate_id',
        'city_id',
        'title',
        'description',
        'price',
        'rent_or_buy',
        'category',
        'bedrooms',
        'bathrooms',
        'area',
        'floor_number',
        'total_floors',
        'built_year',
        'furnished',
        'has_parking',
        'has_garden',
        'has_pool',
        'has_elevator',
        'address',
        'latitude',
        'longitude',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'images',
        'video_url',
        'documents',
        'slug',
        'features',
        'views_count',
        'inquiries_count',
        'is_featured',
        'featured_until',
        'sold_at',
        'is_active',
        'needs_reapproval',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'area' => 'decimal:2',
        'latitude' => 'decimal:8',
          'viewers' => 'array',
        'longitude' => 'decimal:8',
        'furnished' => 'boolean',
        'has_parking' => 'boolean',
        'has_garden' => 'boolean',
        'has_pool' => 'boolean',
        'has_elevator' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'needs_reapproval' => 'boolean',
        'images' => 'array',
        'documents' => 'array',
        'features' => 'array',
        'approved_at' => 'datetime',
        'featured_until' => 'datetime',
        'sold_at' => 'datetime',
        'views_count' => 'integer',
        'inquiries_count' => 'integer',
    ];

    protected $dates = [
        'approved_at',
        'featured_until',
        'sold_at',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($property) {
            if (empty($property->slug)) {
                $property->slug = Str::slug($property->title) . '-' . Str::random(6);
            }
        });

        static::updating(function ($property) {
            if ($property->isDirty('title')) {
                $property->slug = Str::slug($property->title) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Get the user that owns the property
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the governorate
     */
    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class);
    }

    /**
     * Get the city
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Get the admin who approved the property
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get all chats related to this property
     */
    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    /**
     * Scopes
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    public function scopeRented($query)
    {
        return $query->where('status', 'rented');
    }

    public function scopeForRent($query)
    {
        return $query->where('rent_or_buy', 'rent');
    }

    public function scopeForSale($query)
    {
        return $query->where('rent_or_buy', 'buy');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByGovernorate($query, $governorateId)
    {
        return $query->where('governorate_id', $governorateId);
    }

    public function scopeByCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)
                    ->where(function ($q) {
                        $q->whereNull('featured_until')
                          ->orWhere('featured_until', '>', now());
                    });
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopePopular($query)
    {
        return $query->orderBy('views_count', 'desc');
    }

    /**
     * Accessors
     */
    public function getFormattedPriceAttribute()
    {
        $formatted = number_format($this->price, 0);
        $suffix = $this->rent_or_buy === 'rent' ? '/month' : '';
        return "{$formatted} EGP{$suffix}";
    }

    public function getMainImageAttribute()
    {
        return $this->images && count($this->images) > 0 ? $this->images[0] : null;
    }

    public function getLocationAttribute()
    {
        $locale = app()->getLocale();
        $cityName = $locale === 'ar' ? $this->city->name_ar : $this->city->name_en;
        $governorateName = $locale === 'ar' ? $this->governorate->name_ar : $this->governorate->name_en;
        
        return "{$cityName}, {$governorateName}";
    }

    public function getIsAvailableAttribute()
    {
        return in_array($this->status, ['approved']);
    }

    public function getIsSoldAttribute()
    {
        return in_array($this->status, ['sold', 'rented']);
    }

    /**
     * Helper methods
     */
    public function incrementViews()
    {
        // Only increment if not already viewed by this user/session (stricter)
        $user = auth()->user();
        if ($user) {
            $key = 'property_viewed_' . $this->id . '_user_' . $user->id;
        } else {
            $sessionId = session()->getId();
            $key = 'property_viewed_' . $this->id . '_guest_' . $sessionId;
        }
        // Use cache for 12 hours per user or per session
        if (!cache()->has($key)) {
            $this->increment('views_count');
            cache()->put($key, true, now()->addHours(12));
        }
    }

    public function incrementInquiries()
    {
        $this->increment('inquiries_count');
    }

    public function approve($adminId = null)
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);
    }

    public function reject($reason = null, $adminId = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'approved_by' => $adminId,
            'approved_at' => null,
        ]);
    }

    public function markAsSold()
    {
        $this->update([
            'status' => $this->rent_or_buy === 'rent' ? 'rented' : 'sold',
            'sold_at' => now(),
        ]);
    }

    public function makeFeatured($until = null)
    {
        $this->update([
            'is_featured' => true,
            'featured_until' => $until ?? now()->addDays(30),
        ]);
    }

    public function removeFeatured()
    {
        $this->update([
            'is_featured' => false,
            'featured_until' => null,
        ]);
    }

    /**
     * Get route key name for URL binding
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
