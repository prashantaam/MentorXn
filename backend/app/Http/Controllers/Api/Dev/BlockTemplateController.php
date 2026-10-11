<?php

namespace App\Http\Controllers\Api\Dev;

use App\Http\Controllers\Controller;
use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Manage block templates. Developer-only (routes use `role:developer`).
 */
class BlockTemplateController extends Controller
{
    /**
     * Every template, including inactive ones, with its category and how
     * many learning blocks use it. Categories are included for grouping.
     */
    public function index(): JsonResponse
    {
        $templates = BlockTemplate::query()
            ->with('blockCategory')
            ->withCount('learningBlocks')
            ->orderBy('position')
            ->orderBy('name')
            ->get();

        return response()->json([
            'block_templates' => $templates,
            // All categories (inactive too), in library order.
            'block_categories' => BlockCategory::ordered()->get(),
        ]);
    }

    public function show(
        BlockTemplate $blockTemplate
    ): JsonResponse {
        return response()->json([
            'block_template' => $this->withDetails($blockTemplate),
        ]);
    }

    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate($this->rules());

        $template = BlockTemplate::create(
            $this->attributes($validated, $request)
        );

        return response()->json([
            'message' => 'Block template created.',
            'block_template' => $this->withDetails($template),
        ], 201);
    }

    public function update(
        Request $request,
        BlockTemplate $blockTemplate
    ): JsonResponse {
        $validated = $request->validate($this->rules());

        $blockTemplate->update(
            $this->attributes($validated, $request)
        );

        return response()->json([
            'message' => 'Block template saved.',
            'block_template' => $this->withDetails($blockTemplate->fresh()),
        ]);
    }

    /**
     * Templates that learning blocks use can't be deleted — that would
     * leave those blocks without a component in every course. Deactivate
     * them instead (they disappear from the library, existing blocks keep
     * working).
     */
    public function destroy(
        BlockTemplate $blockTemplate
    ): JsonResponse {
        $inUse = $blockTemplate->learningBlocks()->count();

        if ($inUse > 0) {
            return response()->json([
                'message' => "This template is used by {$inUse} learning "
                    . ($inUse === 1 ? 'block' : 'blocks')
                    . '. Set it to inactive instead of deleting it.',
                'learning_blocks_count' => $inUse,
            ], 409);
        }

        $blockTemplate->delete();

        return response()->json([
            'message' => 'Block template deleted.',
        ]);
    }

    private function withDetails(BlockTemplate $template): BlockTemplate
    {
        return $template->load('blockCategory')->loadCount('learningBlocks');
    }

    /**
     * Validation for create and update (the form always sends every field).
     */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:2000'],

            /*
             * The React component that renders the block. It must be a
             * component-style name (e.g. FlipCardBlock); the frontend maps
             * it to a component in its block registry.
             */
            'component' => [
                'required',
                'string',
                'max:100',
                'regex:/^[A-Z][A-Za-z0-9]*$/',
            ],

            // Managed on /dev/block-categories.
            'block_category_id' => ['required', 'integer', 'exists:block_categories,id'],

            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['required', 'string', 'max:50'],

            /*
             * The settings form for blocks of this type: a list of fields,
             * each with at least a name and a type.
             */
            'configuration_schema' => ['required', 'array'],
            'configuration_schema.fields' => ['required', 'array'],
            'configuration_schema.fields.*.name' => ['required', 'string', 'max:100'],
            'configuration_schema.fields.*.type' => ['required', 'string', 'max:50'],

            // Sample content used for new blocks and previews.
            'example_data' => ['nullable', 'array'],

            'status' => ['required', Rule::in(['active', 'inactive'])],
            'position' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ];
    }

    /**
     * The schema is taken from the request as a whole, not from
     * $validated: validated() keeps only keys that have rules (here
     * fields.*.name and fields.*.type), which silently dropped every
     * label, help text, option, visual setting and repeater sub-field
     * on save. The rules above still guarantee its basic shape.
     */
    private function attributes(array $validated, Request $request): array
    {
        return [
            'name' => trim($validated['name']),
            'icon' => $validated['icon'] ?? null,
            'description' => $validated['description'] ?? null,
            'component' => $validated['component'],
            'block_category_id' => $validated['block_category_id'],
            'tags' => $this->normaliseTags($validated['tags'] ?? []),
            'configuration_schema' => $request->input('configuration_schema'),
            'example_data' => $validated['example_data'] ?? null,
            'status' => $validated['status'],
            'position' => $validated['position'] ?? 0,
        ];
    }

    /**
     * Trim tags and drop blanks and case-insensitive duplicates:
     * [" Content ", "Code", "content"] -> ["Content", "Code"].
     */
    private function normaliseTags(array $tags): array
    {
        $normalised = [];

        foreach ($tags as $tag) {
            $tag = trim($tag);

            if ($tag === '') {
                continue;
            }

            $exists = collect($normalised)->contains(
                fn ($existing) => strtolower($existing) === strtolower($tag)
            );

            if (!$exists) {
                $normalised[] = $tag;
            }
        }

        return $normalised;
    }
}
