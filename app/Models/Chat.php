<?php

namespace App\Models;

use App\Events\MessageRead;
use App\Events\MessageSent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'property_id',
        'message',
        'message_type',
        'attachment_path',
        'is_read',
        'read_at',
        'deleted_by_sender',
        'deleted_by_receiver',
        'is_admin_message',
        'is_system_message',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'deleted_by_sender' => 'boolean',
        'deleted_by_receiver' => 'boolean',
        'is_admin_message' => 'boolean',
        'is_system_message' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Events - Temporarily disabled to prevent 500 errors
     */
    // protected $dispatchesEvents = [
    //     'created' => MessageSent::class,
    // ];

    /**
     * Get the sender of the message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver of the message
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Get the property this chat is about
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Scopes
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeBetweenUsers($query, $user1Id, $user2Id)
    {
        return $query->where(function ($q) use ($user1Id, $user2Id) {
            $q->where(function ($subQ) use ($user1Id, $user2Id) {
                $subQ->where('sender_id', $user1Id)
                     ->where('receiver_id', $user2Id);
            })->orWhere(function ($subQ) use ($user1Id, $user2Id) {
                $subQ->where('sender_id', $user2Id)
                     ->where('receiver_id', $user1Id);
            });
        });
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)
              ->where('deleted_by_sender', false);
        })->orWhere(function ($q) use ($userId) {
            $q->where('receiver_id', $userId)
              ->where('deleted_by_receiver', false);
        });
    }

    public function scopeForProperty($query, $propertyId)
    {
        return $query->where('property_id', $propertyId);
    }

    public function scopeAdminMessages($query)
    {
        return $query->where('is_admin_message', true);
    }

    public function scopeSystemMessages($query)
    {
        return $query->where('is_system_message', true);
    }

    /**
     * Helper methods
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        
        // Broadcast the read event
        MessageRead::dispatch($this);
    }

    public function deleteForSender()
    {
        $this->update(['deleted_by_sender' => true]);
    }

    public function deleteForReceiver()
    {
        $this->update(['deleted_by_receiver' => true]);
    }

    public function isDeletedForUser($userId)
    {
        if ($this->sender_id == $userId) {
            return $this->deleted_by_sender;
        }
        
        if ($this->receiver_id == $userId) {
            return $this->deleted_by_receiver;
        }
        
        return false;
    }

    public function canBeDeletedPermanently()
    {
        return $this->deleted_by_sender && $this->deleted_by_receiver;
    }

    /**
     * Accessors
     */
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format('M j, Y g:i A');
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIsImageAttribute()
    {
        return $this->message_type === 'image';
    }

    public function getIsDocumentAttribute()
    {
        return $this->message_type === 'document';
    }

    public function getIsTextAttribute()
    {
        return $this->message_type === 'text';
    }
}
