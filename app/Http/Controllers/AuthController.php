<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PasswordResetToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    /**
     * Generate a unique random username
     */
    private function generateUniqueUsername($name = null)
    {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        do {
            $username = 'user';
            for ($i = 0; $i < 8; $i++) {
                $username .= $chars[rand(0, strlen($chars) - 1)];
            }
        } while (User::where('username', $username)->exists());
        
        return $username;
    }

    /**
     * Send verification code to email
     */
    public function sendVerificationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Generate 6-digit verification code
            $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Store code in cache for 10 minutes
            $cacheKey = 'verification_code_' . $request->email;
            Cache::put($cacheKey, $code, now()->addMinutes(10));

            // Send email
            Mail::send('emails.verification-code', [
                'name' => $request->name,
                'code' => $code
            ], function ($message) use ($request) {
                $message->to($request->email)
                    ->subject('Verify Your Email - 3qaraty');
                $message->from('admin@3qaraty.icu', '3qaraty');
            });

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the email code (separate endpoint)
     */
    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cacheKey = 'verification_code_' . $request->email;
            $storedCode = Cache::get($cacheKey);

            if (!$storedCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Verification code expired. Please request a new one.'
                ], 410);
            }

            if ($storedCode !== $request->code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code'
                ], 422);
            }

            // Mark as verified in cache (valid for 30 minutes)
            Cache::put('email_verified_' . $request->email, true, now()->addMinutes(30));

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register with email verification
     */
    public function registerWithVerification(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:50|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'verification_code' => 'required|string|size:6',
        ], [
            'username.unique' => 'This username is already taken.',
            'email.unique' => 'This email is already registered.',
            'email.required' => 'Email is required.',
            'phone.unique' => 'This phone number is already registered.',
            'phone.required' => 'Phone number is required.',
            'verification_code.required' => 'Verification code is required.',
            'verification_code.size' => 'Verification code must be 6 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if email was verified
            $verifiedKey = 'email_verified_' . $request->email;
            if (!Cache::get($verifiedKey)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email first'
                ], 422);
            }

            // Double-check the verification code
            $cacheKey = 'verification_code_' . $request->email;
            $storedCode = Cache::get($cacheKey);

            if (!$storedCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Verification code expired. Please request a new one.'
                ], 410);
            }

            if ($storedCode !== $request->verification_code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid verification code'
                ], 422);
            }

            // Code is valid, proceed with registration
            $username = $request->username ?: $this->generateUniqueUsername($request->name);

            $user = User::create([
                'name' => $request->name,
                'username' => $username,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'is_seller' => true,
                'is_admin' => false,
                'is_founder' => false,
                'banned' => false,
                'email_verified_at' => now(),
            ]);

            // Delete the verification codes from cache
            Cache::forget($cacheKey);
            Cache::forget($verifiedKey);

            // Send welcome email
            // Send welcome email
try {
    $userData = [
        'name' => $user->name,
        'username' => $user->username,
        'email' => $user->email
    ];
    
    Mail::send('emails.welcome', $userData, function ($message) use ($user) {
        $message->to($user->email)
            ->subject('Welcome to 3qaraty - Your Journey Starts Now! 🎉')
            ->from('admin@3qaraty.icu', '3qaraty');
    });
    
    \Log::info('Welcome email sent successfully', [
        'user_id' => $user->id,
        'email' => $user->email,
        'username' => $user->username
    ]);
} catch (\Exception $mailException) {
    \Log::error('Welcome email failed to send', [
        'user_id' => $user->id,
        'email' => $user->email,
        'error' => $mailException->getMessage(),
        'trace' => $mailException->getTraceAsString()
    ]);
}

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'is_admin' => $user->is_admin,
                    'is_seller' => $user->is_seller,
                    'is_founder' => $user->is_founder ?? false,
                    'banned' => $user->banned,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $loginField = null;
        $loginValue = null;

        if ($request->has('username')) {
            $loginField = 'username';
            $loginValue = $request->username;
        } elseif ($request->has('email')) {
            $loginField = 'email';
            $loginValue = $request->email;
        } elseif ($request->has('phone')) {
            $loginField = 'phone';
            $loginValue = $request->phone;
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Please provide username, email, or phone number'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            $loginField => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where($loginField, $loginValue)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            if ($user->banned || $user->is_banned) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account has been suspended. Please contact support.'
                ], 403);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
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
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
// Add this method to AuthController.php

/**
 * Send password reset link to user's email (Public endpoint - no auth required)
 */
public function forgotPassword(Request $request)
{
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No account found with this email address.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address'
            ], 404);
        }

        // Invalidate any existing tokens for this user
        PasswordResetToken::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->where('used_at', null)
            ->update(['expires_at' => now()]);

        // Generate a unique token (8 alphanumeric characters for easy sharing)
        $token = strtoupper(Str::random(8));

        // Create new reset token (valid for 24 hours)
        $resetToken = PasswordResetToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => now()->addHours(24),
        ]);

        // Build the reset link
        $resetLink = config('app.frontend_url', 'http://localhost:5173') . '/reset-password?token=' . $token;

        // Send email to user with the NEW template name
        try {
            Mail::send('emails.forget-password', [
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
                'message' => 'Password reset link has been sent to your email address'
            ]);

        } catch (\Exception $mailException) {
            \Log::error('Failed to send password reset email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $mailException->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset email. Please try again later.'
            ], 500);
        }

    } catch (\Exception $e) {
        \Log::error('Forgot password error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to process password reset request',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'success' => true,
                'user' => [
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
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('users')->ignore($user->id)
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id)
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'max:20',
                    Rule::unique('users')->ignore($user->id)
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            $updatedUser = [
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
            ];

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $updatedUser
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function checkUsername(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'available' => false,
                'message' => 'Invalid username format'
            ], 422);
        }

        $exists = User::where('username', $request->username)->exists();

        return response()->json([
            'success' => true,
            'available' => !$exists,
            'message' => $exists ? 'Username is already taken' : 'Username is available'
        ]);
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Password update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadAvatar(Request $request)
    {
        try {
            $user = $request->user();

            $validator = Validator::make($request->all(), [
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($user->avatar && file_exists(public_path($user->avatar))) {
                unlink(public_path($user->avatar));
            }

            $avatar = $request->file('avatar');
            $filename = time() . '_' . $user->id . '.' . $avatar->getClientOriginalExtension();
            $path = $avatar->move(public_path('uploads/avatars'), $filename);
            $avatarUrl = '/uploads/avatars/' . $filename;

            $user->update([
                'avatar' => $avatarUrl,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $avatarUrl
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Avatar upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserById($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'is_admin' => $user->is_admin ?? false,
                    'is_seller' => $user->is_seller ?? false,
                    'is_founder' => $user->is_founder ?? false,
                    'created_at' => $user->created_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get user',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // Add this method to your AuthController.php
// Place it after the getUserById method (around line 550)

    /**
     * Search for users globally (for chat functionality)
     * GET /api/users/search?query=username
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('query', '');
            
            // Minimum 2 characters required
            if (strlen($query) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Search query must be at least 2 characters',
                    'users' => []
                ], 422);
            }

            $currentUser = Auth::user();
            
            // Search users by username, name, email, or phone
            $users = User::where('id', '!=', $currentUser->id) // Exclude current user
                ->where(function($q) use ($query) {
                    $q->where('username', 'like', "%{$query}%")
                      ->orWhere('name', 'like', "%{$query}%")
                      ->orWhere('email', 'like', "%{$query}%")
                      ->orWhere('phone', 'like', "%{$query}%");
                })
                ->where('banned', false) // Exclude banned users
                ->limit(20) // Limit results to 20 users
                ->get()
                ->map(function ($user) {
                    // Check if user is online (last activity within 5 minutes)
                    $isOnline = $user->is_online && 
                                $user->last_activity_at && 
                                $user->last_activity_at->diffInMinutes(now()) < 5;

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'avatar' => $user->avatar,
                        'is_admin' => $user->is_admin ?? false,
                        'is_founder' => $user->is_founder ?? false,
                        'is_online' => $isOnline,
                        'last_seen_at' => $user->last_seen_at ? $user->last_seen_at->toISOString() : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'users' => $users,
                'count' => $users->count(),
            ]);

        } catch (\Exception $e) {
            \Log::error('User search error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to search users',
                'error' => $e->getMessage(),
                'users' => []
            ], 500);
        }
    }

    public function resetPasswordWithToken(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string|exists:password_reset_tokens,token',
                'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
            ], [
                'token.exists' => 'Invalid or expired reset token.',
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $resetToken = PasswordResetToken::with('user')
                ->where('token', $request->token)
                ->first();

            if (!$resetToken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid reset token'
                ], 404);
            }

            if (!$resetToken->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reset token is expired or has already been used'
                ], 410);
            }

            $user = $resetToken->user;
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            $resetToken->markAsUsed();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}