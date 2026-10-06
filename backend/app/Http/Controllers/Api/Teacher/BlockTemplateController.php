<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Http\JsonResponse;

/**
 * Read-only block templates for teachers (the block library in the
 * visual block editor). Creating, editing and deleting templates is
 * developer-only: see Api\Dev\BlockTemplateController.
 */
class BlockTemplateController extends Controller
{
    /**
     * Active templates and the active categories they're grouped under,
     * both in library order.
     */
    public function index(): JsonResponse
    {
        $templates = BlockTemplate::query()
            ->with('blockCategory')
            ->where('status', 'active')
            ->orderBy('position')
            ->orderBy('name')
            ->get();

        return response()->json([
            'block_templates' => $templates,
            'block_categories' => BlockCategory::active()->ordered()->get(),
        ]);
    }

    /**
     * One template (also inactive ones, so existing blocks that use a
     * deactivated template can still be opened).
     */
    public function show(
        BlockTemplate $blockTemplate
    ): JsonResponse {
        return response()->json([
            'block_template' => $blockTemplate->load('blockCategory'),
        ]);
    }
}
