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

            'type' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                'unique:lblock_templates,type',
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
                'required',
                'string',
                'max:100',

                Rule::in([
                    'ContentBlock',
                    'QuizBlock',
                    'PracticeTerminalBlock',
                ]),
            ],

            'configuration_schema' => [
                'nullable',
                'array',
            ],

            'default_data' => [
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

            'type' =>
                $validated['type'],

            'icon' =>
                $validated['icon'] ?? null,

            'description' =>
                $validated['description'] ?? null,

            'component' =>
                $validated['component'],

            'configuration_schema' =>
                $validated['configuration_schema']
                ?? null,

            'default_data' =>
                $validated['default_data']
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

            'type' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                'alpha_dash',

                Rule::unique(
                    'lblock_templates',
                    'type'
                )->ignore(
                    $lblockTemplate->id
                ),
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
                    'PracticeTerminalBlock',
                ]),
            ],

            'configuration_schema' => [
                'nullable',
                'array',
            ],

            'default_data' => [
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
}