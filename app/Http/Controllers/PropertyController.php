<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Governorate;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    /**
     * Constructor - Apply auth middleware selectively
     */
    public function __construct()
    {
        // Public routes (no auth required)
        $this->middleware('auth:sanctum')->except([
            'index',
            'show',
            'featured',
            'getComments' // Make this public so anyone can view comments
        ]);
    }

    /**
     * Display a listing of properties for marketplace
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get user's favorite property IDs if authenticated
            $favoriteIds = [];
            if ($user) {
                $favoriteIds = $user->favorites()->pluck('property_id')->toArray();
            }
            
            // Optimize with select only needed columns
            $query = Property::select([
                'id', 'title', 'description', 'price', 'governorate_id', 'city_id',
                'category', 'rent_or_buy', 'status', 'bedrooms', 'bathrooms', 'area',
                'images', 'views_count', 'is_featured', 'is_active', 'user_id', 
                'furnished', 'has_parking', 'has_garden', 'has_pool', 'created_at'
            ])
            ->with([
                'user:id,name,username,email,phone',
                'governorate:id,name_en,name_ar',
                'city:id,name_en,name_ar,governorate_id'
            ])
            ->approved()
            ->where('is_active', true)
            ->where('status', '!=', 'sold')
            ->where('status', '!=', 'rented');

            // Apply filters
            if ($request->filled('governorate_id')) {
                $query->where('governorate_id', $request->governorate_id);
            }

            if ($request->filled('city_id')) {
                $query->where('city_id', $request->city_id);
            }

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

            if ($request->filled('bedrooms')) {
                $query->where('bedrooms', '>=', $request->bedrooms);
            }

            if ($request->filled('bathrooms')) {
                $query->where('bathrooms', '>=', $request->bathrooms);
            }

            if ($request->filled('furnished')) {
                $query->where('furnished', $request->boolean('furnished'));
            }

            if ($request->filled('has_parking')) {
                $query->where('has_parking', $request->boolean('has_parking'));
            }

            if ($request->filled('has_garden')) {
                $query->where('has_garden', $request->boolean('has_garden'));
            }

            if ($request->filled('has_pool')) {
                $query->where('has_pool', $request->boolean('has_pool'));
            }

            // Search by title or description
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
                case 'views':
                    $query->orderBy('views_count', 'desc');
                    break;
                case 'featured':
                    $query->orderBy('is_featured', 'desc')
                          ->orderBy('created_at', 'desc');
                    break;
                default:
                    $query->orderBy($sortBy, $sortOrder);
            }

            // Pagination
            $perPage = $request->get('per_page', 12);
            $properties = $query->paginate($perPage);

            // Transform the data
            $properties->getCollection()->transform(function ($property) use ($favoriteIds) {
                return $this->transformProperty($property, false, $favoriteIds);
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
     * Get comments for a property (Public - No auth required to view)
     * 
     * 
     */
     public function getComments($id): JsonResponse
{
    try {
        $property = Property::findOrFail($id);
        
        // Get current user - use auth() helper instead of Auth facade for better debugging
        $currentUser = auth('sanctum')->user();
        $currentUserId = $currentUser ? $currentUser->id : null;
        
        \Log::info('Get Comments Debug', [
            'property_id' => $id,
            'property_user_id' => $property->user_id,
            'current_user_id' => $currentUserId,
            'current_user_email' => $currentUser ? $currentUser->email : null,
            'is_authenticated' => $currentUser !== null,
            'is_admin' => $currentUser ? $currentUser->isAdmin() : false,
            'role' => $currentUser ? $currentUser->role : null
        ]);
        
        $comments = \DB::table('property_comments')
            ->join('users', 'property_comments.user_id', '=', 'users.id')
            ->where('property_comments.property_id', $id)
            ->orderBy('property_comments.created_at', 'desc')
            ->select([
                'property_comments.id',
                'property_comments.user_id',
                'users.name as user_name',
                'users.username',
                'property_comments.rating',
                'property_comments.comment',
                'property_comments.likes',
                'property_comments.created_at'
            ])
            ->get()
            ->map(function ($comment) use ($currentUserId, $property, $currentUser) {
                // Default to false
                $canDelete = false;
                
                // Only calculate if user is authenticated
                if ($currentUser !== null && $currentUserId !== null) {
                    // Cast to int for comparison
                    $commentUserId = (int)$comment->user_id;
                    $propertyUserId = (int)$property->user_id;
                    $currentUserIdInt = (int)$currentUserId;
                    
                    // Check conditions
                    $isCommentAuthor = $commentUserId === $currentUserIdInt;
                    $isPropertyOwner = $propertyUserId === $currentUserIdInt;
                    $isAdmin = $currentUser->isAdmin();
                    $isFounder = $currentUser->role === 'founder';
                    
                    // User can delete if they are: comment author, property owner, admin, or founder
                    $canDelete = $isCommentAuthor || $isPropertyOwner || $isAdmin || $isFounder;
                    
                    \Log::info('Comment Delete Permission', [
                        'comment_id' => $comment->id,
                        'comment_user_id' => $commentUserId,
                        'property_user_id' => $propertyUserId,
                        'current_user_id' => $currentUserIdInt,
                        'is_comment_author' => $isCommentAuthor,
                        'is_property_owner' => $isPropertyOwner,
                        'is_admin' => $isAdmin,
                        'is_founder' => $isFounder,
                        'can_delete' => $canDelete
                    ]);
                }
                
                return [
                    'id' => (string)$comment->id,
                    'userId' => (string)$comment->user_id,
                    'userName' => $comment->user_name,
                    'userAvatar' => strtoupper(substr($comment->user_name, 0, 2)),
                    'rating' => (int)$comment->rating,
                    'comment' => $comment->comment,
                    'timestamp' => $comment->created_at,
                    'likes' => (int)($comment->likes ?? 0),
                    'canDelete' => $canDelete
                ];
            });

        $averageRating = \DB::table('property_comments')
            ->where('property_id', $id)
            ->avg('rating') ?? 0;
        
        $totalComments = \DB::table('property_comments')
            ->where('property_id', $id)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'comments' => $comments,
                'averageRating' => round($averageRating, 1),
                'totalComments' => $totalComments
            ],
            'message' => 'Comments retrieved successfully'
        ]);

    } catch (\Exception $e) {
        \Log::error('Get Comments Error', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve comments',
            'error' => $e->getMessage()
        ], 500);
    }
}
/**
     * Add a comment (Requires authentication)
     */
    public function addComment(Request $request, $id): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $property = Property::findOrFail($id);
            $user = $request->user();

            // Check if user already commented on this property
            $existingComment = \DB::table('property_comments')
                ->where('property_id', $id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingComment) {
                // Update existing comment
                \DB::table('property_comments')
                    ->where('id', $existingComment->id)
                    ->update([
                        'rating' => $request->rating,
                        'comment' => $request->comment,
                        'updated_at' => now()
                    ]);

                $commentId = $existingComment->id;
            } else {
                // Insert new comment
                $commentId = \DB::table('property_comments')->insertGetId([
                    'property_id' => $id,
                    'user_id' => $user->id,
                    'rating' => $request->rating,
                    'comment' => $request->comment,
                    'likes' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Update property average rating
            $averageRating = \DB::table('property_comments')
                ->where('property_id', $id)
                ->avg('rating');
            
            $totalComments = \DB::table('property_comments')
                ->where('property_id', $id)
                ->count();

            $property->update([
                'average_rating' => $averageRating,
                'total_comments' => $totalComments
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => [
                    'id' => $commentId,
                    'averageRating' => round($averageRating, 1),
                    'totalComments' => $totalComments
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add comment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a comment (by comment owner, property owner, admin, or founder)
     */
   public function deleteComment(Request $request, $propertyId, $commentId): JsonResponse
{
    try {
        $user = $request->user();
        
        // Find the property
        $property = Property::findOrFail($propertyId);
        
        // Find the comment
        $comment = \DB::table('property_comments')
            ->where('id', $commentId)
            ->where('property_id', $propertyId)
            ->first();

        if (!$comment) {
            return response()->json([
                'success' => false,
                'message' => 'Comment not found'
            ], 404);
        }

        // Check if user can delete: comment owner, property owner, admin, or founder
        $canDelete = $comment->user_id == $user->id || 
                     $property->user_id == $user->id || 
                     $user->isAdmin() ||
                     $user->role === 'founder';

        if (!$canDelete) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete this comment'
            ], 403);
        }

        // Delete the comment (this will also delete related likes due to cascade)
        \DB::table('property_comments')->where('id', $commentId)->delete();

        // Update property average rating and total comments
        $averageRating = \DB::table('property_comments')
            ->where('property_id', $propertyId)
            ->avg('rating') ?? 0;
        
        $totalComments = \DB::table('property_comments')
            ->where('property_id', $propertyId)
            ->count();

        $property->update([
            'average_rating' => $averageRating,
            'total_comments' => $totalComments
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully',
            'data' => [
                'averageRating' => round($averageRating, 1),
                'totalComments' => $totalComments
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete comment',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Like/Unlike a comment (Requires authentication)
     */
    public function toggleCommentLike(Request $request, $propertyId, $commentId): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Check if user already liked this comment
            $existingLike = \DB::table('property_comment_likes')
                ->where('comment_id', $commentId)
                ->where('user_id', $user->id)
                ->first();

            if ($existingLike) {
                // Unlike
                \DB::table('property_comment_likes')
                    ->where('id', $existingLike->id)
                    ->delete();
                
                \DB::table('property_comments')
                    ->where('id', $commentId)
                    ->decrement('likes');
                
                $liked = false;
            } else {
                // Like
                \DB::table('property_comment_likes')->insert([
                    'comment_id' => $commentId,
                    'user_id' => $user->id,
                    'created_at' => now()
                ]);
                
                \DB::table('property_comments')
                    ->where('id', $commentId)
                    ->increment('likes');
                
                $liked = true;
            }

            $likes = \DB::table('property_comments')
                ->where('id', $commentId)
                ->value('likes') ?? 0;

            return response()->json([
                'success' => true,
                'message' => $liked ? 'Comment liked' : 'Comment unliked',
                'data' => [
                    'liked' => $liked,
                    'likes' => $likes
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle like',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created property
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'governorate_id' => 'required|exists:governorates,id',
                'city_id' => 'required|exists:cities,id',
                'category' => 'required|in:villa,land,townhouse,apartment,building,commercial',
                'rent_or_buy' => 'required|in:rent,buy',
                'bedrooms' => 'nullable|integer|min:0',
                'bathrooms' => 'nullable|integer|min:0',
                'area' => 'nullable|numeric|min:0',
                'floor_number' => 'nullable|integer|min:0',
                'total_floors' => 'nullable|integer|min:1',
                'built_year' => 'nullable|integer|min:1900|max:' . date('Y'),
                'furnished' => 'boolean',
                'has_parking' => 'boolean',
                'has_garden' => 'boolean',
                'has_pool' => 'boolean',
                'has_elevator' => 'boolean',
                'address' => 'nullable|string|max:500',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'video_url' => 'nullable|url',
                'features' => 'nullable|array',
                'features.*' => 'string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            if (!$user->isSeller() && !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only sellers can create properties'
                ], 403);
            }

            if ($request->hasFile('images')) {
                $images = $request->file('images');
                $imageCount = is_array($images) ? count($images) : 1;
                
                if ($imageCount > 10) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Maximum 10 images allowed',
                        'errors' => ['images' => ['You can upload maximum 10 images']]
                    ], 422);
                }
            }

            $imagePaths = [];
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                
                if (!is_array($images)) {
                    $images = [$images];
                }
                
                foreach ($images as $image) {
                    $path = $image->store('properties', 'public');
                    $imagePaths[] = Storage::url($path);
                }
            }

            $property = Property::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'governorate_id' => $request->governorate_id,
                'city_id' => $request->city_id,
                'category' => $request->category,
                'rent_or_buy' => $request->rent_or_buy,
                'bedrooms' => $request->bedrooms,
                'bathrooms' => $request->bathrooms,
                'area' => $request->area,
                'floor_number' => $request->floor_number,
                'total_floors' => $request->total_floors,
                'built_year' => $request->built_year,
                'furnished' => $request->boolean('furnished'),
                'has_parking' => $request->boolean('has_parking'),
                'has_garden' => $request->boolean('has_garden'),
                'has_pool' => $request->boolean('has_pool'),
                'has_elevator' => $request->boolean('has_elevator'),
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'images' => $imagePaths,
                'video_url' => $request->video_url,
                'features' => $request->features ?? [],
                'status' => ($user->isAdmin() || $user->role === 'founder') ? 'approved' : 'pending',
                'is_active' => ($user->isAdmin() || $user->role === 'founder') ? true : false,
            ]);

            $property->load(['user', 'governorate', 'city']);

            return response()->json([
                'success' => true,
                'data' => $this->transformProperty($property),
                'message' => 'Property created successfully and is pending approval'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified property
     */
    public function show($id): JsonResponse
    {
        try {
            $property = Property::with(['user', 'governorate', 'city'])
                ->where('id', $id)
                ->orWhere('slug', $id)
                ->first();

            if (!$property) {
                return response()->json([
                    'success' => false,
                    'message' => 'Property not found'
                ], 404);
            }

            if ($property->status === 'approved' && $property->is_active) {
                $property->incrementViews();
            }

            return response()->json([
                'success' => true,
                'data' => $this->transformProperty($property, true),
                'message' => 'Property retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified property
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            $user = Auth::user();

            if ($property->user_id !== $user->id && !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this property'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'price' => 'sometimes|required|numeric|min:0',
                'governorate_id' => 'sometimes|required|exists:governorates,id',
                'city_id' => 'sometimes|required|exists:cities,id',
                'category' => 'sometimes|required|in:villa,land,townhouse,apartment,building,commercial',
                'rent_or_buy' => 'sometimes|required|in:rent,buy',
                'bedrooms' => 'nullable|integer|min:0',
                'bathrooms' => 'nullable|integer|min:0',
                'area' => 'nullable|numeric|min:0',
                'floor_number' => 'nullable|integer|min:0',
                'total_floors' => 'nullable|integer|min:1',
                'built_year' => 'nullable|integer|min:1900|max:' . date('Y'),
                'furnished' => 'boolean',
                'has_parking' => 'boolean',
                'has_garden' => 'boolean',
                'has_pool' => 'boolean',
                'has_elevator' => 'boolean',
                'address' => 'nullable|string|max:500',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'images' => 'nullable|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'existing_images' => 'nullable|json',
                'video_url' => 'nullable|url',
                'features' => 'nullable|array',
                'features.*' => 'string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $currentImages = $property->images ?? [];
            $finalImages = [];

            if ($request->has('existing_images')) {
                $existingImagesJson = $request->input('existing_images');
                $existingImageUrls = json_decode($existingImagesJson, true);
                
                if (!is_array($existingImageUrls)) {
                    $existingImageUrls = [];
                }
                
                $normalizedKeepUrls = array_map(function($url) {
                    $url = preg_replace('#^https?://[^/]+#', '', $url);
                    $url = str_replace('/storage/', '', $url);
                    return ltrim($url, '/');
                }, $existingImageUrls);
                
                foreach ($currentImages as $currentImage) {
                    $normalizedCurrent = preg_replace('#^https?://[^/]+#', '', $currentImage);
                    $normalizedCurrent = str_replace('/storage/', '', $normalizedCurrent);
                    $normalizedCurrent = ltrim($normalizedCurrent, '/');
                    
                    if (in_array($normalizedCurrent, $normalizedKeepUrls)) {
                        $finalImages[] = $currentImage;
                    } else {
                        $path = str_replace('/storage/', '', $currentImage);
                        $appUrl = config('app.url');
                        $path = str_replace($appUrl . '/storage/', '', $path);
                        $path = str_replace($appUrl, '', $path);
                        $path = ltrim($path, '/');
                        
                        try {
                            if (Storage::disk('public')->exists($path)) {
                                Storage::disk('public')->delete($path);
                            }
                        } catch (\Exception $e) {
                            \Log::error('Failed to delete image', ['path' => $path, 'error' => $e->getMessage()]);
                        }
                    }
                }
            } else {
                $finalImages = $currentImages;
            }

            if ($request->hasFile('images')) {
                $newImages = $request->file('images');
                
                if (!is_array($newImages)) {
                    $newImages = [$newImages];
                }
                
                if (count($finalImages) + count($newImages) > 10) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Maximum 10 images allowed',
                        'errors' => ['images' => ['Total images would exceed maximum of 10']]
                    ], 422);
                }
                
                foreach ($newImages as $image) {
                    $path = $image->store('properties', 'public');
                    $imageUrl = Storage::url($path);
                    $finalImages[] = $imageUrl;
                }
            }

            $updateData = $request->only([
                'title', 'description', 'price', 'governorate_id', 'city_id',
                'category', 'rent_or_buy', 'bedrooms', 'bathrooms', 'area',
                'floor_number', 'total_floors', 'built_year', 'address',
                'latitude', 'longitude', 'video_url', 'features'
            ]);

            if ($request->has('furnished')) {
                $updateData['furnished'] = $request->boolean('furnished');
            }
            if ($request->has('has_parking')) {
                $updateData['has_parking'] = $request->boolean('has_parking');
            }
            if ($request->has('has_garden')) {
                $updateData['has_garden'] = $request->boolean('has_garden');
            }
            if ($request->has('has_pool')) {
                $updateData['has_pool'] = $request->boolean('has_pool');
            }
            if ($request->has('has_elevator')) {
                $updateData['has_elevator'] = $request->boolean('has_elevator');
            }
            
            $updateData['images'] = $finalImages;

            $needsReapproval = false;
            $significantFields = ['title', 'description', 'price', 'category', 'rent_or_buy', 'governorate_id', 'city_id'];
            
            foreach ($significantFields as $field) {
                if ($request->has($field) && $property->$field != $request->$field) {
                    $needsReapproval = true;
                    break;
                }
            }
            
            if (count($currentImages) != count($finalImages) || $request->hasFile('images')) {
                $needsReapproval = true;
            }

            if ($property->status === 'approved' && $needsReapproval && !$user->isAdmin() && $user->role !== 'founder') {
                $updateData['status'] = 'pending';
                $updateData['needs_reapproval'] = true;
                $updateData['is_active'] = false;
            }
            
            if ($property->status === 'rejected') {
                $updateData['status'] = 'pending';
                $updateData['rejection_reason'] = null;
                $updateData['needs_reapproval'] = false;
            }

            $property->update($updateData);
            $property->load(['user', 'governorate', 'city']);

            return response()->json([
                'success' => true,
                'data' => $this->transformProperty($property),
                'message' => 'Property updated successfully' . ($needsReapproval && !$user->isAdmin() ? ' and submitted for re-approval' : '')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update property',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified property
     */
    public function destroy($id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            $user = Auth::user();

            if ($property->user_id !== $user->id && !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this property'
                ], 403);
            }

            foreach ($property->images ?? [] as $image) {
                $path = str_replace('/storage/', '', $image);
                $appUrl = config('app.url');
                $path = str_replace($appUrl . '/storage/', '', $path);
                $path = str_replace($appUrl, '', $path);
                $path = ltrim($path, '/');
                
                Storage::disk('public')->delete($path);
            }

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
     * Get user's properties (for seller panel)
     */
    public function myProperties(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $query = Property::with(['governorate', 'city'])
                ->where('user_id', $user->id);

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 10);
            $properties = $query->paginate($perPage);

            $properties->getCollection()->transform(function ($property) {
                return $this->transformProperty($property);
            });

            return response()->json([
                'success' => true,
                'data' => $properties,
                'message' => 'User properties retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get featured properties
     */
    public function featured(): JsonResponse
    {
        try {
            $properties = Property::with(['user', 'governorate', 'city'])
                ->approved()
                ->featured()
                ->limit(6)
                ->get();

            $transformedProperties = $properties->map(function ($property) {
                return $this->transformProperty($property);
            });

            return response()->json([
                'success' => true,
                'data' => $transformedProperties,
                'message' => 'Featured properties retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve featured properties',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle property active status (for property owners)
     */
    public function toggleActive($id): JsonResponse
    {
        try {
            $property = Property::findOrFail($id);
            
            if ($property->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You can only toggle your own properties'
                ], 403);
            }

            if (!$property->is_active) {
                if ($property->needs_reapproval && $property->status === 'approved') {
                    $property->status = 'pending';
                    $property->needs_reapproval = false;
                    $property->is_active = true;
                    $property->save();

                    return response()->json([
                        'success' => true,
                        'message' => 'Property submitted for re-approval',
                        'data' => [
                            'id' => $property->id,
                            'is_active' => $property->is_active,
                            'status' => $property->status,
                            'needs_approval' => true
                        ]
                    ]);
                }
            }

            $property->is_active = !$property->is_active;
            $property->save();

            return response()->json([
                'success' => true,
                'message' => $property->is_active 
                    ? 'Property activated successfully' 
                    : 'Property deactivated successfully',
                'data' => [
                    'id' => $property->id,
                    'is_active' => $property->is_active,
                    'status' => $property->status
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

    /**
     * Transform property data for API response
     */
    private function transformProperty($property, $detailed = false, $favoriteIds = []): array
    {
        $images = $property->images ?? [];
        $baseUrl = config('app.url');
        
        $fullImageUrls = array_map(function($imagePath) use ($baseUrl) {
            if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
                return $imagePath;
            }
            return $baseUrl . $imagePath;
        }, $images);

        $governorate = $property->governorate ?? null;
        $city = $property->city ?? null;
        $user = $property->user ?? null;

        $data = [
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
            'location' => $property->location ?? '',
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
            'is_active' => $property->is_active ?? true,
            'views_count' => $property->views_count ?? 0,
            'inquiries_count' => $property->inquiries_count ?? 0,
            'rejection_reason' => $property->rejection_reason,
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
            'is_favorited' => in_array($property->id, $favoriteIds),
        ];

        if ($detailed) {
            $data = array_merge($data, [
                'description' => $property->description,
                'floor_number' => $property->floor_number ?? null,
                'total_floors' => $property->total_floors ?? null,
                'built_year' => $property->built_year ?? null,
                'furnished' => $property->furnished ?? false,
                'has_parking' => $property->has_parking ?? false,
                'has_garden' => $property->has_garden ?? false,
                'has_pool' => $property->has_pool ?? false,
                'has_elevator' => $property->has_elevator ?? false,
                'address' => $property->address ?? '',
                'latitude' => $property->latitude ?? null,
                'longitude' => $property->longitude ?? null,
                'images' => $fullImageUrls,
                'video_url' => $property->video_url ?? null,
                'features' => $property->features ?? [],
                'inquiries_count' => $property->inquiries_count ?? 0,
                'seller' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username ?? '',
                    'phone' => $user->phone ?? '',
                ] : null,
            ]);

            if ($property->status === 'rejected') {
                $data['rejection_reason'] = $property->rejection_reason;
            }
        }

        return $data;
    }
}