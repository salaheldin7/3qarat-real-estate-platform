<?php

namespace App\Http\Controllers;

use App\Models\Governorate;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    /**
     * Get all governorates
     */

public function adminLocations(Request $request): JsonResponse
{
    try {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $locale = $request->get('locale', app()->getLocale());
        
        $governorates = Governorate::with(['cities' => function ($query) {
            $query->orderBy('name_en');
        }])
        ->orderBy('name_en')
        ->get()
        ->map(function ($governorate) use ($locale) {
            return [
                'id' => $governorate->id,
                'name' => $governorate->getLocalizedName($locale),
                'name_en' => $governorate->name_en,
                'name_ar' => $governorate->name_ar,
                'code' => $governorate->code,
                'cities' => $governorate->cities->map(function ($city) use ($locale) {
                    return [
                        'id' => $city->id,
                        'name' => $city->getLocalizedName($locale),
                        'name_en' => $city->name_en,
                        'name_ar' => $city->name_ar,
                        'code' => $city->code,
                        'governorate_id' => $city->governorate_id,
                        'properties_count' => $city->properties()->approved()->count(),
                    ];
                }),
                'cities_count' => $governorate->cities()->count(),
                'properties_count' => $governorate->properties()->approved()->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $governorates,
            'governorates' => $governorates, // Admin panel might expect this key
            'message' => 'Locations retrieved successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve locations',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Admin: Create city under specific governorate
 */
public function storeCityInGovernorate(Request $request, $governorateId): JsonResponse
{
    try {
        $user = Auth::user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        // Verify governorate exists
        $governorate = Governorate::findOrFail($governorateId);

        $validator = Validator::make($request->all(), [
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'code' => 'nullable|string|max:10',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate city names within the same governorate
        $existingCity = City::where('governorate_id', $governorateId)
            ->where(function ($query) use ($request) {
                $query->where('name_en', $request->name_en)
                      ->orWhere('name_ar', $request->name_ar);
            })
            ->first();

        if ($existingCity) {
            return response()->json([
                'success' => false,
                'message' => 'A city with this name already exists in the selected governorate'
            ], 422);
        }

        $city = City::create([
            'governorate_id' => $governorateId,
            'name_en' => $request->name_en,
            'name_ar' => $request->name_ar,
            'code' => $request->code,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $city->load('governorate');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $city->id,
                'governorate_id' => $city->governorate_id,
                'name_en' => $city->name_en,
                'name_ar' => $city->name_ar,
                'code' => $city->code,
                'is_active' => $city->is_active,
                'governorate' => [
                    'id' => $city->governorate->id,
                    'name_en' => $city->governorate->name_en,
                    'name_ar' => $city->governorate->name_ar,
                ],
            ],
            'message' => 'City created successfully'
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create city',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function governorates(Request $request): JsonResponse
    {
        try {
            $locale = $request->get('locale', app()->getLocale());
            
            // Optimize with select only needed columns and withCount instead of count() calls
            $governorates = Governorate::select(['id', 'name_en', 'name_ar', 'code', 'is_active'])
                ->active()
                ->withCount(['cities' => function($query) {
                    $query->where('is_active', true);
                }])
                ->orderBy('name_en')
                ->get()
                ->map(function ($governorate) use ($locale) {
                    return [
                        'id' => $governorate->id,
                        'name' => $governorate->getLocalizedName($locale),
                        'name_en' => $governorate->name_en,
                        'name_ar' => $governorate->name_ar,
                        'code' => $governorate->code,
                        'cities_count' => $governorate->cities_count ?? 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $governorates,
                'message' => 'Governorates retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve governorates',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cities by governorate
     */
    public function cities(Request $request, $governorateId = null): JsonResponse
    {
        try {
            $locale = $request->get('locale', app()->getLocale());
            
            // Optimize with select only needed columns
            $query = City::select(['id', 'governorate_id', 'name_en', 'name_ar', 'code', 'is_active'])
                ->with('governorate:id,name_en,name_ar')
                ->active();
            
            if ($governorateId) {
                $query->where('governorate_id', $governorateId);
            }
            
            $cities = $query->orderBy('name_en')
                ->get()
                ->map(function ($city) use ($locale) {
                    return [
                        'id' => $city->id,
                        'governorate_id' => $city->governorate_id,
                        'name' => $city->getLocalizedName($locale),
                        'name_en' => $city->name_en,
                        'name_ar' => $city->name_ar,
                        'code' => $city->code,
                        'governorate' => $city->governorate ? [
                            'id' => $city->governorate->id,
                            'name' => $city->governorate->getLocalizedName($locale),
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $cities,
                'message' => 'Cities retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific governorate with its cities
     */
    public function governorateWithCities(Request $request, $id): JsonResponse
    {
        try {
            $locale = $request->get('locale', app()->getLocale());
            
            $governorate = Governorate::with(['activeCities' => function ($query) {
                $query->orderBy('name_en');
            }])->findOrFail($id);

            $data = [
                'id' => $governorate->id,
                'name' => $governorate->getLocalizedName($locale),
                'name_en' => $governorate->name_en,
                'name_ar' => $governorate->name_ar,
                'code' => $governorate->code,
                'cities' => $governorate->activeCities->map(function ($city) use ($locale) {
                    return [
                        'id' => $city->id,
                        'name' => $city->getLocalizedName($locale),
                        'name_en' => $city->name_en,
                        'name_ar' => $city->name_ar,
                        'code' => $city->code,
                        'properties_count' => $city->properties()->approved()->count(),
                    ];
                }),
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Governorate with cities retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve governorate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Create a new governorate
     */
    public function storeGovernorate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name_en' => 'required|string|max:255|unique:governorates,name_en',
                'name_ar' => 'required|string|max:255|unique:governorates,name_ar',
                'code' => 'nullable|string|max:10|unique:governorates,code',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $governorate = Governorate::create([
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', true),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $governorate->id,
                    'name_en' => $governorate->name_en,
                    'name_ar' => $governorate->name_ar,
                    'code' => $governorate->code,
                    'is_active' => $governorate->is_active,
                ],
                'message' => 'Governorate created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create governorate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Create a new city
     */
    public function storeCity(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'governorate_id' => 'required|exists:governorates,id',
                'name_en' => 'required|string|max:255',
                'name_ar' => 'required|string|max:255',
                'code' => 'nullable|string|max:10',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for duplicate city names within the same governorate
            $existingCity = City::where('governorate_id', $request->governorate_id)
                ->where(function ($query) use ($request) {
                    $query->where('name_en', $request->name_en)
                          ->orWhere('name_ar', $request->name_ar);
                })
                ->first();

            if ($existingCity) {
                return response()->json([
                    'success' => false,
                    'message' => 'A city with this name already exists in the selected governorate'
                ], 422);
            }

            $city = City::create([
                'governorate_id' => $request->governorate_id,
                'name_en' => $request->name_en,
                'name_ar' => $request->name_ar,
                'code' => $request->code,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $city->load('governorate');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $city->id,
                    'governorate_id' => $city->governorate_id,
                    'name_en' => $city->name_en,
                    'name_ar' => $city->name_ar,
                    'code' => $city->code,
                    'is_active' => $city->is_active,
                    'governorate' => [
                        'id' => $city->governorate->id,
                        'name_en' => $city->governorate->name_en,
                        'name_ar' => $city->governorate->name_ar,
                    ],
                ],
                'message' => 'City created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create city',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update governorate
     */
    public function updateGovernorate(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $governorate = Governorate::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name_en' => 'sometimes|required|string|max:255|unique:governorates,name_en,' . $id,
                'name_ar' => 'sometimes|required|string|max:255|unique:governorates,name_ar,' . $id,
                'code' => 'nullable|string|max:10|unique:governorates,code,' . $id,
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $governorate->update($request->only(['name_en', 'name_ar', 'code']) + [
                'is_active' => $request->boolean('is_active', $governorate->is_active),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $governorate->id,
                    'name_en' => $governorate->name_en,
                    'name_ar' => $governorate->name_ar,
                    'code' => $governorate->code,
                    'is_active' => $governorate->is_active,
                ],
                'message' => 'Governorate updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update governorate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Update city
     */
    public function updateCity(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $city = City::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'governorate_id' => 'sometimes|required|exists:governorates,id',
                'name_en' => 'sometimes|required|string|max:255',
                'name_ar' => 'sometimes|required|string|max:255',
                'code' => 'nullable|string|max:10',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check for duplicate city names within the same governorate (excluding current city)
            if ($request->has('name_en') || $request->has('name_ar') || $request->has('governorate_id')) {
                $governorateId = $request->get('governorate_id', $city->governorate_id);
                $nameEn = $request->get('name_en', $city->name_en);
                $nameAr = $request->get('name_ar', $city->name_ar);

                $existingCity = City::where('governorate_id', $governorateId)
                    ->where('id', '!=', $id)
                    ->where(function ($query) use ($nameEn, $nameAr) {
                        $query->where('name_en', $nameEn)
                              ->orWhere('name_ar', $nameAr);
                    })
                    ->first();

                if ($existingCity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'A city with this name already exists in the selected governorate'
                    ], 422);
                }
            }

            $city->update($request->only(['governorate_id', 'name_en', 'name_ar', 'code']) + [
                'is_active' => $request->boolean('is_active', $city->is_active),
            ]);

            $city->load('governorate');

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $city->id,
                    'governorate_id' => $city->governorate_id,
                    'name_en' => $city->name_en,
                    'name_ar' => $city->name_ar,
                    'code' => $city->code,
                    'is_active' => $city->is_active,
                    'governorate' => [
                        'id' => $city->governorate->id,
                        'name_en' => $city->governorate->name_en,
                        'name_ar' => $city->governorate->name_ar,
                    ],
                ],
                'message' => 'City updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update city',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete governorate
     */
    public function destroyGovernorate($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $governorate = Governorate::findOrFail($id);

            // Check if governorate has cities or properties
            $citiesCount = $governorate->cities()->count();
            $propertiesCount = $governorate->properties()->count();

            if ($citiesCount > 0 || $propertiesCount > 0) {
                $parts = [];
                if ($citiesCount > 0) {
                    $parts[] = "{$citiesCount} " . ($citiesCount === 1 ? 'city' : 'cities');
                }
                if ($propertiesCount > 0) {
                    $parts[] = "{$propertiesCount} " . ($propertiesCount === 1 ? 'property' : 'properties');
                }
                
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete '{$governorate->name_en}'. It has " . implode(' and ', $parts) . 
                                ". Please delete or move them first."
                ], 422);
            }

            $governorate->delete();

            return response()->json([
                'success' => true,
                'message' => 'Governorate deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete governorate',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete city
     */
    public function destroyCity(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $city = City::findOrFail($id);
            $force = $request->input('force', false);

            // Check if city has properties
            $propertiesCount = $city->properties()->count();

            if ($propertiesCount > 0 && !$force) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete '{$city->name_en}'. It has {$propertiesCount} " . 
                                ($propertiesCount === 1 ? 'property' : 'properties') . 
                                ". Please delete or move the " . ($propertiesCount === 1 ? 'property' : 'properties') . " first.",
                    'can_force' => true,
                    'properties_count' => $propertiesCount
                ], 422);
            }

            // If force delete, update properties to have null city_id
            if ($force && $propertiesCount > 0) {
                $city->properties()->update(['city_id' => null]);
            }

            $city->delete();

            return response()->json([
                'success' => true,
                'message' => $force && $propertiesCount > 0 
                    ? "City deleted successfully. {$propertiesCount} " . ($propertiesCount === 1 ? 'property' : 'properties') . " updated to have no city."
                    : 'City deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete city',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get location statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'governorates' => [
                    'total' => Governorate::count(),
                    'active' => Governorate::active()->count(),
                ],
                'cities' => [
                    'total' => City::count(),
                    'active' => City::active()->count(),
                ],
                'properties_by_governorate' => Governorate::withCount(['properties' => function ($query) {
                    $query->approved();
                }])
                ->active()
                ->orderBy('properties_count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($governorate) {
                    return [
                        'id' => $governorate->id,
                        'name' => $governorate->getLocalizedName(),
                        'properties_count' => $governorate->properties_count,
                    ];
                }),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Location statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve location statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
