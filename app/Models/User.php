<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'username',
        'phone',
        'password',
        'role',
        'is_admin',
        'is_seller',
        'is_founder',
        'is_banned',
        'banned',
        'banned_at',
        'ban_reason',
        'profile_data',
        'address',
        'is_online',
        'last_seen_at',
        'last_activity_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'is_seller' => 'boolean',
        'is_founder' => 'boolean',
        'is_banned' => 'boolean',
        'banned' => 'boolean',
        'banned_at' => 'datetime',
        'profile_data' => 'array',
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Legacy relationships (keeping for backward compatibility)
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Real Estate relationships
     */
    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    public function approvedProperties(): HasMany
    {
        return $this->hasMany(Property::class, 'approved_by');
    }

    public function sentChats(): HasMany
    {
        return $this->hasMany(Chat::class, 'sender_id');
    }

    public function receivedChats(): HasMany
    {
        return $this->hasMany(Chat::class, 'receiver_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoriteProperties()
    {
        return $this->belongsToMany(Property::class, 'favorites')
                    ->withTimestamps()
                    ->orderBy('favorites.created_at', 'desc');
    }

    public function contactRequests(): HasMany
    {
        return $this->hasMany(ContactRequest::class);
    }

    public function assignedContactRequests(): HasMany
    {
        return $this->hasMany(ContactRequest::class, 'assigned_to');
    }

    /**
     * Scopes
     */
    public function scopeAdmins($query)
    {
        return $query->where('is_admin', true);
    }

    public function scopeSellers($query)
    {
        return $query->where('is_seller', true);
    }

    public function scopeRegularUsers($query)
    {
        return $query->where('is_seller', false)->where('is_admin', false);
    }

    public function scopeActive($query)
    {
        return $query->where('is_banned', false);
    }

    public function scopeBanned($query)
    {
        return $query->where('is_banned', true);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Helper methods
     */
    public function isAdmin(): bool
    {
        return $this->is_admin || $this->is_founder || $this->role === 'admin';
    }

    public function isSeller(): bool
    {
        return $this->is_seller || $this->role === 'seller';
    }

    public function isFounder(): bool
    {
        return $this->is_founder || $this->role === 'founder';
    }

    public function isRegularUser(): bool
    {
        return !$this->isAdmin() && !$this->isSeller() && !$this->isFounder();
    }

    public function isBanned(): bool
    {
        return $this->is_banned || $this->banned;
    }

    public function ban($reason = null, $adminId = null): void
    {
        $this->update([
            'is_banned' => true,
            'banned_at' => now(),
            'ban_reason' => $reason,
        ]);
    }

    public function unban(): void
    {
        $this->update([
            'is_banned' => false,
            'banned_at' => null,
            'ban_reason' => null,
        ]);
    }

    public function makeAdmin(): void
    {
        $this->update([
            'is_admin' => true,
            'role' => 'admin',
        ]);
    }

    public function makeSeller(): void
    {
        $this->update([
            'is_seller' => true,
            'role' => 'seller',
        ]);
    }

    public function makeRegularUser(): void
    {
        $this->update([
            'is_admin' => false,
            'is_seller' => false,
            'role' => 'user',
        ]);
    }

    /**
     * Get all chats for this user
     */
    public function getAllChats()
    {
        return Chat::where(function ($query) {
            $query->where('sender_id', $this->id)
                  ->where('deleted_by_sender', false);
        })->orWhere(function ($query) {
            $query->where('receiver_id', $this->id)
                  ->where('deleted_by_receiver', false);
        })->orderBy('created_at', 'desc');
    }

    /**
     * Get unread chats count
     */
    public function getUnreadChatsCount()
    {
        return Chat::where('receiver_id', $this->id)
                   ->where('is_read', false)
                   ->where('deleted_by_receiver', false)
                   ->count();
    }

    /**
     * Get active properties count
     */
    public function getActivePropertiesCount()
    {
        return $this->properties()->where('status', 'approved')->count();
    }

    /**
     * Get pending properties count
     */
    public function getPendingPropertiesCount()
    {
        return $this->properties()->where('status', 'pending')->count();
    }

    /**
     * Accessors
     */
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getDisplayNameAttribute()
    {
        return $this->username ?: $this->name;
    }

    public function getRoleBadgeColorAttribute()
    {
        return match($this->role) {
            'admin' => 'red',
            'seller' => 'blue',
            'user' => 'green',
            default => 'gray',
        };
    }

    public function getStatusBadgeColorAttribute()
    {
        return $this->is_banned ? 'red' : 'green';
    }

    public function getFormattedPhoneAttribute()
    {
        if (!$this->phone) {
            return null;
        }

        // Format Egyptian phone numbers
        $phone = preg_replace('/[^0-9]/', '', $this->phone);
        
        if (strlen($phone) === 11 && substr($phone, 0, 2) === '01') {
            return '+20' . $phone;
        }
        
        if (strlen($phone) === 13 && substr($phone, 0, 3) === '201') {
            return '+' . $phone;
        }
        
        return $this->phone;
    }
}
