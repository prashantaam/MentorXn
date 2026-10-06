<?php

namespace App\Http\Controllers\Api\Dev;

use App\Http\Controllers\Controller;
use App\Models\BlockCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Manage block-library categories. Developer-only (`role:developer`).
 */
class BlockCategoryController extends Controller
{
    /** Every category (inactive too), with how many templates use each. */
    public function index(): JsonResponse
    {
        return response()->json([
            'block_categories' => BlockCategory::query()
                ->withCount('blockTemplates')
                ->ordered()
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $category = BlockCategory::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['name']),
            'position' => $validated['position'] ?? $this->nextPosition(),
        ]);

        return response()->json([
            'message' => 'Category created.',
            'block_category' => $category->loadCount('blockTemplates'),
        ], 201);
    }

    /**
     * The slug stays as created, so renaming a category doesn't change
     * any identifier other code might rely on.
     */
    public function update(Request $request, BlockCategory $blockCategory): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $blockCategory->update([
            ...$validated,
            'position' => $validated['position'] ?? $blockCategory->position,
        ]);

        return response()->json([
            'message' => 'Category saved.',
            'block_category' => $blockCategory->fresh()->loadCount('blockTemplates'),
        ]);
    }

    /** Categories that templates use can't be deleted — deactivate them instead. */
    public function destroy(BlockCategory $blockCategory): JsonResponse
    {
        $inUse = $blockCategory->blockTemplates()->count();

        if ($inUse > 0) {
            return response()->json([
                'message' => "This category has {$inUse} block "
                    . ($inUse === 1 ? 'template. Move it' : 'templates. Move them')
                    . ' to another category first, or set the category to inactive.',
                'block_templates_count' => $inUse,
            ], 409);
        }

        $blockCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:60'],
            'icon' => ['nullable', 'string', 'max:20'],
            // A hex colour like #8fd9a8 (used for the category's chip and tab).
            'color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'position' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $counter = 2;

        while (BlockCategory::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /** New categories go to the end of the library. */
    private function nextPosition(): int
    {
        return ((int) BlockCategory::max('position')) + 10;
    }
}
