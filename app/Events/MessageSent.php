<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Chat $chat)
    {
        $this->chat = $chat->load(['sender', 'receiver', 'property']);
        $this->message = [
            'id' => $chat->id,
            'message' => $chat->message,
            'message_type' => $chat->message_type,
            'attachment_path' => $chat->attachment_path,
            'sender' => [
                'id' => $chat->sender->id,
                'name' => $chat->sender->name,
                'username' => $chat->sender->username,
                'avatar' => $chat->sender->avatar,
                'is_admin' => $chat->sender->is_admin,
                'is_founder' => $chat->sender->is_founder,
            ],
            'receiver' => [
                'id' => $chat->receiver->id,
                'name' => $chat->receiver->name,
                'username' => $chat->receiver->username,
            ],
            'is_read' => $chat->is_read,
            'is_admin_message' => $chat->is_admin_message,
            'is_system_message' => $chat->is_system_message,
            'created_at' => $chat->created_at->toISOString(),
            'read_at' => $chat->read_at?->toISOString(),
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->chat->receiver_id),
            new PrivateChannel('chat.user.' . $this->chat->sender_id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return ['message' => $this->message];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
