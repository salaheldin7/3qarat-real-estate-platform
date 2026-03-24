<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Get user's favorite properties
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get favorites with property details
            $favorites = $user->favoriteProperties()
                ->with([
                    'user:id,name,username,phone',
                    'governorate:id,name_en,name_ar',
                    'city:id,name_en,name_ar,governorate_id'
                ])
                ->where('is_active', true)
                ->where('status', 'approved')
                ->paginate($request->get('per_page', 12));

            // Transform the data
            $favorites->getCollection()->transform(function ($property) {
                return $this->transformProperty($property);
            });

            return response()->json([
                'success' => true,
                'data' => $favorites,
                'message' => 'Favorites retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add property to favorites
     */
    public function store(Request $request, $propertyId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Check if property exists
            $property = Property::findOrFail($propertyId);
            
            // Check if user owns this property
            if ($property->user_id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot favorite your own property'
                ], 400);
            }
            
            // Check if already favorited
            $existing = Favorite::where('user_id', $user->id)
                ->where('property_id', $propertyId)
                ->first();
                
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property already in favorites'
                ], 400);
            }
            
            // Add to favorites
            Favorite::create([
                'user_id' => $user->id,
                'property_id' => $propertyId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Property added to favorites'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add to favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove property from favorites
     */
    public function destroy($propertyId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $favorite = Favorite::where('user_id', $user->id)
                ->where('property_id', $propertyId)
                ->first();
                
            if (!$favorite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property not in favorites'
                ], 404);
            }
            
            $favorite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Property removed from favorites'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove from favorites',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if property is favorited by user
     */
    public function check($propertyId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $isFavorited = Favorite::where('user_id', $user->id)
                ->where('property_id', $propertyId)
                ->exists();

            return response()->json([
                'success' => true,
                'is_favorited' => $isFavorited
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check favorite status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transform property data for API response
     */
    private function transformProperty($property): array
    {
        $images = $property->images ?? [];
        $baseUrl = config('app.url'); // Always use production URL from .env
        
        $fullImageUrls = array_map(function($imagePath) use ($baseUrl) {
            if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
                return $imagePath;
            }
            return $baseUrl . $imagePath;
        }, $images);

        $governorate = $property->governorate ?? null;
        $city = $property->city ?? null;
        $user = $property->user ?? null;

        return [
            'id' => $property->id,
            'slug' => $property->slug ?? '',
            'title' => $property->title,
            'description' => $property->description,
            'price' => $property->price,
            'formatted_price' => $property->formatted_price ?? number_format($property->price),
            'category' => $property->category,
            'rent_or_buy' => $property->rent_or_buy,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'area' => $property->area,
            'main_image' => !empty($fullImageUrls) ? $fullImageUrls[0] : null,
            'images' => $fullImageUrls,
            'images_count' => count($fullImageUrls),
            'location_governorate' => $governorate ? $governorate->name_en : '',
            'location_city' => $city ? $city->name_en : '',
            'governorate' => $governorate ? [
                'id' => $governorate->id,
                'name' => $governorate->getLocalizedName(),
            ] : null,
            'city' => $city ? [
                'id' => $city->id,
                'name' => $city->getLocalizedName(),
            ] : null,
            'status' => $property->status,
            'is_featured' => $property->is_featured ?? false,
            'views_count' => $property->views_count ?? 0,
            'created_at' => $property->created_at ? $property->created_at->toISOString() : null,
            'updated_at' => $property->updated_at ? $property->updated_at->toISOString() : null,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone ?? '',
            ] : null,
            'user_name' => $user ? $user->name : 'Unknown',
            'user_id' => $user ? $user->id : 0,
            'user_phone' => $user ? $user->phone ?? '' : '',
            'is_favorited' => true, // Always true for favorite list
        ];
    }
}
