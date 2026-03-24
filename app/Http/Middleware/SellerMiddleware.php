<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || (!$request->user()->is_seller && !$request->user()->is_admin)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Seller privileges required.',
                'error' => 'You must be a registered seller to perform this action.'
            ], 403);
        }

        return $next($request);
    }
}
