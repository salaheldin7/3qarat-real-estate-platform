<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $typingUserId;
    public $receiverId;
    public $isTyping;
    public $userName;

    /**
     * Create a new event instance.
     */
    public function __construct($typingUserId, $receiverId, $isTyping, $userName)
    {
        $this->typingUserId = $typingUserId;
        $this->receiverId = $receiverId;
        $this->isTyping = $isTyping;
        $this->userName = $userName;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->receiverId),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'typing_user_id' => $this->typingUserId,
            'receiver_id' => $this->receiverId,
            'is_typing' => $this->isTyping,
            'user_name' => $this->userName,
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'user.typing';
    }
}
