<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Clickable hierarchy" block: nested levels shown as a numbered
 * list; tapping a level explains its place in the hierarchy — for
 * anything that breaks down top to bottom. Same as the Block
 * Library's Clickable hierarchy.
 *
 * Frontend: HierarchyBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=HierarchyBlockSeeder
 */
class HierarchyBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'process')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'HierarchyBlock'],
            [
                'name' => 'Clickable hierarchy',
                'icon' => '🪜',
                'description' => 'Nested levels shown as a numbered list; tapping a level explains its place in the hierarchy — for anything that breaks down top to bottom.',
                'block_category_id' => $categoryId,
                'tags' => ['hierarchy', 'levels', 'structure', 'nested', 'breakdown'],
                'status' => 'active',
                'position' => 64,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Clickable hierarchy',
                            'required' => true,
                            'visual' => [
                                'selector' => '.hierarchy-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🪜',
                            'required' => false,
                            'visual' => [
                                'selector' => '.hierarchy-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap a level to see where it fits.',
                            'visual' => [
                                'selector' => '.hierarchy-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'levels',
                            'label' => 'Levels',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 2,
                            'item_label' => 'Level',
                            'help' => 'Top level first. Levels are numbered 1, 2, 3… unless you give one an icon.',
                            'visual' => [
                                'selector' => '.hierarchy-block .lyr',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'label',
                                    'label' => 'Name',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Galaxy',
                                ],
                                [
                                    'name' => 'detail',
                                    'label' => 'Explanation',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'Its place in the hierarchy. Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'icon',
                                    'label' => 'Icon (optional)',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'Shown instead of the number',
                                ],
                            ],
                        ],
                        [
                            'name' => 'indent',
                            'label' => 'Indent each level under the one above',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                        [
                            'name' => 'prompt',
                            'label' => 'Prompt',
                            'type' => 'text',
                            'default' => '👆 Tap a level.',
                            'required' => false,
                            'help' => 'Shown in the panel until a level is tapped.',
                            'visual' => [
                                'selector' => '.hierarchy-block__panel',
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Where do you live in space?',
                    'icon' => '🪜',
                    'subtitle' => 'Tap a level to see where it fits.',
                    'levels' => [
                        ['label' => 'Universe', 'detail' => 'Everything that exists — **all** galaxies, stars and planets.', 'icon' => ''],
                        ['label' => 'Galaxy', 'detail' => 'A huge group of stars. Ours is the **Milky Way**.', 'icon' => ''],
                        ['label' => 'Solar system', 'detail' => 'One star and everything that orbits it — our Sun and its planets.', 'icon' => ''],
                        ['label' => 'Planet', 'detail' => 'A large body orbiting a star. We live on **Earth**.', 'icon' => ''],
                    ],
                    'indent' => true,
                    'prompt' => '👆 Tap a level.',
                ],
            ]
        );
    }
}
