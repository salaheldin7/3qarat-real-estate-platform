<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'read',
        'replied',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'read' => 'boolean',
        'replied' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('read', true);
    }

    public function scopeReplied($query)
    {
        return $query->where('replied', true);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    // Accessors
    public function getDateAttribute()
    {
        return $this->created_at->format('F j, Y');
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    // Helper methods
    public function markAsRead()
    {
        $this->update(['read' => true]);
    }

    public function markAsReplied()
    {
        $this->update(['replied' => true]);
    }
}