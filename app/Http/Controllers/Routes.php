<?php

// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
    // Get all locations (governorates with cities) - This is what the admin panel expects
    Route::get('/locations', [LocationController::class, 'adminLocations']);
    
    // Create new governorate
    Route::post('/locations/governorates', [LocationController::class, 'storeGovernorate']);
    
    // Create city under specific governorate  
    Route::post('/locations/governorates/{governorateId}/cities', [LocationController::class, 'storeCityInGovernorate']);
    
    // Update/Delete operations (if you need them)
    Route::put('/locations/governorates/{id}', [LocationController::class, 'updateGovernorate']);
    Route::delete('/locations/governorates/{id}', [LocationController::class, 'destroyGovernorate']);
    Route::put('/locations/cities/{id}', [LocationController::class, 'updateCity']);
    Route::delete('/locations/cities/{id}', [LocationController::class, 'destroyCity']);
});

// Public location routes (for marketplace and forms)
Route::prefix('locations')->group(function () {
    // Get governorates
    Route::get('/governorates', [LocationController::class, 'governorates']);
    
    // Get cities (all or by governorate)
    Route::get('/cities/{governorateId?}', [LocationController::class, 'cities']);
    
    // Get specific governorate with its cities
    Route::get('/governorates/{id}/cities', [LocationController::class, 'governorateWithCities']);
    
    // Get location statistics
    Route::get('/statistics', [LocationController::class, 'statistics']);
});
// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public menu routes
Route::get('/menu_items', [MenuController::class, 'index']);
Route::get('/menu_items/{id}', [MenuController::class, 'show']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User routes
    Route::apiResource('bookings', BookingController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}', [NotificationController::class, 'update']);

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/bookings', [BookingController::class, 'adminIndex']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'update']);
        Route::apiResource('menu_items', MenuController::class)->except(['index', 'show']);
        Route::get('/menu_items', [MenuController::class, 'adminIndex']);
    });
});

// app/Http/Middleware/AdminMiddleware.php


use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json(['message' => 'Admin access required'], 403);
        }

        return $next($request);
    }
}

// Add to app/Http/Kernel.php in $routeMiddleware array:
// 'admin' => \App\Http\Middleware\AdminMiddleware::class,