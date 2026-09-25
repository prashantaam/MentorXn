<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Topic;
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

        $validated = $this->validateTopic($request);

        $nextPosition =
            ($lesson->topics()->max('position') ?? 0) + 1;

        $topic = $lesson->topics()->create([
            'title' => $validated['title'],
            'icon' => $validated['icon'] ?? '📑',
            'introduction' => $validated['introduction'],
            'position' => $nextPosition,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Topic created successfully.',
            'topic' => $topic,
        ], 201);
    }

    /**
     * Update an existing topic.
     */
    public function update(
        Request $request,
        Topic $topic
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($topic->lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Topic not found.',
            ], 404);
        }

        $validated = $this->validateTopic($request);

        $topic->update([
            'title' => $validated['title'],
            'icon' => $validated['icon'] ?? '📑',
            'introduction' => $validated['introduction'],
            'status' => $validated['status'],
        ]);

        $topic->refresh();

        return response()->json([
            'message' => 'Topic updated successfully.',
            'topic' => $topic,
        ]);
    }

    /**
     * Delete an existing topic.
     */
    public function destroy(
        Request $request,
        Topic $topic
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($topic->lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'message' => 'Topic not found.',
            ], 404);
        }

        $topicId = $topic->id;

        $topic->delete();

        return response()->json([
            'message' => 'Topic deleted successfully.',
            'topic_id' => $topicId,
        ]);
    }

    /**
     * Shared validation for creating/updating topics.
     */
    private function validateTopic(
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

            'introduction' => [
                'required',
                'string',
                'max:2000',
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