<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'assigned_to',
        'admin_notes',
        'resolved_at',
        'email_sent',
        'email_sent_at',
        'email_response',
        'priority',
        'category',
    ];

    protected $casts = [
        'email_sent' => 'boolean',
        'resolved_at' => 'datetime',
        'email_sent_at' => 'datetime',
    ];

    /**
     * Get the user who submitted the contact request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin assigned to handle this request
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeAssignedTo($query, $adminId)
    {
        return $query->where('assigned_to', $adminId);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }

    /**
     * Helper methods
     */
    public function assignTo($adminId)
    {
        $this->update([
            'assigned_to' => $adminId,
            'status' => 'in_progress',
        ]);
    }

    public function markAsResolved($adminNotes = null)
    {
        $this->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'admin_notes' => $adminNotes,
        ]);
    }

    public function markAsClosed($adminNotes = null)
    {
        $this->update([
            'status' => 'closed',
            'admin_notes' => $adminNotes,
        ]);
    }

    public function markEmailAsSent($response = null)
    {
        $this->update([
            'email_sent' => true,
            'email_sent_at' => now(),
            'email_response' => $response,
        ]);
    }

    public function updatePriority($priority)
    {
        $this->update(['priority' => $priority]);
    }

    public function updateCategory($category)
    {
        $this->update(['category' => $category]);
    }

    /**
     * Accessors
     */
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'resolved' => 'green',
            'closed' => 'gray',
            default => 'gray',
        };
    }

    public function getPriorityBadgeColorAttribute()
    {
        return match($this->priority) {
            'low' => 'gray',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'gray',
        };
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('M j, Y g:i A');
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIsResolvedAttribute()
    {
        return in_array($this->status, ['resolved', 'closed']);
    }

    public function getIsAssignedAttribute()
    {
        return !is_null($this->assigned_to);
    }

    public function getResponseTimeAttribute()
    {
        if (!$this->resolved_at) {
            return null;
        }

        return $this->created_at->diffInHours($this->resolved_at);
    }
}
