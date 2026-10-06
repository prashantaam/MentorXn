<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    /**
     * Return all courses belonging to the
     * currently authenticated teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $courses = $user->courses()
            ->withCount('lessons')
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    /**
     * Return one course belonging to the
     * currently authenticated teacher.
     */
    public function show(
        Request $request,
        Course $course
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        return response()->json([
            'course' => $course->loadCount('lessons'),
        ]);
    }

    /**
     * Create a new course.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $validated = $request->validate(
            $this->courseRules()
        );

        $slug = $this->generateUniqueSlug(
            $validated['title']
        );

        $course = $user->courses()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'level' => $validated['level'],
            'status' => $validated['status'],
            'icon' => $validated['icon'] ?? '🚀',
            'accent_color' =>
                $validated['accent_color'] ?? '#ff9a8b',

            'published_at' =>
                $validated['status'] === 'published'
                    ? now()
                    : null,
        ]);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course,
        ], 201);
    }

    /**
     * Update a course belonging to the
     * currently authenticated teacher.
     *
     * The slug is kept as-is so existing
     * links to the course keep working.
     */
    public function update(
        Request $request,
        Course $course
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Course not found.',
            ], 404);
        }

        $validated = $request->validate(
            $this->courseRules()
        );

        /*
         * Keep the original publish date when a
         * published course is saved again; set it
         * the first time it is published and clear
         * it when the course goes back to draft.
         */
        $publishedAt = match ($validated['status']) {
            'published' => $course->published_at ?? now(),
            default => null,
        };

        $course->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'level' => $validated['level'],
            'status' => $validated['status'],
            'icon' => $validated['icon'] ?? $course->icon,
            'accent_color' =>
                $validated['accent_color'] ?? $course->accent_color,
            'published_at' => $publishedAt,
        ]);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => $course->fresh(),
        ]);
    }

    /**
     * Validation rules shared by store() and update().
     */
    private function courseRules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:120',
            ],

            'description' => [
                'required',
                'string',
                'max:500',
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'level' => [
                'required',
                Rule::in([
                    'Beginner',
                    'Intermediate',
                    'Advanced',
                ]),
            ],

            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'published',
                ]),
            ],

            'icon' => [
                'nullable',
                'string',
                'max:20',
            ],

            'accent_color' => [
                'nullable',
                'string',
                'max:20',
            ],
        ];
    }

    /**
     * Generate a unique slug.
     */
    private function generateUniqueSlug(
        string $title
    ): string {
        $baseSlug = Str::slug($title);

        if ($baseSlug === '') {
            $baseSlug = 'course';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            Course::where('slug', $slug)->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}