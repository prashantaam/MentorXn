<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Progressive hint ladder" block: instead of showing everything at
 * once, each "Give me a hint" reveals ONE more, increasingly specific
 * hint — preserving some challenge. Same as the Block Library's
 * Progressive hint ladder, with an optional answer at the end.
 *
 * Frontend: HintLadderBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=HintLadderBlockSeeder
 */
class HintLadderBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'HintLadderBlock'],
            [
                'name' => 'Progressive hint ladder',
                'icon' => '🪢',
                'description' => 'Instead of showing everything at once, each click on "Give me a hint" reveals ONE more, increasingly specific hint — preserves some challenge.',
                'block_category_id' => $categoryId,
                'tags' => ['hints', 'scaffolding', 'question', 'challenge', 'problem solving'],
                'status' => 'active',
                'position' => 55,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Need a hint?',
                            'required' => true,
                            'visual' => [
                                'selector' => '.hint-ladder-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🪢',
                            'required' => false,
                            'visual' => [
                                'selector' => '.hint-ladder-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Try it yourself first — use hints only if you get stuck.',
                            'visual' => [
                                'selector' => '.hint-ladder-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'question',
                            'label' => 'Question',
                            'type' => 'textarea',
                            'required' => true,
                            'rows' => 2,
                            'placeholder' => 'e.g. What data structure gives the fastest lookup by key?',
                            'help' => 'Supports **bold** and `code`.',
                            'visual' => [
                                'selector' => '.hint-ladder-block__question',
                            ],
                        ],
                        [
                            'name' => 'hints',
                            'label' => 'Hints',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Hint',
                            'help' => 'From least to most specific. Students reveal them one at a time.',
                            'visual' => [
                                'selector' => '.hint-ladder-block__hint',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'text',
                                    'label' => 'Hint',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 2,
                                    'placeholder' => 'e.g. Think about structures that map a key directly to a value.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'answer',
                            'label' => 'Answer (optional)',
                            'type' => 'textarea',
                            'required' => false,
                            'rows' => 2,
                            'placeholder' => 'Revealed with "Show the answer" after the last hint.',
                            'visual' => [
                                'selector' => '.hint-ladder-block__answer',
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Need a hint?',
                    'icon' => '🪢',
                    'subtitle' => 'Try it yourself first — use hints only if you get stuck.',
                    'question' => 'What data structure gives the fastest lookup by key?',
                    'hints' => [
                        ['text' => 'Think about structures that map a **key** directly to a **value**.'],
                        ['text' => 'It is NOT an array or a plain list.'],
                        ['text' => 'In Python it is written with curly braces: `{"name": "Asha"}`.'],
                    ],
                    'answer' => 'A **hash map** (also called a dictionary or object).',
                ],
            ]
        );
    }
}
