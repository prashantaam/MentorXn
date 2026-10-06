<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only let users with one of the given roles through.
 *
 * Usage on routes:  ->middleware('role:developer')
 *                   ->middleware('role:teacher,developer')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'You do not have access to this area.',
            ], 403);
        }

        return $next($request);
    }
}
