<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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
    Route::put('/user', [AuthController::class, 'updateProfile']);

    // User routes
    Route::apiResource('bookings', BookingController::class);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}', [NotificationController::class, 'update']);

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/bookings', [BookingController::class, 'adminIndex']);
        Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
        Route::apiResource('menu_items', MenuController::class)->except(['index', 'show']);
        Route::get('/menu_items', [MenuController::class, 'adminIndex']);
    });
});