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
            ->orderBy('position')
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
         * Common Learning Block validation.
         */
        $validated = $request->validate([
            'type' => [
                'required',
                Rule::in([
                    'content',
                    'quiz',
                    'practice_terminal',
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
         * Content block.
         */
        if ($validated['type'] === 'content') {
            $request->validate([
                'data.content' => [
                    'required',
                    'string',
                ],
            ]);
        }

        /*
         * Quiz block.
         */
        if ($validated['type'] === 'quiz') {
            $request->validate([
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

                /*
                 * This was missing previously.
                 */
                'data.questions.*.correct_answer' => [
                    'required',
                    'integer',
                    'min:0',
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
             * Make sure correct_answer references
             * an existing option.
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
        * Practice Terminal block.
        */
        if ($validated['type'] === 'practice_terminal') {
            $request->validate([
                'data.welcome' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'data.tip' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'data.command_prefix' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'data.commands' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'data.commands.*.command' => [
                    'required',
                    'string',
                    'max:500',
                ],

                'data.commands.*.output' => [
                    'required',
                    'string',
                    'max:5000',
                ],
            ]);
        }
        /*
         * Automatically append the block.
         */
        $nextPosition =
            (
                $topic
                    ->learningBlocks()
                    ->max('position')
                ?? 0
            ) + 1;

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