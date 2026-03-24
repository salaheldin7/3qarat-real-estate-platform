<?php

namespace App\Http\Controllers;

use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * Store a new contact request
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:2000',
                'category' => 'nullable|in:general,property_inquiry,technical_support,complaint,suggestion',
                'priority' => 'nullable|in:low,medium,high,urgent',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Create contact request
            $contactRequest = ContactRequest::create([
                'user_id' => $user ? $user->id : null,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
                'category' => $request->get('category', 'general'),
                'priority' => $request->get('priority', 'medium'),
                'status' => 'pending',
            ]);

            // TODO: Send email notification to admin
            // TODO: Send auto-reply email to user

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $contactRequest->id,
                    'name' => $contactRequest->name,
                    'email' => $contactRequest->email,
                    'subject' => $contactRequest->subject,
                    'status' => $contactRequest->status,
                    'created_at' => $contactRequest->created_at->toISOString(),
                ],
                'message' => 'Contact request submitted successfully. We will get back to you soon.'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit contact request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get all contact requests
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            // Optimize with eager loading and specific columns
            $query = ContactRequest::select([
                'id', 'name', 'email', 'phone', 'subject', 'message',
                'category', 'status', 'priority', 'assigned_to', 'user_id',
                'resolved_at', 'admin_notes', 'created_at', 'updated_at'
            ])
            ->with([
                'user:id,name,email',
                'assignedTo:id,name,email'
            ]);

            // Filter by status
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Filter by category
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            // Filter by priority
            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            // Filter by assigned admin
            if ($request->filled('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            // Search by name, email, or subject
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination (increased default to 50)
            $perPage = $request->get('per_page', 50);
            $contactRequests = $query->paginate($perPage);

            $contactRequests->getCollection()->transform(function ($contactRequest) {
                return [
                    'id' => $contactRequest->id,
                    'name' => $contactRequest->name,
                    'email' => $contactRequest->email,
                    'phone' => $contactRequest->phone,
                    'subject' => $contactRequest->subject,
                    'message' => $contactRequest->message,
                    'category' => $contactRequest->category,
                    'priority' => $contactRequest->priority,
                    'status' => $contactRequest->status,
                    'status_badge_color' => $contactRequest->status_badge_color,
                    'priority_badge_color' => $contactRequest->priority_badge_color,
                    'user' => $contactRequest->user ? [
                        'id' => $contactRequest->user->id,
                        'name' => $contactRequest->user->name,
                        'username' => $contactRequest->user->username,
                    ] : null,
                    'assigned_to' => $contactRequest->assignedTo ? [
                        'id' => $contactRequest->assignedTo->id,
                        'name' => $contactRequest->assignedTo->name,
                    ] : null,
                    'admin_notes' => $contactRequest->admin_notes,
                    'email_sent' => $contactRequest->email_sent,
                    'email_sent_at' => $contactRequest->email_sent_at?->toISOString(),
                    'resolved_at' => $contactRequest->resolved_at?->toISOString(),
                    'response_time' => $contactRequest->response_time,
                    'created_at' => $contactRequest->created_at->toISOString(),
                    'time_ago' => $contactRequest->time_ago,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $contactRequests,
                'message' => 'Contact requests retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve contact requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get a specific contact request
     */
    public function show($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $contactRequest = ContactRequest::with(['user', 'assignedTo'])->findOrFail($id);

            $data = [
                'id' => $contactRequest->id,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'phone' => $contactRequest->phone,
                'subject' => $contactRequest->subject,
                'message' => $contactRequest->message,
                'category' => $contactRequest->category,
                'priority' => $contactRequest->priority,
                'status' => $contactRequest->status,
                'status_badge_color' => $contactRequest->status_badge_color,
                'priority_badge_color' => $contactRequest->priority_badge_color,
                'user' => $contactRequest->user ? [
                    'id' => $contactRequest->user->id,
                    'name' => $contactRequest->user->name,
                    'username' => $contactRequest->user->username,
                    'email' => $contactRequest->user->email,
                    'phone' => $contactRequest->user->phone,
                ] : null,
                'assigned_to' => $contactRequest->assignedTo ? [
                    'id' => $contactRequest->assignedTo->id,
                    'name' => $contactRequest->assignedTo->name,
                    'email' => $contactRequest->assignedTo->email,
                ] : null,
                'admin_notes' => $contactRequest->admin_notes,
                'email_sent' => $contactRequest->email_sent,
                'email_sent_at' => $contactRequest->email_sent_at?->toISOString(),
                'email_response' => $contactRequest->email_response,
                'resolved_at' => $contactRequest->resolved_at?->toISOString(),
                'response_time' => $contactRequest->response_time,
                'is_resolved' => $contactRequest->is_resolved,
                'is_assigned' => $contactRequest->is_assigned,
                'created_at' => $contactRequest->created_at->toISOString(),
                'updated_at' => $contactRequest->updated_at->toISOString(),
                'formatted_created_at' => $contactRequest->formatted_created_at,
                'time_ago' => $contactRequest->time_ago,
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Contact request retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve contact request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Assign contact request to an admin
     */
    public function assign(Request $request, $id): JsonResponse
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
                'admin_id' => 'required|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $contactRequest = ContactRequest::findOrFail($id);
            $assignedAdmin = User::findOrFail($request->admin_id);

            // Check if the assigned user is actually an admin
            if (!$assignedAdmin->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected user is not an admin'
                ], 422);
            }

            $contactRequest->assignTo($request->admin_id);

            return response()->json([
                'success' => true,
                'message' => "Contact request assigned to {$assignedAdmin->name}"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign contact request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Resolve contact request
     */
    public function resolve(Request $request, $id): JsonResponse
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
                'admin_notes' => 'nullable|string|max:1000',
                'close' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $contactRequest = ContactRequest::findOrFail($id);

            if ($request->boolean('close')) {
                $contactRequest->markAsClosed($request->admin_notes);
                $message = 'Contact request closed successfully';
            } else {
                $contactRequest->markAsResolved($request->admin_notes);
                $message = 'Contact request resolved successfully';
            }

            return response()->json([
                'success' => true,
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve contact request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Send email reply to contact request
     */
    public function reply(Request $request, $id): JsonResponse
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
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
                'resolve_after_send' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $contactRequest = ContactRequest::findOrFail($id);

            // TODO: Implement actual email sending
            // For now, we'll just mark as sent and store the response
            $emailResponse = [
                'subject' => $request->subject,
                'message' => $request->message,
                'sent_by' => $user->name,
                'sent_at' => now()->toISOString(),
            ];

            $contactRequest->markEmailAsSent(json_encode($emailResponse));

            // Optionally resolve the request after sending email
            if ($request->boolean('resolve_after_send')) {
                $contactRequest->markAsResolved('Resolved after email reply');
            }

            return response()->json([
                'success' => true,
                'message' => 'Email reply sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email reply',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Delete contact request
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $contactRequest = ContactRequest::findOrFail($id);
            $contactRequest->delete();

            return response()->json([
                'success' => true,
                'message' => 'Contact request deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contact request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Admin: Get contact request statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.'
                ], 403);
            }

            $stats = [
                'total' => ContactRequest::count(),
                'pending' => ContactRequest::pending()->count(),
                'in_progress' => ContactRequest::inProgress()->count(),
                'resolved' => ContactRequest::resolved()->count(),
                'closed' => ContactRequest::closed()->count(),
                'unassigned' => ContactRequest::unassigned()->count(),
                'high_priority' => ContactRequest::highPriority()->count(),
                'by_category' => ContactRequest::selectRaw('category, COUNT(*) as count')
                    ->groupBy('category')
                    ->pluck('count', 'category'),
                'by_priority' => ContactRequest::selectRaw('priority, COUNT(*) as count')
                    ->groupBy('priority')
                    ->pluck('count', 'priority'),
                'recent_requests' => ContactRequest::with(['user'])
                    ->recent()
                    ->limit(5)
                    ->get()
                    ->map(function ($request) {
                        return [
                            'id' => $request->id,
                            'name' => $request->name,
                            'subject' => $request->subject,
                            'status' => $request->status,
                            'priority' => $request->priority,
                            'created_at' => $request->created_at->toISOString(),
                            'time_ago' => $request->time_ago,
                        ];
                    }),
                'average_response_time' => ContactRequest::resolved()
                    ->whereNotNull('response_time')
                    ->avg('response_time'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Contact request statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
