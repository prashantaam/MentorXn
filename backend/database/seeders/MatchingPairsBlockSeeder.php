<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Matching pairs" block: two shuffled columns; tap one item from
 * each side to pair them. Wrong pairs flash red and reset; matched
 * pairs lock in green. Same as the Block Library's Matching pairs.
 *
 * Frontend: MatchingPairsBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=MatchingPairsBlockSeeder
 */
class MatchingPairsBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'manipulation')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'MatchingPairsBlock'],
            [
                'name' => 'Matching pairs',
                'icon' => '🔗',
                'description' => 'Two shuffled columns; tap one item from each side to pair them. Wrong pairs flash red and reset; matched pairs lock in green.',
                'block_category_id' => $categoryId,
                'tags' => ['match', 'pairs', 'connect', 'vocabulary', 'quiz'],
                'status' => 'active',
                'position' => 35,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Matching pairs',
                            'required' => true,
                            'visual' => [
                                'selector' => '.matching-pairs-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🔗',
                            'required' => false,
                            'visual' => [
                                'selector' => '.matching-pairs-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap a colour, then the fruit it matches.',
                            'visual' => [
                                'selector' => '.matching-pairs-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'pairs',
                            'label' => 'Pairs',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 2,
                            'item_label' => 'Pair',
                            'help' => 'Each left item matches the right item in the same pair. Both columns are shuffled for students.',
                            'visual' => [
                                'selector' => '.matching-pairs-block .matchitem',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'left',
                                    'label' => 'Left',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Red',
                                ],
                                [
                                    'name' => 'right',
                                    'label' => 'Right',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Apple',
                                ],
                            ],
                        ],
                        [
                            'name' => 'left_label',
                            'label' => 'Left column heading',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Colour',
                        ],
                        [
                            'name' => 'right_label',
                            'label' => 'Right column heading',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Fruit',
                        ],
                        [
                            'name' => 'shuffle',
                            'label' => 'Shuffle both columns',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                        [
                            'name' => 'complete_message',
                            'label' => 'Completion message',
                            'type' => 'text',
                            'default' => '🎉 All matched!',
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Match the colour to the fruit',
                    'icon' => '🔗',
                    'subtitle' => 'Tap a colour, then the fruit it matches.',
                    'pairs' => [
                        ['left' => 'Red', 'right' => 'Apple'],
                        ['left' => 'Yellow', 'right' => 'Banana'],
                        ['left' => 'Purple', 'right' => 'Grape'],
                        ['left' => 'Orange', 'right' => 'Orange'],
                    ],
                    'left_label' => 'Colour',
                    'right_label' => 'Fruit',
                    'shuffle' => true,
                    'complete_message' => '🎉 All matched!',
                ],
            ]
        );
    }
}
