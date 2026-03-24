<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $query = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc');

            // Filter by read status if provided
            if ($request->filled('is_read')) {
                $query->where('is_read', $request->boolean('is_read'));
            }

            // Pagination
            $perPage = $request->get('per_page', 20);
            $notifications = $query->limit($perPage)->get();

            // Transform the data to match frontend expectations
            $transformedNotifications = $notifications->map(function ($notification) {
                return [
                    'id' => (string) $notification->id,
                    'message' => $notification->message,
                    'type' => $notification->type ?? 'general',
                    'is_read' => (bool) $notification->is_read,
                    'property_id' => $notification->property_id ? (string) $notification->property_id : null,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedNotifications,
                'message' => 'Notifications retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $notification = Notification::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update notification (for backward compatibility)
     */
    public function update(Request $request, $id): JsonResponse
    {
        return $this->markAsRead($id);
    }
}