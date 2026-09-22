<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LearningBlockController extends Controller
{
    /**
     * Return all learning blocks for a topic.
     */
    public function index(
        Request $request,
        Topic $topic
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
         * Ownership chain:
         *
         * Topic
         *   -> Lesson
         *   -> Course
         *   -> Teacher
         */
        if (
            $topic->lesson->course->teacher_id
            !== $user->id
        ) {
            return response()->json([
                'message' => 'Topic not found.',
            ], 404);
        }

        $learningBlocks = $topic
            ->learningBlocks()
            ->get();

        return response()->json([
            'topic' => $topic,
            'learning_blocks' => $learningBlocks,
        ]);
    }

    /**
     * Create a learning block.
     */
    public function store(
        Request $request,
        Topic $topic
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            $topic->lesson->course->teacher_id
            !== $user->id
        ) {
            return response()->json([
                'message' => 'Topic not found.',
            ], 404);
        }

        /*
         * Validate common Learning Block fields.
         */
        $validated = $request->validate([
            'type' => [
                'required',
                Rule::in([
                    'content',
                    'quiz',
                ]),
            ],

            'title' => [
                'nullable',
                'string',
                'max:150',
            ],

            'icon' => [
                'nullable',
                'string',
                'max:20',
            ],

            'data' => [
                'required',
                'array',
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
         * Validate block-specific data.
         */
        if (
            $validated['type']
            === 'content'
        ) {
            $request->validate([
                'data.content' => [
                    'required',
                    'string',
                ],
            ]);
        }

        if (
            $validated['type']
            === 'quiz'
        ) {
            $request->validate([
                'data.questions' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'data.questions.*.question' => [
                    'required',
                    'string',
                    'max:1000',
                ],

                'data.questions.*.type' => [
                    'required',
                    Rule::in([
                        'multiple_choice',
                    ]),
                ],

                'data.questions.*.options' => [
                    'required',
                    'array',
                    'min:2',
                ],

                'data.questions.*.options.*' => [
                    'required',
                    'string',
                    'max:500',
                ],
                'data.instructions' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'data.passing_score' => [
                    'nullable',
                    'integer',
                    'min:0',
                    'max:100',
                ],

                'data.allow_retry' => [
                    'nullable',
                    'boolean',
                ],

                'data.questions.*.correct_message' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'data.questions.*.wrong_message' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'data.questions.*.explanation' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],
            ]);

            /*
             * Validate that correct_answer points
             * to an actual option.
             */
            foreach (
                $validated['data']['questions']
                as $index => $question
            ) {
                $correctAnswer =
                    $question['correct_answer'];

                $optionCount =
                    count($question['options']);

                if (
                    $correctAnswer >= $optionCount
                ) {
                    return response()->json([
                        'message' =>
                            'The selected correct answer is invalid.',

                        'errors' => [
                            "data.questions.$index.correct_answer" => [
                                'The correct answer must reference one of the available options.',
                            ],
                        ],
                    ], 422);
                }
            }
        }

        /*
         * Automatically add the block after
         * the current final block.
         */
        $nextPosition =
            ($topic
                ->learningBlocks()
                ->max('position') ?? 0)
            + 1;

        $learningBlock =
            $topic
                ->learningBlocks()
                ->create([
                    'type' =>
                        $validated['type'],

                    'title' =>
                        $validated['title']
                        ?? null,

                    'icon' =>
                        $validated['icon']
                        ?? null,

                    'data' =>
                        $validated['data'],

                    'position' =>
                        $nextPosition,

                    'status' =>
                        $validated['status'],
                ]);

        return response()->json([
            'message' =>
                'Learning block created successfully.',

            'learning_block' =>
                $learningBlock,
        ], 201);
    }
}