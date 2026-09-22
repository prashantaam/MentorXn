<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TopicController extends Controller
{
    /**
     * Return all topics belonging to a lesson.
     */
    public function index(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
         * Verify that this lesson belongs to
         * a course owned by the logged-in teacher.
         */
        if ($lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Lesson not found.',
            ], 404);
        }

        $topics = $lesson->topics()
            ->orderBy('position')
            ->get();

        return response()->json([
            'lesson' => $lesson,
            'topics' => $topics,
        ]);
    }

    /**
     * Create a topic inside a lesson.
     */
    public function store(
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

        $validated = $request->validate([
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

        /*
         * Automatically place the new topic
         * after the current final topic.
         */
        $nextPosition =
            ($lesson->topics()->max('position') ?? 0)
            + 1;

        $topic = $lesson->topics()->create([
            'title' => $validated['title'],

            'icon' =>
                $validated['icon'] ?? '📑',

            'description' =>
                $validated['description'] ?? null,

            'position' => $nextPosition,

            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' =>
                'Topic created successfully.',

            'topic' => $topic,
        ], 201);
    }
}