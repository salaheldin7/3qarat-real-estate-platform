<?php

namespace App\Http\Controllers;

use App\Events\UserTyping;
use App\Models\Chat;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    /**
     * Get list of users the current user has chatted with
     */
    public function getChatUsers(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $isAdmin = $user->is_admin || $user->is_founder;
            
            // Get unique users from chats
            $chatUserIds = Chat::forUser($user->id)
                ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id', [$user->id])
                ->distinct()
                ->pluck('other_user_id');

            $users = User::whereIn('id', $chatUserIds)
                ->get()
                ->map(function ($otherUser) use ($user, $isAdmin) {
                    // Get last message - show all for admins, hide deleted for regular users
                    $lastMessageQuery = Chat::betweenUsers($user->id, $otherUser->id);
                    
                    if (!$isAdmin) {
                        // Regular users: hide deleted messages
                        $lastMessageQuery->where(function($query) use ($user) {
                            $query->where(function($q) use ($user) {
                                $q->where('sender_id', $user->id)
                                  ->where('deleted_by_sender', false);
                            })->orWhere(function($q) use ($user) {
                                $q->where('receiver_id', $user->id)
                                  ->where('deleted_by_receiver', false);
                            });
                        });
                    }
                    
                    $lastMessage = $lastMessageQuery->orderBy('created_at', 'desc')->first();

                    // Count unread messages (excluding deleted for receiver)
                    $unreadCount = Chat::where('receiver_id', $user->id)
                        ->where('sender_id', $otherUser->id)
                        ->where('is_read', false)
                        ->where('deleted_by_receiver', false)
                        ->count();

                    // FIX: Check if OTHER USER is online (last activity within 5 minutes)
                    $isOnline = $otherUser->last_activity_at && 
                        $otherUser->last_activity_at->diffInMinutes(now()) < 5;

                    return [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'username' => $otherUser->username,
                        'email' => $otherUser->email, // Added for search
                        'phone' => $otherUser->phone, // Added for search
                        'avatar' => $otherUser->avatar,
                        'is_admin' => $otherUser->is_admin ?? false,
                        'is_founder' => $otherUser->is_founder ?? false,
                        'is_online' => $isOnline, // This should be for the other user, not current user
                        'last_seen_at' => $otherUser->last_seen_at ? $otherUser->last_seen_at->toISOString() : null,
                        'last_activity_at' => $otherUser->last_activity_at ? $otherUser->last_activity_at->toISOString() : null, // Add this for frontend
                        'last_message' => $lastMessage ? [
                            'message' => $lastMessage->message,
                            'created_at' => $lastMessage->created_at->toISOString(),
                            'read' => $lastMessage->is_read,
                            'is_deleted' => $isAdmin ? ($lastMessage->deleted_by_sender || $lastMessage->deleted_by_receiver) : false,
                        ] : null,
                        'unread_count' => $unreadCount,
                    ];
                })
                ->sortByDesc(function ($user) {
                    return $user['last_message'] ? $user['last_message']['created_at'] : '';
                })
                ->values();

            return response()->json([
                'success' => true,
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get chat users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all messages from a user as read
     */
    public function markMessagesAsRead(Request $request, $userId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Validate that the user exists
            if (!User::find($userId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }
            
            $updatedCount = Chat::where('receiver_id', $user->id)
                ->where('sender_id', $userId)
                ->where('is_read', false)
                ->where('deleted_by_receiver', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read',
                'updated_count' => $updatedCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark messages as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chat messages between current user and another user
     */
    public function show(Request $request, $userId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Validate that the user exists
            $otherUser = User::find($userId);
            if (!$otherUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }
            
            $propertyId = $request->get('property_id');
            
            // Get messages between the two users using betweenUsers scope
            $query = Chat::betweenUsers($user->id, $userId)
                ->where(function($q) use ($user) {
                    // Don't show messages deleted by current user
                    $q->where(function($subQ) use ($user) {
                        $subQ->where('sender_id', $user->id)
                             ->where('deleted_by_sender', false);
                    })->orWhere(function($subQ) use ($user) {
                        $subQ->where('receiver_id', $user->id)
                             ->where('deleted_by_receiver', false);
                    });
                })
                ->with(['sender', 'receiver', 'property'])
                ->orderBy('created_at', 'asc');

            if ($propertyId) {
                $query->where('property_id', $propertyId);
            }

            $messages = $query->get()->map(function ($chat) {
                return [
                    'id' => $chat->id,
                    'sender_id' => $chat->sender_id,
                    'receiver_id' => $chat->receiver_id,
                    'message' => $chat->message,
                    'message_type' => $chat->message_type ?? 'text',
                    'attachment_path' => $chat->attachment_path,
                    'sender' => $chat->sender ? [
                        'id' => $chat->sender->id,
                        'name' => $chat->sender->name,
                        'username' => $chat->sender->username,
                    ] : null,
                    'receiver' => $chat->receiver ? [
                        'id' => $chat->receiver->id,
                        'name' => $chat->receiver->name,
                        'username' => $chat->receiver->username,
                    ] : null,
                    'property' => $chat->property ? [
                        'id' => $chat->property->id,
                        'title' => $chat->property->title,
                        'slug' => $chat->property->slug,
                    ] : null,
                    'is_read' => $chat->is_read,
                    'read_at' => $chat->read_at,
                    'created_at' => $chat->created_at->toISOString(),
                ];
            });

            // Mark unread messages as read
            Chat::where('receiver_id', $user->id)
                ->where('sender_id', $userId)
                ->where('is_read', false)
                ->where('deleted_by_receiver', false)
                ->when($propertyId, function ($query) use ($propertyId) {
                    return $query->where('property_id', $propertyId);
                })
                ->update(['is_read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'data' => $messages,
                'message' => 'Chat messages retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve chat messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a new message
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $validator = Validator::make($request->all(), [
                'receiver_id' => 'required|integer|exists:users,id|different:' . $user->id,
                'message' => 'required_without:attachment|string|max:1000',
                'property_id' => 'nullable|exists:properties,id',
                'message_type' => 'nullable|in:text,image,document',
                'attachment' => 'nullable|file|max:10240', // 10MB max
            ], [
                'receiver_id.different' => 'You cannot send messages to yourself',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if receiver exists
            $receiver = User::find($request->receiver_id);
            if (!$receiver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Receiver not found'
                ], 404);
            }
            
            // Check if receiver is banned (if method exists)
            if (method_exists($receiver, 'isBanned') && $receiver->isBanned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot send message to banned user'
                ], 403);
            }

            // Check if sender is banned (if method exists)
            if (method_exists($user, 'isBanned') && $user->isBanned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Banned users cannot send messages'
                ], 403);
            }

            $messageType = $request->get('message_type', 'text');
            $attachmentPath = null;

            // Handle file attachment
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $messageType = $this->getMessageTypeFromFile($file);
                $attachmentPath = $file->store('chat_attachments', 'public');
            }

            // Create the chat message with only essential fields
            $chatData = [
                'sender_id' => $user->id,
                'receiver_id' => $request->receiver_id,
                'message' => $request->message ?? '',
                'message_type' => $messageType,
                'is_read' => false,
            ];

            // Add optional fields only if they exist in fillable
            if ($request->property_id) {
                $chatData['property_id'] = $request->property_id;
            }

            if ($attachmentPath) {
                $chatData['attachment_path'] = Storage::url($attachmentPath);
            }

            // Try to add soft delete fields if they exist
            try {
                $chatData['deleted_by_sender'] = false;
                $chatData['deleted_by_receiver'] = false;
            } catch (\Exception $e) {
                // Ignore if columns don't exist
            }

            // Try to add admin message flag if method exists
            if (method_exists($user, 'isAdmin')) {
                try {
                    $chatData['is_admin_message'] = $user->isAdmin();
                } catch (\Exception $e) {
                    // Ignore if column doesn't exist
                }
            }

            $chat = Chat::create($chatData);

            // Load only essential relationships
            try {
                $chat->load(['sender', 'receiver']);
                
                // Load property only if property_id exists
                if (isset($chatData['property_id'])) {
                    $chat->load('property');
                }
            } catch (\Exception $e) {
                // If relationships fail, continue without them
                \Log::error('Error loading chat relationships: ' . $e->getMessage());
            }

            // Increment inquiries count if this is about a property
            if ($request->property_id) {
                try {
                    $property = Property::find($request->property_id);
                    if ($property && method_exists($property, 'incrementInquiries')) {
                        $property->incrementInquiries();
                    }
                } catch (\Exception $e) {
                    // Log but don't fail the request
                    \Log::warning('Failed to increment property inquiries', [
                        'property_id' => $request->property_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Return the message with basic structure - ALWAYS return success=true here
            $responseData = [
                'success' => true,
                'data' => [
                    'id' => $chat->id,
                    'sender_id' => $chat->sender_id,
                    'receiver_id' => $chat->receiver_id,
                    'message' => $chat->message,
                    'message_type' => $chat->message_type,
                    'attachment_path' => $chat->attachment_path,
                    'is_read' => $chat->is_read ?? false,
                    'created_at' => $chat->created_at ? $chat->created_at->toISOString() : now()->toISOString(),
                ]
            ];

            // Add relationship data if available
            try {
                if ($chat->sender) {
                    $responseData['data']['sender'] = [
                        'id' => $chat->sender->id,
                        'name' => $chat->sender->name ?? '',
                        'username' => $chat->sender->username ?? '',
                    ];
                }

                if ($chat->receiver) {
                    $responseData['data']['receiver'] = [
                        'id' => $chat->receiver->id,
                        'name' => $chat->receiver->name ?? '',
                        'username' => $chat->receiver->username ?? '',
                    ];
                }

                if ($chat->property) {
                    $responseData['data']['property'] = [
                        'id' => $chat->property->id,
                        'title' => $chat->property->title ?? '',
                        'slug' => $chat->property->slug ?? '',
                    ];
                }
            } catch (\Exception $e) {
                \Log::error('Error building response data: ' . $e->getMessage());
            }

            // Log the response for debugging
            \Log::info('Chat message sent successfully', [
                'chat_id' => $chat->id,
                'sender_id' => $user->id,
                'receiver_id' => $request->receiver_id,
            ]);

            return response()->json($responseData, 201);

        } catch (\Exception $e) {
            // Log the full error for debugging
            \Log::error('Failed to send chat message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'receiver_id' => $request->receiver_id ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to determine message type from file
     */
    private function getMessageTypeFromFile($file): string
    {
        $mimeType = $file->getMimeType();
        
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }
        
        return 'document';
    }

    /**
     * Delete all messages between current user and another user
     * Uses soft delete by marking messages as deleted for the user
     */
    public function deleteConversation(Request $request, $userId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Validate that the user exists
            $otherUser = User::find($userId);
            if (!$otherUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }
            
            // Soft delete: Mark messages as deleted for current user
            $deletedCount = 0;
            
            // Messages sent by current user
            $deletedCount += Chat::where('sender_id', $user->id)
                ->where('receiver_id', $userId)
                ->update(['deleted_by_sender' => true]);
            
            // Messages received by current user
            $deletedCount += Chat::where('sender_id', $userId)
                ->where('receiver_id', $user->id)
                ->update(['deleted_by_receiver' => true]);
            
            // DON'T permanently delete - keep for admin access
            // Chats are never permanently deleted, only marked as deleted by both users

            return response()->json([
                'success' => true,
                'message' => 'Conversation deleted successfully',
                'deleted_count' => $deletedCount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a specific message (only if sender)
     * Uses soft delete by marking as deleted for sender
     */
    public function deleteMessage(Request $request, $messageId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $message = Chat::find($messageId);
            
            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message not found'
                ], 404);
            }
            
            // Only sender can delete their own message
            if ($message->sender_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete your own messages'
                ], 403);
            }
            
            // Soft delete for sender only - never permanently delete
            $message->update(['deleted_by_sender' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete message',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread chats for notification badge
     */
    public function getUnreadChats(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Get all users who have sent unread messages to this user
            $unreadChats = Chat::where('receiver_id', $user->id)
                ->where('is_read', false)
                ->where('deleted_by_receiver', false)
                ->with(['sender'])
                ->get()
                ->groupBy('sender_id')
                ->map(function ($messages, $senderId) {
                    $lastMessage = $messages->sortByDesc('created_at')->first();
                    $unreadCount = $messages->count();
                    
                    return [
                        'id' => $lastMessage->sender->id,
                        'name' => $lastMessage->sender->name,
                        'username' => $lastMessage->sender->username,
                        'avatar' => $lastMessage->sender->avatar ?? null,
                        'last_message' => [
                            'message' => $lastMessage->message,
                            'created_at' => $lastMessage->created_at->toISOString(),
                        ],
                        'unread_count' => $unreadCount,
                        'is_admin' => $lastMessage->sender->is_admin ?? false,
                        'is_founder' => $lastMessage->sender->is_founder ?? false,
                    ];
                })
                ->values();
            
            // Calculate total unread count
            $totalUnread = Chat::where('receiver_id', $user->id)
                ->where('is_read', false)
                ->where('deleted_by_receiver', false)
                ->count();

            return response()->json([
                'success' => true,
                'chats' => $unreadChats,
                'total_unread' => $totalUnread,
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to get unread chats', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread chats',
                'chats' => [],
                'total_unread' => 0,
            ], 500);
        }
    }

    /**
     * Update user's online status and activity
     */
    public function updateActivity(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $user->update([
                'is_online' => true,
                'last_activity_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activity updated',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update activity',
            ], 500);
        }
    }

    /**
     * Set user offline
     */
    public function setOffline(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $user->update([
                'is_online' => false,
                'last_seen_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated to offline',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
            ], 500);
        }
    }

    /**
     * Get user's online status
     */
    public function getUserStatus(Request $request, $userId): JsonResponse
    {
        try {
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Consider user online if last activity was within 5 minutes
            $isOnline = $user->last_activity_at && 
                $user->last_activity_at->diffInMinutes(now()) < 5;

            return response()->json([
                'success' => true,
                'is_online' => $isOnline,
                'last_seen_at' => $user->last_seen_at ? $user->last_seen_at->toISOString() : null,
                'last_activity_at' => $user->last_activity_at ? $user->last_activity_at->toISOString() : null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user status',
            ], 500);
        }
    }

    /**
     * Admin: Get all chats overview (for admin panel)
     * Shows ALL users with chat activity, including deleted conversations
     */
    public function adminIndex(Request $request): JsonResponse
    {
        try {
            $search = $request->get('search', '');
            
            // Get all unique user IDs from chats
            $userIds = Chat::selectRaw('DISTINCT sender_id as user_id')
                ->union(
                    Chat::selectRaw('DISTINCT receiver_id as user_id')
                )
                ->pluck('user_id')
                ->unique();
            
            // Get users
            $userQuery = User::whereIn('id', $userIds);
            
            // Apply search filter
            if ($search) {
                $userQuery->where(function($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%")
                      ->orWhere('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }
            
            $users = $userQuery->get()->map(function($user) {
                // Count ALL chats for this user (including deleted)
                $totalChats = Chat::where(function($query) use ($user) {
                        $query->where('sender_id', $user->id)
                              ->orWhere('receiver_id', $user->id);
                    })
                    ->count();
                    
                // Count conversations (unique users)
                $conversationCount = Chat::where(function($query) use ($user) {
                        $query->where('sender_id', $user->id)
                              ->orWhere('receiver_id', $user->id);
                    })
                    ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id', [$user->id])
                    ->distinct()
                    ->count();
                    
                // Get last chat activity
                $lastChat = Chat::where(function($query) use ($user) {
                        $query->where('sender_id', $user->id)
                              ->orWhere('receiver_id', $user->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->first();
                    
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar ?? null,
                    'is_admin' => $user->is_admin ?? false,
                    'is_founder' => $user->is_founder ?? false,
                    'total_chats' => $totalChats,
                    'conversation_count' => $conversationCount,
                    'last_activity' => $lastChat ? $lastChat->created_at->toISOString() : null,
                ];
            });
            
            return response()->json([
                'success' => true,
                'users' => $users->sortByDesc('last_activity')->values(),
                'total' => $users->count(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Admin chat index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch chats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all chats for a specific user (including deleted ones)
     */
    public function userChats(Request $request, $userId): JsonResponse
    {
        try {
            $user = User::find($userId);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Get ALL chat users this user has talked to (chats are never permanently deleted)
            $chatUserIds = Chat::where(function($query) use ($userId) {
                    $query->where('sender_id', $userId)
                          ->orWhere('receiver_id', $userId);
                })
                ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id', [$userId])
                ->distinct()
                ->pluck('other_user_id');

            $chatUsers = User::whereIn('id', $chatUserIds)
                ->get()
                ->map(function ($otherUser) use ($userId) {
                    // Get last message (all messages are kept in DB)
                    $lastMessage = Chat::where(function($query) use ($userId, $otherUser) {
                            $query->where('sender_id', $userId)
                                  ->where('receiver_id', $otherUser->id);
                        })
                        ->orWhere(function($query) use ($userId, $otherUser) {
                            $query->where('sender_id', $otherUser->id)
                                  ->where('receiver_id', $userId);
                        })
                        ->orderBy('created_at', 'desc')
                        ->first();

                    // Count total messages (all messages)
                    $totalMessages = Chat::where(function($query) use ($userId, $otherUser) {
                            $query->where('sender_id', $userId)
                                  ->where('receiver_id', $otherUser->id);
                        })
                        ->orWhere(function($query) use ($userId, $otherUser) {
                            $query->where('sender_id', $otherUser->id)
                                  ->where('receiver_id', $userId);
                        })
                        ->count();

                    // FIX: Check if OTHER USER is online
                    $isOnline = $otherUser->last_activity_at && 
                        $otherUser->last_activity_at->diffInMinutes(now()) < 5;

                    return [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'username' => $otherUser->username,
                        'avatar' => $otherUser->avatar ?? null,
                        'is_admin' => $otherUser->is_admin ?? false,
                        'is_founder' => $otherUser->is_founder ?? false,
                        'is_online' => $isOnline,
                        'last_seen_at' => $otherUser->last_seen_at ? $otherUser->last_seen_at->toISOString() : null,
                        'last_activity_at' => $otherUser->last_activity_at ? $otherUser->last_activity_at->toISOString() : null,
                        'last_message' => $lastMessage ? [
                            'message' => $lastMessage->message,
                            'created_at' => $lastMessage->created_at->toISOString(),
                            'is_deleted' => false,
                        ] : null,
                        'total_messages' => $totalMessages,
                    ];
                })
                ->sortByDesc(function ($user) {
                    return $user['last_message'] ? $user['last_message']['created_at'] : '';
                })
                ->values();

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                ],
                'chat_users' => $chatUsers,
                'total_conversations' => $chatUsers->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching user chats', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user chats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all messages between two users (including deleted ones)
     */
    public function getUserConversation(Request $request, $userId, $otherUserId): JsonResponse
    {
        try {
            $user = User::find($userId);
            $otherUser = User::find($otherUserId);
            
            if (!$user || !$otherUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            // Get ALL messages between the two users (chats are never permanently deleted)
            $messages = Chat::where(function($query) use ($userId, $otherUserId) {
                    $query->where('sender_id', $userId)
                          ->where('receiver_id', $otherUserId);
                })
                ->orWhere(function($query) use ($userId, $otherUserId) {
                    $query->where('sender_id', $otherUserId)
                          ->where('receiver_id', $userId);
                })
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($chat) use ($userId) {
                    return [
                        'id' => $chat->id,
                        'sender_id' => $chat->sender_id,
                        'receiver_id' => $chat->receiver_id,
                        'message' => $chat->message,
                        'message_type' => $chat->message_type ?? 'text',
                        'attachment_path' => $chat->attachment_path,
                        'sender' => $chat->sender ? [
                            'id' => $chat->sender->id,
                            'name' => $chat->sender->name,
                            'username' => $chat->sender->username,
                        ] : null,
                        'receiver' => $chat->receiver ? [
                            'id' => $chat->receiver->id,
                            'name' => $chat->receiver->name,
                            'username' => $chat->receiver->username,
                        ] : null,
                        'is_read' => $chat->is_read,
                        'read_at' => $chat->read_at,
                        'created_at' => $chat->created_at->toISOString(),
                        'deleted_by_sender' => $chat->deleted_by_sender ?? false,
                        'deleted_by_receiver' => $chat->deleted_by_receiver ?? false,
                        'is_deleted' => ($chat->deleted_by_sender && $chat->deleted_by_receiver),
                    ];
                });

            // FIX: Check if OTHER USER is online
            $isOtherUserOnline = $otherUser->last_activity_at && 
                $otherUser->last_activity_at->diffInMinutes(now()) < 5;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                ],
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'is_online' => $isOtherUserOnline,
                    'last_seen_at' => $otherUser->last_seen_at ? $otherUser->last_seen_at->toISOString() : null,
                    'last_activity_at' => $otherUser->last_activity_at ? $otherUser->last_activity_at->toISOString() : null,
                ],
                'messages' => $messages,
                'total_messages' => $messages->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching user conversation', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'other_user_id' => $otherUserId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch conversation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}