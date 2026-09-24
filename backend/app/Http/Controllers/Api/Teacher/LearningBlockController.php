<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LBlockTemplate;
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
            ->with('lblockTemplate')
            ->orderBy('position')
            ->get();

        return response()->json([
            'topic' => $topic,

            'learning_blocks' =>
                $learningBlocks,
        ]);
    }

    /**
     * Create a learning block.
     *
     * Supports:
     *
     * 1. Existing MentorXn blocks
     *    - content
     *    - quiz
     *    - practice_terminal
     *
     * 2. Template-driven blocks
     *    - lblock_template_id
     *    - data generated from the
     *      template configuration schema
     */
    public function store(
        Request $request,
        Topic $topic
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' =>
                    'Teacher access required.',
            ], 403);
        }

        if (
            $topic->lesson->course->teacher_id
            !== $user->id
        ) {
            return response()->json([
                'message' =>
                    'Topic not found.',
            ], 404);
        }

        /*
         * =====================================
         * TEMPLATE-DRIVEN VALIDATION
         * =====================================
         *
         * Every learning block must be created
         * from an active developer-managed
         * learning block template.
         */

        $validated = $request->validate([
            'lblock_template_id' => [
                'required',
                'integer',
                'exists:lblock_templates,id',
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
         * =====================================
         * LOAD ACTIVE DEVELOPER TEMPLATE
         * =====================================
         */

        $template =
            LBlockTemplate::query()
                ->where(
                    'id',
                    $validated[
                        'lblock_template_id'
                    ]
                )
                ->where(
                    'status',
                    'active'
                )
                ->first();

        if (!$template) {
            return response()->json([
                'message' =>
                    'Learning block template not found.',
            ], 422);
        }

        /*
         * =====================================
         * VALIDATE TEMPLATE CONFIGURATION
         * =====================================
         */

        $templateError =
            $this->validateTemplateData(
                $template,
                $validated['data']
            );

        if ($templateError) {
            return response()->json([
                'message' =>
                    $templateError,
            ], 422);
        }

        /*
         * =====================================
         * AUTOMATIC POSITION
         * =====================================
         */

        $nextPosition =
            (
                $topic
                    ->learningBlocks()
                    ->max('position')
                ?? 0
            ) + 1;

        /*
         * =====================================
         * CREATE BLOCK
         * =====================================
         *
         * The template relationship determines
         * which trusted React component renders
         * this learning block.
         *
         * The legacy "type" field is no longer
         * used by the application.
         */

        $learningBlock =
            $topic
                ->learningBlocks()
                ->create([
                    'lblock_template_id' =>
                        $template->id,

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

        /*
         * Return the template relationship
         * immediately so LearningBlockRenderer
         * can resolve the trusted component
         * through blockRegistry.js.
         */

        $learningBlock->load(
            'lblockTemplate'
        );

        return response()->json([
            'message' =>
                'Learning block created successfully.',

            'learning_block' =>
                $learningBlock,
        ], 201);
    }

    /**
     * Validate data against the fields defined
     * by the selected template.
     *
     * This is intentionally simple for the
     * first template-driven implementation.
     */
    private function validateTemplateData(
        LBlockTemplate $template,
        array $data
    ): ?string {
        $schema =
            $template->configuration_schema
            ?? [];

        $fields =
            $schema['fields']
            ?? [];

        foreach ($fields as $field) {
            $name =
                $field['name']
                ?? null;

            if (!$name) {
                continue;
            }

            /*
             * Title and icon are stored as
             * top-level learning block fields,
             * not inside data.
             */
            if (
                in_array(
                    $name,
                    [
                        'title',
                        'icon',
                    ],
                    true
                )
            ) {
                continue;
            }

            $required =
                (bool) (
                    $field['required']
                    ?? false
                );

            if (!$required) {
                continue;
            }

            if (
                !array_key_exists(
                    $name,
                    $data
                )
            ) {
                return
                    "The {$name} field is required.";
            }

            $value =
                $data[$name];

            if (
                is_string($value)
                && trim($value) === ''
            ) {
                return
                    "The {$name} field is required.";
            }

            if ($value === null) {
                return
                    "The {$name} field is required.";
            }
        }

        return null;
    }
}