<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Sitemap\SitemapGenerator;
use App\Http\Controllers\UserController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/check-username', [AuthController::class, 'checkUsername']);
Route::post('/reset-password-with-token', [AuthController::class, 'resetPasswordWithToken']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/send-verification-code', [AuthController::class, 'sendVerificationCode']);
Route::post('/auth/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/auth/register-with-verification', [AuthController::class, 'registerWithVerification']);

// Public property routes
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/featured', [PropertyController::class, 'featured']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);

// REMOVED DUPLICATE/INCORRECT ROUTES - Keep only LocationController routes below

// ⚠️ PUBLIC USER ROUTES - SPECIFIC ROUTES MUST COME FIRST
// Search route BEFORE any {id} routes
Route::get('/users/search', [UserController::class, 'search'])->middleware('auth:sanctum');
Route::get('/users/username/{username}', [UserController::class, 'showByUsername']);
Route::get('/users/username/{username}/properties', [UserController::class, 'getUserPropertiesByUsername']);
// Dynamic {id} routes LAST
Route::get('/users/{id}/properties', [UserController::class, 'getUserProperties']);
Route::get('/users/{id}', [UserController::class, 'show']);

// Public location routes - FIXED: All pointing to LocationController
Route::get('/governorates', [LocationController::class, 'governorates']);
Route::get('/governorates/{id}/cities', [LocationController::class, 'cities']);
Route::get('/governorates/{id}', [LocationController::class, 'governorateWithCities']);
Route::get('/cities', [LocationController::class, 'cities']);
Route::get('/locations/statistics', [LocationController::class, 'statistics']);
    Route::get('/properties/{id}/comments', [PropertyController::class, 'getComments']);
// Public contact route
Route::post('/contact', [ContactController::class, 'store']);

// Legacy public menu routes (for backward compatibility)
Route::get('/menu_items', [PropertyController::class, 'index']);
Route::get('/menu_items/{id}', [PropertyController::class, 'show']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/profile', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);

    // Property routes for authenticated users
    Route::get('/my-properties', [PropertyController::class, 'myProperties']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::match(['put', 'post'], '/properties/{id}', [PropertyController::class, 'update']);
    Route::delete('/properties/{id}', [PropertyController::class, 'destroy']);
    Route::post('/properties/{id}/toggle-active', [PropertyController::class, 'toggleActive']);

    // Favorite routes
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{propertyId}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{propertyId}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{propertyId}', [FavoriteController::class, 'check']);
  
    // Chat routes - SPECIFIC ROUTES FIRST
    Route::get('/chats/users', [ChatController::class, 'getChatUsers']);
    Route::get('/chats/unread', [ChatController::class, 'getUnreadChats']);
    Route::post('/chats/send', [ChatController::class, 'store']);
    Route::post('/chats/typing', [ChatController::class, 'broadcastTyping']);
    Route::post('/chats/activity', [ChatController::class, 'updateActivity']);
    Route::post('/chats/offline', [ChatController::class, 'setOffline']);
    Route::get('/chats/messages/{userId}', [ChatController::class, 'show']);
    Route::post('/chats/messages/{userId}/read', [ChatController::class, 'markMessagesAsRead']);
    Route::delete('/chats/conversation/{userId}', [ChatController::class, 'deleteConversation']);
    Route::delete('/chats/message/{messageId}', [ChatController::class, 'deleteMessage']);
    Route::get('/chats/status/{userId}', [ChatController::class, 'getUserStatus']);
    Route::get('/chats/property/{propertyId}', [ChatController::class, 'propertyChats']);
    Route::post('/properties/{id}/comments', [PropertyController::class, 'addComment']);
    Route::post('/properties/{propertyId}/comments/{commentId}/like', [PropertyController::class, 'toggleCommentLike']);
    Route::delete('/properties/{propertyId}/comments/{commentId}', [PropertyController::class, 'deleteComment']);
    
    // Legacy chat routes - AFTER specific routes
    Route::get('/chats/{userId}', [ChatController::class, 'show']);
    Route::get('/chats', [ChatController::class, 'index']);
    Route::post('/chats', [ChatController::class, 'store']);
    Route::put('/chats/{id}/read', [ChatController::class, 'markAsRead']);
    Route::delete('/chats/{id}', [ChatController::class, 'destroy']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}', [NotificationController::class, 'update']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Admin routes
    Route::middleware([AdminMiddleware::class])->prefix('admin')->group(function () {
        // User management
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::put('/users/{id}/ban', [AdminController::class, 'banUser']);
        Route::put('/users/{id}/unban', [AdminController::class, 'unbanUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::put('/users/{id}/promote', [AdminController::class, 'promoteToAdmin']);
        Route::put('/users/{id}/demote', [AdminController::class, 'demoteToUser']);
        Route::put('/users/{id}/reset-password', [AdminController::class, 'resetUserPassword']);
        Route::post('/users/{id}/generate-reset-token', [AdminController::class, 'generatePasswordResetToken']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // Property management
        Route::get('/properties', [AdminController::class, 'properties']);
        Route::get('/properties/pending', [AdminController::class, 'pendingProperties']);
        Route::post('/properties/{id}/approve', [AdminController::class, 'approveProperty']);
        Route::post('/properties/{id}/reject', [AdminController::class, 'rejectProperty']);
        Route::post('/properties/{id}/toggle-active', [AdminController::class, 'togglePropertyActive']);
        Route::put('/properties/{id}', [PropertyController::class, 'update']);
        Route::put('/properties/{id}/feature', [AdminController::class, 'featureProperty']);
        Route::put('/properties/{id}/sold', [AdminController::class, 'markPropertyAsSold']);
        Route::delete('/properties/{id}', [AdminController::class, 'deleteProperty']);
        Route::get('/properties/by-username', [AdminController::class, 'propertiesByUsername']);

        // Location management
        Route::post('/governorates', [LocationController::class, 'storeGovernorate']);
        Route::put('/governorates/{id}', [LocationController::class, 'updateGovernorate']);
        Route::delete('/governorates/{id}', [LocationController::class, 'destroyGovernorate']);
        Route::post('/cities', [LocationController::class, 'storeCity']);
        Route::put('/cities/{id}', [LocationController::class, 'updateCity']);
        Route::delete('/cities/{id}', [LocationController::class, 'destroyCity']);

        // Contact requests management
        Route::get('/contact-requests', [ContactController::class, 'index']);
        Route::get('/contact-requests/{id}', [ContactController::class, 'show']);
        Route::put('/contact-requests/{id}/assign', [ContactController::class, 'assign']);
        Route::put('/contact-requests/{id}/resolve', [ContactController::class, 'resolve']);
        Route::put('/contact-requests/{id}/reply', [ContactController::class, 'reply']);
        Route::delete('/contact-requests/{id}', [ContactController::class, 'destroy']);

        // Chat management
        Route::get('/chats/all', [ChatController::class, 'adminIndex']);
        Route::get('/chats/user/{userId}', [ChatController::class, 'userChats']);
        Route::get('/chats/conversation/{userId}/{otherUserId}', [ChatController::class, 'getUserConversation']);
        Route::delete('/chats/{id}/admin', [ChatController::class, 'adminDestroy']);

        // Dashboard statistics
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/statistics', [AdminController::class, 'statistics']);

        // Legacy admin routes
        Route::get('/menu_items', [AdminController::class, 'properties']);
        Route::apiResource('menu_items', PropertyController::class)->except(['index', 'show']);
    });
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
        'error' => 'The requested API endpoint does not exist'
    ], 404);
});