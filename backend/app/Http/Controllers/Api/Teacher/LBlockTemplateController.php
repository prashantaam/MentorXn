<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LBlockTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LBlockTemplateController extends Controller
{
    /**
     * Return all active learning block templates.
     */
    public function index(): JsonResponse
    {
        $templates = LBlockTemplate::query()
            ->where('status', 'active')
            ->orderBy('position')
            ->orderBy('name')
            ->get();

        return response()->json([
            'lblock_templates' => $templates,
        ]);
    }

    /**
     * Return one learning block template.
     */
    public function show(
        LBlockTemplate $lblockTemplate
    ): JsonResponse {
        return response()->json([
            'lblock_template' => $lblockTemplate,
        ]);
    }

    /**
     * Create a new learning block template.
     */
    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'icon' => [
                'nullable',
                'string',
                'max:20',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            /*
             * The React component must be one of
             * MentorXn's trusted components.
             *
             * Teachers cannot provide arbitrary
             * component names or JavaScript.
             */
            'component' => [
                'required',
                'string',
                'max:100',

                Rule::in([
                    'ContentBlock',
                    'QuizBlock',
                    'InteractiveBlock',
                    'PracticeTerminalBlock',
                ]),
            ],

            /*
             * Tags are only metadata used for
             * searching, filtering and organising
             * templates.
             */
            'tags' => [
                'nullable',
                'array',
                'max:20',
            ],

            'tags.*' => [
                'required',
                'string',
                'max:50',
            ],

            /*
             * Defines which fields can be edited
             * when the template is used.
             *
             * Every template can include standard
             * student-facing title and icon fields,
             * plus template-specific fields.
             */
            'configuration_schema' => [
                'nullable',
                'array',
            ],

            /*
             * Example content used for template
             * preview and demonstration.
             *
             * This is not the real course content.
             */
            'example_data' => [
                'nullable',
                'array',
            ],

            'status' => [
                'nullable',

                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'position' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        $template = LBlockTemplate::create([
            'name' =>
                $validated['name'],

            'icon' =>
                $validated['icon'] ?? null,

            'description' =>
                $validated['description'] ?? null,

            'component' =>
                $validated['component'],

            'tags' =>
                $this->normaliseTags(
                    $validated['tags'] ?? []
                ),

            'configuration_schema' =>
                $validated['configuration_schema']
                ?? null,

            'example_data' =>
                $validated['example_data']
                ?? null,

            'status' =>
                $validated['status']
                ?? 'active',

            'position' =>
                $validated['position']
                ?? 0,
        ]);

        return response()->json([
            'message' =>
                'Learning block template created successfully.',

            'lblock_template' =>
                $template,
        ], 201);
    }

    /**
     * Update an existing learning block template.
     */
    public function update(
        Request $request,
        LBlockTemplate $lblockTemplate
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],

            'icon' => [
                'nullable',
                'string',
                'max:20',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'component' => [
                'sometimes',
                'required',
                'string',
                'max:100',

                Rule::in([
                    'ContentBlock',
                    'QuizBlock',
                    'InteractiveBlock',
                    'PracticeTerminalBlock',
                ]),
            ],

            'tags' => [
                'nullable',
                'array',
                'max:20',
            ],

            'tags.*' => [
                'required',
                'string',
                'max:50',
            ],

            'configuration_schema' => [
                'nullable',
                'array',
            ],

            'example_data' => [
                'nullable',
                'array',
            ],

            'status' => [
                'nullable',

                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'position' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        /*
         * Normalise tags only when they were
         * included in the update request.
         */
        if (
            array_key_exists(
                'tags',
                $validated
            )
        ) {
            $validated['tags'] =
                $this->normaliseTags(
                    $validated['tags'] ?? []
                );
        }

        $lblockTemplate->update(
            $validated
        );

        return response()->json([
            'message' =>
                'Learning block template updated successfully.',

            'lblock_template' =>
                $lblockTemplate->fresh(),
        ]);
    }

    /**
     * Delete a learning block template.
     *
     * Existing course blocks are preserved because
     * lblock_template_id uses nullOnDelete().
     */
    public function destroy(
        LBlockTemplate $lblockTemplate
    ): JsonResponse {
        $lblockTemplate->delete();

        return response()->json([
            'message' =>
                'Learning block template deleted successfully.',
        ]);
    }

    /**
     * Clean template tags before storing them.
     *
     * Example:
     *
     * [" Content ", "Code", "content"]
     *
     * becomes:
     *
     * ["Content", "Code"]
     */
    private function normaliseTags(
        array $tags
    ): array {
        $normalised = [];

        foreach ($tags as $tag) {
            $tag = trim($tag);

            if ($tag === '') {
                continue;
            }

            $alreadyExists = false;

            foreach (
                $normalised as $existingTag
            ) {
                if (
                    strtolower($existingTag)
                    === strtolower($tag)
                ) {
                    $alreadyExists = true;

                    break;
                }
            }

            if (!$alreadyExists) {
                $normalised[] = $tag;
            }
        }

        return array_values(
            $normalised
        );
    }
}