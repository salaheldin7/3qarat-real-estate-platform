<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Get user profile by ID
     */
    public function show($id): JsonResponse
    {
        try {
            Log::info('Fetching user profile', ['user_id' => $id]);
            
            $user = User::find($id);
            
            if (!$user) {
                Log::warning('User not found', ['user_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            // Count user's approved properties
            $propertiesCount = Property::where('user_id', $id)
                ->where('status', 'approved')
                ->where('is_active', true)
                ->count();

            Log::info('User profile retrieved successfully', ['user_id' => $id, 'properties_count' => $propertiesCount]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username ?? null,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'role' => $user->role ?? 'user',
                    'created_at' => $user->created_at->toISOString(),
                    'properties_count' => $propertiesCount,
                ],
                'message' => 'User profile retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user profile', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user profile by username
     */
    public function showByUsername($username): JsonResponse
    {
        try {
            Log::info('Fetching user profile by username', ['username' => $username]);
            
            $user = User::where('username', $username)->first();
            
            if (!$user) {
                Log::warning('User not found by username', ['username' => $username]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            // Count user's approved properties
            $propertiesCount = Property::where('user_id', $user->id)
                ->where('status', 'approved')
                ->where('is_active', true)
                ->count();

            Log::info('User profile retrieved successfully', ['username' => $username, 'properties_count' => $propertiesCount]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username ?? null,
                    'email' => $user->email,
                    'phone' => $user->phone ?? null,
                    'role' => $user->role ?? 'user',
                    'created_at' => $user->created_at->toISOString(),
                    'properties_count' => $propertiesCount,
                ],
                'message' => 'User profile retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user profile by username', [
                'username' => $username,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
/**
 * Search users globally
 */
public function search(Request $request): JsonResponse
{
    try {
        $query = $request->get('query', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'users' => [],
                'message' => 'Please provide a search query'
            ]);
        }

        $currentUser = Auth::user();
        
        // Search users by name, username, email, or phone
        $users = User::where('id', '!=', $currentUser->id)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('phone', 'like', "%{$query}%");
            })
            ->limit(50) // Limit results to 50 users
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
                    'last_activity_at' => $user->last_activity_at ? $user->last_activity_at->toISOString() : null,
                    'last_seen_at' => $user->last_seen_at ? $user->last_seen_at->toISOString() : null,
                ];
            });

        return response()->json([
            'success' => true,
            'users' => $users,
            'total' => $users->count(),
        ]);

    } catch (\Exception $e) {
        \Log::error('User search error', [
            'error' => $e->getMessage(),
            'query' => $request->get('query'),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Failed to search users',
            'error' => $e->getMessage(),
            'users' => [],
        ], 500);
    }
}
    /**
     * Get all properties for a specific user by username
     */
    public function getUserPropertiesByUsername($username, Request $request): JsonResponse
    {
        try {
            Log::info('Fetching user properties by username', ['username' => $username]);
            
            $user = User::where('username', $username)->first();
            
            if (!$user) {
                Log::warning('User not found for properties', ['username' => $username]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            return $this->getUserProperties($user->id, $request);

        } catch (\Exception $e) {
            Log::error('Error fetching user properties by username', [
                'username' => $username,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all properties for a specific user
     */
    public function getUserProperties($id, Request $request): JsonResponse
    {
        try {
            Log::info('Fetching user properties', ['user_id' => $id]);
            
            $user = User::find($id);
            
            if (!$user) {
                Log::warning('User not found for properties', ['user_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            // Get user's favorite property IDs if authenticated
            $favoriteIds = [];
            if (Auth::check()) {
                try {
                    $favoriteIds = Auth::user()->favorites()->pluck('property_id')->toArray();
                } catch (\Exception $e) {
                    Log::warning('Could not fetch favorites', ['error' => $e->getMessage()]);
                    $favoriteIds = [];
                }
            }
            
            // Query properties
            $query = Property::select([
                'id', 'title', 'description', 'price', 'governorate_id', 'city_id',
                'category', 'rent_or_buy', 'status', 'bedrooms', 'bathrooms', 'area',
                'images', 'views_count', 'is_featured', 'is_active', 'user_id', 
                'furnished', 'has_parking', 'has_garden', 'has_pool', 'created_at', 'updated_at'
            ])
            ->where('user_id', $id)
            ->where('status', 'approved')
            ->where('is_active', true)
            ->whereNotIn('status', ['sold', 'rented']);

            // Try to load relationships, but continue if they fail
            try {
                $query->with([
                    'user:id,name,username,email,phone',
                    'governorate:id,name_en,name_ar',
                    'city:id,name_en,name_ar,governorate_id'
                ]);
            } catch (\Exception $e) {
                Log::warning('Could not load relationships', ['error' => $e->getMessage()]);
            }

            // Apply filters
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('rent_or_buy')) {
                $query->where('rent_or_buy', $request->rent_or_buy);
            }

            if ($request->filled('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }

            if ($request->filled('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            switch ($sortBy) {
                case 'price_low_high':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_high_low':
                    $query->orderBy('price', 'desc');
                    break;
                case 'date_old_new':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'date_new_old':
                    $query->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 12);
            $properties = $query->paginate($perPage);

            Log::info('Properties retrieved', ['count' => $properties->count()]);

            // Transform the data
            $properties->getCollection()->transform(function ($property) use ($favoriteIds) {
                return $this->transformProperty($property, false, $favoriteIds);
            });

            return response()->json([
                'success' => true,
                'data' => $properties,
                'message' => 'User properties retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user properties', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform property data for API response
     */
    private function transformProperty($property, $detailed = false, $favoriteIds = []): array
    {
        try {
            // Convert relative image paths to full URLs
            $images = $property->images ?? [];
            $baseUrl = config('app.url');
            
            $fullImageUrls = array_map(function($imagePath) use ($baseUrl) {
                if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
                    return $imagePath;
                }
                return $baseUrl . $imagePath;
            }, $images);

            // Safely get related data
            $governorate = null;
            $city = null;
            $user = null;
            
            try {
                $governorate = $property->governorate;
            } catch (\Exception $e) {
                Log::debug('Could not load governorate', ['error' => $e->getMessage()]);
            }
            
            try {
                $city = $property->city;
            } catch (\Exception $e) {
                Log::debug('Could not load city', ['error' => $e->getMessage()]);
            }
            
            try {
                $user = $property->user;
            } catch (\Exception $e) {
                Log::debug('Could not load user', ['error' => $e->getMessage()]);
            }

            $data = [
                'id' => $property->id,
                'slug' => $property->slug ?? '',
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'formatted_price' => number_format($property->price),
                'category' => $property->category,
                'rent_or_buy' => $property->rent_or_buy,
                'bedrooms' => $property->bedrooms,
                'bathrooms' => $property->bathrooms,
                'area' => $property->area,
                'main_image' => !empty($fullImageUrls) ? $fullImageUrls[0] : null,
                'images' => $fullImageUrls,
                'images_count' => count($fullImageUrls),
                'location' => $property->location ?? '',
                'location_governorate' => $governorate ? $governorate->name_en : '',
                'location_city' => $city ? $city->name_en : '',
                'governorate' => $governorate ? [
                    'id' => $governorate->id,
                    'name' => $governorate->name_en,
                ] : null,
                'city' => $city ? [
                    'id' => $city->id,
                    'name' => $city->name_en,
                ] : null,
                'status' => $property->status,
                'is_featured' => $property->is_featured ?? false,
                'is_active' => $property->is_active ?? true,
                'views_count' => $property->views_count ?? 0,
                'created_at' => $property->created_at ? $property->created_at->toISOString() : null,
                'updated_at' => $property->updated_at ? $property->updated_at->toISOString() : null,
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username ?? null,
                    'phone' => $user->phone ?? '',
                ] : null,
                'user_name' => $user ? $user->name : 'Unknown',
                'user_id' => $user ? $user->id : 0,
                'user_phone' => $user ? ($user->phone ?? '') : '',
                'is_favorited' => in_array($property->id, $favoriteIds),
            ];

            return $data;
            
        } catch (\Exception $e) {
            Log::error('Error transforming property', [
                'property_id' => $property->id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            // Return minimal data if transformation fails
            return [
                'id' => $property->id ?? 0,
                'title' => $property->title ?? 'Unknown',
                'error' => 'Failed to load property details'
            ];
        }
    }
}