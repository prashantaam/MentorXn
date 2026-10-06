<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BlockTemplate;
use App\Models\LearningBlock;
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
            ->with('blockTemplate')
            ->orderBy('position')
            ->get();

        return response()->json([
            'topic' => $topic,
            'learning_blocks' => $learningBlocks,
        ]);
    }

    /**
     * Return one existing learning block.
     *
     * Used by the Visual Block Editor when
     * a teacher edits an existing block.
     */
    public function show(
        Request $request,
        LearningBlock $learningBlock
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
         * Load everything required to:
         *
         * 1. verify ownership;
         * 2. identify the topic/course;
         * 3. render the block in the Visual Editor.
         */
        $learningBlock->loadMissing(
            'topic.lesson.course',
            'blockTemplate'
        );

        /*
         * A teacher must only be able to access
         * learning blocks belonging to their
         * own course.
         */
        if (
            !$learningBlock->topic ||
            !$learningBlock->topic->lesson ||
            !$learningBlock->topic->lesson->course ||
            $learningBlock
                ->topic
                ->lesson
                ->course
                ->teacher_id !== $user->id
        ) {
            return response()->json([
                'message' =>
                    'Learning block not found.',
            ], 404);
        }

        return response()->json([
            'learning_block' =>
                $learningBlock,
        ]);
    }

    /**
     * Create a template-driven learning block.
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

        $validated = $request->validate([
            'block_template_id' => [
                'required',
                'integer',
                'exists:block_templates,id',
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

        $template = BlockTemplate::query()
            ->where(
                'id',
                $validated['block_template_id']
            )
            ->where('status', 'active')
            ->first();

        if (!$template) {
            return response()->json([
                'message' =>
                    'Learning block template not found.',
            ], 422);
        }

        $templateError =
            $this->validateTemplateData(
                $template,
                $validated['data']
            );

        if ($templateError) {
            return response()->json([
                'message' => $templateError,
            ], 422);
        }

        $nextPosition =
            (
                $topic
                    ->learningBlocks()
                    ->max('position')
                ?? 0
            ) + 1;

        $learningBlock = $topic
            ->learningBlocks()
            ->create([
                'block_template_id' =>
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

        $learningBlock->load(
            'blockTemplate'
        );

        return response()->json([
            'message' =>
                'Learning block created successfully.',
            'learning_block' =>
                $learningBlock,
        ], 201);
    }

    /**
     * Update an existing learning block.
     *
     * The template itself is intentionally not
     * changeable here. Editing changes only the
     * block content/configuration.
     */
    public function update(
        Request $request,
        LearningBlock $learningBlock
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $learningBlock->loadMissing(
            'topic.lesson.course',
            'blockTemplate'
        );

        if (
            !$learningBlock->topic ||
            !$learningBlock->topic->lesson ||
            !$learningBlock->topic->lesson->course ||
            $learningBlock
                ->topic
                ->lesson
                ->course
                ->teacher_id !== $user->id
        ) {
            return response()->json([
                'message' =>
                    'Learning block not found.',
            ], 404);
        }

        $validated = $request->validate([
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

        $template =
            $learningBlock->blockTemplate;

        if (
            !$template ||
            $template->status !== 'active'
        ) {
            return response()->json([
                'message' =>
                    'Learning block template not found.',
            ], 422);
        }

        $templateError =
            $this->validateTemplateData(
                $template,
                $validated['data']
            );

        if ($templateError) {
            return response()->json([
                'message' => $templateError,
            ], 422);
        }

        $learningBlock->update([
            'title' =>
                $validated['title']
                ?? null,
            'icon' =>
                $validated['icon']
                ?? null,
            'data' =>
                $validated['data'],
            'status' =>
                $validated['status'],
        ]);

        $learningBlock->load(
            'blockTemplate'
        );

        return response()->json([
            'message' =>
                'Learning block updated successfully.',
            'learning_block' =>
                $learningBlock,
        ]);
    }

    /**
 * Reorder learning blocks within a topic.
 */
public function reorder(
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

    $validated = $request->validate([
        'blocks' => [
            'required',
            'array',
        ],
        'blocks.*.id' => [
            'required',
            'integer',
        ],
        'blocks.*.position' => [
            'required',
            'integer',
            'min:1',
        ],
    ]);

    $topicBlockIds = $topic
        ->learningBlocks()
        ->pluck('id')
        ->map(fn ($id) => (int) $id)
        ->all();

    foreach ($validated['blocks'] as $block) {
        if (!in_array((int) $block['id'], $topicBlockIds, true)) {
            return response()->json([
                'message' =>
                    'One or more learning blocks do not belong to this topic.',
            ], 422);
        }
    }

    foreach ($validated['blocks'] as $block) {
        $topic
            ->learningBlocks()
            ->where('id', $block['id'])
            ->update([
                'position' => $block['position'],
            ]);
    }

    $learningBlocks = $topic
        ->learningBlocks()
        ->with('blockTemplate')
        ->orderBy('position')
        ->get();

    return response()->json([
        'message' =>
            'Learning blocks reordered successfully.',
        'learning_blocks' =>
            $learningBlocks,
    ]);
}
    /**
     * Delete a learning block.
     */
    public function destroy(
        Request $request,
        LearningBlock $learningBlock
    ): JsonResponse {
        $user = $request->user();

        if (!$user->isTeacher()) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $learningBlock->loadMissing(
            'topic.lesson.course'
        );

        if (
            !$learningBlock->topic ||
            !$learningBlock->topic->lesson ||
            !$learningBlock->topic->lesson->course ||
            $learningBlock
                ->topic
                ->lesson
                ->course
                ->teacher_id !== $user->id
        ) {
            return response()->json([
                'message' =>
                    'Learning block not found.',
            ], 404);
        }

        $learningBlock->delete();

        return response()->json([
            'message' =>
                'Learning block deleted successfully.',
        ]);
    }

    /**
     * Validate data against the fields defined
     * by the selected template.
     */
    private function validateTemplateData(
        BlockTemplate $template,
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
             * Title and icon are top-level
             * LearningBlock fields.
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

            if (
                is_array($value)
                && count($value) === 0
            ) {
                return
                    "The {$name} field is required.";
            }
        }

        return null;
    }


}