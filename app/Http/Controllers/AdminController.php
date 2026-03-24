<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use App\Models\ContactRequest;
use App\Models\Chat;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Get all users
     */
    public function users(Request $request): JsonResponse
    {
        try {
            // Optimize with select only needed columns
            $query = User::select([
                'id', 'name', 'username', 'email', 'phone',
                'is_admin', 'is_seller', 'is_founder', 'banned', 'created_at'
            ]);

            // Filter by role
            if ($request->filled('role')) {
                switch ($request->role) {
                    case 'admin':
                        $query->where('is_admin', true);
                        break;
                    case 'seller':
                        $query->where('is_seller', true);
                        break;
                    case 'founder':
                        $query->where('is_founder', true);
                        break;
                }
            }

            // Filter by banned status
            if ($request->filled('banned')) {
                $query->where('banned', $request->banned === 'true');
            }

            // Search by name, username, or email
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            $query->withCount('properties')
                ->orderByRaw('is_founder DESC, is_admin DESC, is_seller DESC, created_at DESC');

            // Pagination (increased default to 50 for better UX)
            $perPage = $request->input('per_page', 50);
            $page = $request->input('page', 1);
            
            $total = $query->count();
            $users = $query->skip(($page - 1) * $perPage)
                ->take($perPage)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'is_admin' => $user->is_admin ?? false,
                        'is_seller' => $user->is_seller ?? false,
                        'is_founder' => $user->is_founder ?? false,
                        'banned' => $user->banned ?? false,
                        'created_at' => $user->created_at->toISOString(),
                        'properties_count' => $user->properties_count ?? 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users,
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => ceil($total / $perPage),
                    'from' => ($page - 1) * $perPage + 1,
                    'to' => min($page * $perPage, $total),
                ],
                'message' => 'Users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific user
     */
    public function showUser($id): JsonResponse
    {
        try {
            $user = User::withCount(['properties', 'sentChats', 'receivedChats', 'contactRequests'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'is_admin' => $user->is_admin ?? false,
                    'is_seller' => $user->is_seller ?? false,
                    'is_founder' => $user->is_founder ?? false,
                    'banned' => $user->banned ?? false,
                    'created_at' => $user->created_at->toISOString(),
                    'properties_count' => $user->properties_count ?? 0,
                    'sent_chats_count' => $user->sent_chats_count ?? 0,
                    'received_chats_count' => $user->received_chats_count ?? 0,
                    'contact_requests_count' => $user->contact_requests_count ?? 0,
                ],
                'message' => 'User retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ban a user
     */
   /**
 * Ban a user
 */
public function banUser(Request $request, $id): JsonResponse
{
    try {
        $admin = $request->user();
        $user = User::findOrFail($id);

        // Cannot ban founder
        if ($user->is_founder) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot ban founder'
            ], 403);
        }

        // Only founders can ban admins
        if ($user->is_admin && !$admin->is_founder) {
            return response()->json([
                'success' => false,
                'message' => 'Only founders can ban admins'
            ], 403);
        }

        $user->update([
            'banned' => true,
            'banned_at' => now(),
            'ban_reason' => $request->reason ?? 'Banned by admin'
        ]);

        // 🔥 CRITICAL: Revoke all tokens to force logout
        $user->tokens()->delete();

        // 🔥 Broadcast ban event (optional, for real-time notification)
        try {
            \Log::info('User banned', [
                'user_id' => $user->id,
                'username' => $user->username,
                'banned_by' => $admin->id
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to log ban event: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'User banned successfully',
            'data' => [
                'id' => $user->id,
                'banned' => true,
                'tokens_revoked' => true
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to ban user',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Unban a user
     */
    public function unbanUser($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $user->update([
                'banned' => false,
                'banned_at' => null,
                'ban_reason' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User unbanned successfully',
                'data' => [
                    'id' => $user->id,
                    'banned' => false
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to unban user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, $id): JsonResponse
    {
        try {
            $admin = $request->user();
            $user = User::findOrFail($id);

            // Only founders can assign founder role
            if ($request->is_founder && !$admin->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only founders can assign founder role'
                ], 403);
            }

            // Cannot remove founder role from founder (security)
            if ($user->is_founder && !$request->is_founder && !$admin->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only founders can remove founder role'
                ], 403);
            }

            $user->update([
                'is_admin' => $request->is_admin ?? $user->is_admin,
                'is_seller' => $request->is_seller ?? $user->is_seller,
                'is_founder' => $request->is_founder ?? $user->is_founder,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User role updated successfully',
                'data' => [
                    'id' => $user->id,
                    'is_admin' => $user->is_admin,
                    'is_seller' => $user->is_seller,
                    'is_founder' => $user->is_founder,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Promote user to admin (Founder only)
     */
    public function promoteToAdmin(Request $request, $id): JsonResponse
    {
        try {
            $admin = $request->user();

            // Only founders can promote to admin
            if (!$admin->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only founders can promote users to admin'
                ], 403);
            }

            $user = User::findOrFail($id);

            // Cannot promote founder
            if ($user->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a founder'
                ], 400);
            }

            // Cannot promote self
            if ($user->id === $admin->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot promote yourself'
                ], 400);
            }

            $user->update([
                'is_admin' => true,
                'is_seller' => true, // Admins can also be sellers
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User promoted to admin successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'is_admin' => true,
                    'is_seller' => true,
                    'is_founder' => false,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to promote user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Demote admin to regular user (Founder only)
     */
    public function demoteToUser(Request $request, $id): JsonResponse
    {
        try {
            $admin = $request->user();

            // Only founders can demote admins
            if (!$admin->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only founders can demote admins'
                ], 403);
            }

            $user = User::findOrFail($id);

            // Cannot demote founder
            if ($user->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot demote founder'
                ], 403);
            }

            // Cannot demote self
            if ($user->id === $admin->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot demote yourself'
                ], 400);
            }

            $user->update([
                'is_admin' => false,
                'is_seller' => true, // Keep seller status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin demoted to regular user successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'is_admin' => false,
                    'is_seller' => true,
                    'is_founder' => false,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to demote user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
 * Get properties by username
 */
public function propertiesByUsername(Request $request): JsonResponse
{
    try {
        $username = $request->input('username');
        
        if (!$username) {
            return response()->json([
                'success' => false,
                'message' => 'Username is required'
            ], 400);
        }

        // Find user by username (case-insensitive)
        $user = User::where('username', 'LIKE', $username)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Get all properties for this user
        $properties = Property::select([
            'id', 'title', 'description', 'price', 'governorate_id', 'city_id',
            'category', 'rent_or_buy', 'status', 'rejection_reason', 'bedrooms',
            'bathrooms', 'area', 'images', 'views_count', 'inquiries_count',
            'is_featured', 'is_active', 'needs_reapproval', 'user_id', 'created_at'
        ])
        ->where('user_id', $user->id)
        ->with([
            'governorate:id,name_en',
            'city:id,name_en'
        ])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($property) use ($user) {
            $images = $property->images;
            if (is_string($images)) {
                $images = json_decode($images, true) ?? [];
            } elseif (!is_array($images)) {
                $images = [];
            }
            
            return [
                'id' => $property->id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'location_governorate' => $property->governorate?->name_en ?? '',
                'location_city' => $property->city?->name_en ?? '',
                'category' => $property->category,
                'rent_or_buy' => $property->rent_or_buy,
                'status' => $property->status,
                'rejection_reason' => $property->rejection_reason,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'images' => $images,
                'views_count' => $property->views_count ?? 0,
                'inquiries_count' => $property->inquiries_count ?? 0,
                'is_featured' => $property->is_featured ?? false,
                'is_active' => $property->is_active ?? true,
                'needs_reapproval' => $property->needs_reapproval ?? false,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username ?? '',
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                ],
                'created_at' => $property->created_at->toISOString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $properties,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'properties_count' => $properties->count()
            ],
            'message' => "Found {$properties->count()} properties for user @{$user->username}"
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve properties',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Reset user password
     */
    public function resetUserPassword($id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Generate a random password
            $newPassword = Str::random(12);

            $user->update([
                'password' => Hash::make($newPassword)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully',
                'data' => [
                    'new_password' => $newPassword
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a password reset token that user can use to reset their password
     */
/**
 * Generate a password reset token and send email to user
 */
public function generatePasswordResetToken($id): JsonResponse
{
    try {
        $user = User::findOrFail($id);

        // Invalidate any existing tokens for this user
        PasswordResetToken::where('user_id', $id)
            ->where('expires_at', '>', now())
            ->where('used_at', null)
            ->update(['expires_at' => now()]);

        // Generate a unique token (8 alphanumeric characters for easy sharing)
        $token = strtoupper(Str::random(8));

        // Create new reset token (valid for 24 hours)
        $resetToken = PasswordResetToken::create([
            'user_id' => $id,
            'token' => $token,
            'expires_at' => now()->addHours(24),
        ]);

        // Build the reset link
        $resetLink = config('app.frontend_url') . '/reset-password?token=' . $token;

        // Send email to user
        try {
            \Mail::send('emails.password-reset', [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'resetLink' => $resetLink,
                'token' => $token,
                'expiresAt' => $resetToken->expires_at->format('F j, Y g:i A')
            ], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Password Reset Request - 3qaraty')
                    ->from('admin@3qaraty.icu', '3qaraty');
            });

            \Log::info('Password reset email sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'token' => $token
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to user email successfully',
                'data' => [
                    'token' => $token,
                    'expires_at' => $resetToken->expires_at->toISOString(),
                    'email_sent' => true,
                    'email' => $user->email
                ]
            ]);

        } catch (\Exception $mailException) {
            \Log::error('Failed to send password reset email', [
                'user_id' => $user->id,
                'error' => $mailException->getMessage()
            ]);

            // Return token even if email fails (admin can still copy link)
            return response()->json([
                'success' => true,
                'message' => 'Reset token generated, but email failed to send',
                'data' => [
                    'token' => $token,
                    'expires_at' => $resetToken->expires_at->toISOString(),
                    'email_sent' => false,
                    'error' => 'Email failed to send'
                ]
            ]);
        }

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to generate reset token',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Delete a user (founder only)
     */
    public function deleteUser(Request $request, $id): JsonResponse
    {
        try {
            $admin = $request->user();

            // Only founders can delete users
            if (!$admin->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only founders can delete users'
                ], 403);
            }

            $user = User::findOrFail($id);

            // Cannot delete founder
            if ($user->is_founder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete founder'
                ], 403);
            }

            // Delete user's data in correct order
            // 1. Delete chats (messages)
            \DB::table('chats')->where('sender_id', $user->id)->delete();
            \DB::table('chats')->where('receiver_id', $user->id)->delete();
            
            // 2. Delete contact requests
            \DB::table('contact_requests')->where('user_id', $user->id)->delete();
            
            // 3. Delete properties
            \DB::table('properties')->where('user_id', $user->id)->delete();
            
            // 4. Delete user
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Delete user error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all properties
     */
    public function properties(Request $request): JsonResponse
    {
        try {
            // Optimize with select only needed columns and eager loading
            $query = Property::select([
                'id', 'title', 'description', 'price', 'governorate_id', 'city_id',
                'category', 'rent_or_buy', 'status', 'rejection_reason', 'bedrooms',
                'bathrooms', 'area', 'images', 'views_count', 'inquiries_count',
                'is_featured', 'is_active', 'needs_reapproval', 'user_id', 'created_at'
            ])
            ->with([
                'user:id,name,username,email,phone',
                'governorate:id,name_en',
                'city:id,name_en'
            ]);

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Use pagination for better performance (default 100 items)
            $perPage = $request->get('per_page', 100);
            $properties = $query->orderBy('created_at', 'desc')
                ->limit($perPage)
                ->get()
                ->map(function ($property) {
                    // Ensure images is always an array
                    $images = $property->images;
                    if (is_string($images)) {
                        $images = json_decode($images, true) ?? [];
                    } elseif (!is_array($images)) {
                        $images = [];
                    }
                    
                    return [
                        'id' => $property->id,
                        'title' => $property->title,
                        'description' => $property->description,
                        'price' => $property->price,
                        'location_governorate' => $property->governorate?->name_en ?? '',
                        'location_city' => $property->city?->name_en ?? '',
                        'category' => $property->category,
                        'rent_or_buy' => $property->rent_or_buy,
                        'status' => $property->status,
                        'rejection_reason' => $property->rejection_reason,
                        'bedrooms' => $property->bedrooms,
                        'bathrooms' => $property->bathrooms,
                        'area' => $property->area,
                        'images' => $images,
                        'views_count' => $property->views_count ?? 0,
                        'inquiries_count' => $property->inquiries_count ?? 0,
                        'is_featured' => $property->is_featured ?? false,
                        'is_active' => $property->is_active ?? true,
                        'needs_reapproval' => $property->needs_reapproval ?? false,
                        'user' => [
                            'id' => $property->user->id,
                            'name' => $property->user->name,
                            'username' => $property->user->username ?? '',
                            'email' => $property->user->email,
                            'phone' => $property->user->phone ?? '',
                        ],
                        'created_at' => $property->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $properties,
                'message' => 'Properties retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending properties
     */
    public function pendingProperties(): JsonResponse
    {
        try {
            // Optimize with select only needed columns and eager loading
            $properties = Property::select([
                'id', 'title', 'description', 'price', 'governorate_id', 'city_id',
                'category', 'rent_or_buy', 'status', 'rejection_reason', 'bedrooms',
                'bathrooms', 'area', 'images', 'views_count', 'inquiries_count',
                'is_active', 'needs_reapproval', 'user_id', 'created_at'
            ])
                ->where('status', 'pending')
                ->with([
                    'user:id,name,username,email,phone',
                    'governorate:id,name_en',
                    'city:id,name_en'
                ])
                ->orderBy('created_at', 'desc')
                ->limit(100) // Prevent loading too many at once
                ->get()
                ->map(function ($property) {
                    return [
                        'id' => $property->id,
                        'title' => $property->title,
                        'description' => $property->description,
                        'price' => $property->price,
                        'location_governorate' => $property->governorate?->name_en ?? '',
                        'location_city' => $property->city?->name_en ?? '',
                        'category' => $property->category,
                        'rent_or_buy' => $property->rent_or_buy,
                        'status' => $property->status,
                        'rejection_reason' => $property->rejection_reason,
                        'bedrooms' => $property->bedrooms,
                        'bathrooms' => $property->bathrooms,
                        'area' => $property->area,
                        'images' => $property->images ?? [],
                        'views_count' => $property->views_count ?? 0,
                        'inquiries_count' => $property->inquiries_count ?? 0,
                        'is_active' => $property->is_active ?? true,
                        'needs_reapproval' => $property->needs_reapproval ?? false,
                        'user' => [
                            'id' => $property->user->id,
                            'name' => $property->user->name,
                            'username' => $property->user->username ?? '',
                            'email' => $property->user->email,
                            'phone' => $property->user->phone ?? '',
                        ],
                        'created_at' => $property->created_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $properties,
                'message' => 'Pending properties retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a property
     */
    public function approveProperty(Request $request, $id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            $admin = $request->user();

            $property->update([
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'needs_reapproval' => false, // Reset flag when approved
                'is_active' => true, // Automatically activate when approved
                'rejection_reason' => null, // Clear any previous rejection reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Property approved successfully',
                'data' => [
                    'id' => $property->id,
                    'status' => 'approved',
                    'is_active' => true
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a property
     */
    public function rejectProperty(Request $request, $id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);

            // Get rejection reason from either 'rejection_reason' or 'reason' field
            $rejectionReason = $request->input('rejection_reason') ?? $request->input('reason') ?? 'Rejected by admin';

            $property->update([
                'status' => 'rejected',
                'rejection_reason' => $rejectionReason,
                'approved_by' => auth()->id(),
                'approved_at' => null,
                'is_active' => false, // Deactivate rejected properties
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Property rejected successfully',
                'data' => [
                    'id' => $property->id,
                    'status' => 'rejected',
                    'rejection_reason' => $property->rejection_reason
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a property
     */
    public function deleteProperty($id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            $property->delete();

            return response()->json([
                'success' => true,
                'message' => 'Property deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'admin_users' => User::where('is_admin', true)->count(),
                'seller_users' => User::where('is_seller', true)->count(),
                'founder_users' => User::where('is_founder', true)->count(),
                'banned_users' => User::where('banned', true)->count(),
                'total_properties' => Property::count(),
                'pending_properties' => Property::where('status', 'pending')->count(),
                'approved_properties' => Property::where('status', 'approved')->count(),
                'rejected_properties' => Property::where('status', 'rejected')->count(),
                'total_chats' => Chat::count(),
                'unread_chats' => Chat::where('is_read', false)->count(),
                'total_contact_requests' => ContactRequest::count(),
                'pending_contact_requests' => ContactRequest::where('status', 'pending')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Dashboard statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function statistics(): JsonResponse
    {
        return $this->dashboard();
    }

    /**
     * Toggle property active status (Admin can toggle any property)
     */
    public function togglePropertyActive($id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            
            // Toggle is_active
            $property->is_active = !$property->is_active;
            $property->save();

            return response()->json([
                'success' => true,
                'message' => $property->is_active 
                    ? 'Property activated successfully' 
                    : 'Property deactivated successfully',
                'data' => [
                    'id' => $property->id,
                    'is_active' => $property->is_active
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle property status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
