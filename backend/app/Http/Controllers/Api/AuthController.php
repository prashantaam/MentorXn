<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a student.
     */
    public function registerStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => $validated['password'],
            'role' => 'student',
        ]);

        $token = $user->createToken('student-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Student account created successfully.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Register a teacher.
     */
    public function registerTeacher(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => $validated['password'],
            'role' => 'teacher',
        ]);

        $token = $user->createToken('teacher-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Teacher account created successfully.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Student login.
     */
    public function loginStudent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isStudent()) {
            throw ValidationException::withMessages([
                'email' => ['This account is not a student account.'],
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken('student-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Student signed in successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Teacher login.
     */
    public function loginTeacher(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', strtolower($validated['email']))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isTeacher()) {
            throw ValidationException::withMessages([
                'email' => ['This account is not a teacher account.'],
            ]);
        }

        $user->tokens()->delete();

        $token = $user->createToken('teacher-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Teacher signed in successfully.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Return the currently authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Logout the currently authenticated user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Signed out successfully.',
        ]);
    }
}