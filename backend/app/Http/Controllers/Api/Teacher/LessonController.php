<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LessonController extends Controller
{
    /**
     * Return lessons for a teacher's course,
     * including their topics.
     */
    public function index(
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

        /*
         * Load lessons and their topics in one API request.
         *
         * Eloquent eager loading prevents the frontend from
         * needing a separate HTTP request for every lesson.
         */
        $lessons = $course->lessons()
            ->with([
                'topics' => function ($query) {
                    $query->orderBy('position');
                },
            ])
            ->orderBy('position')
            ->get();

        return response()->json([
            'lessons' => $lessons,
        ]);
    }

    /**
     * Create a lesson inside a course.
     */
    public function store(
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

        $validated = $this->validateLesson($request);

        $nextPosition =
            ($course->lessons()->max('position') ?? 0) + 1;

        $lesson = $course->lessons()->create([
            'title' => $validated['title'],
            'icon' => $validated['icon'] ?? '📖',
            'description' => $validated['description'] ?? null,
            'position' => $nextPosition,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Lesson created successfully.',
            'lesson' => $lesson,
        ], 201);
    }

    /**
     * Update an existing lesson.
     */
    public function update(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Lesson not found.',
            ], 404);
        }

        $validated = $this->validateLesson($request);

        $lesson->update([
            'title' => $validated['title'],
            'icon' => $validated['icon'] ?? '📖',
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        $lesson->refresh();

        return response()->json([
            'message' => 'Lesson updated successfully.',
            'lesson' => $lesson,
        ]);
    }

    /**
     * Delete an existing lesson.
     */
    public function destroy(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Lesson not found.',
            ], 404);
        }

        $lessonId = $lesson->id;

        $lesson->delete();

        return response()->json([
            'message' => 'Lesson deleted successfully.',
            'lesson_id' => $lessonId,
        ]);
    }

    /**
     * Shared lesson validation.
     */
    private function validateLesson(
        Request $request
    ): array {
        return $request->validate([
            'title' => [
                'required',
                'string',
                'max:150',
            ],
            'icon' => [
                'nullable',
                'string',
                'max:20',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'published',
                ]),
            ],
        ]);
    }
}