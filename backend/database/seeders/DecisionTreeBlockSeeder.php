<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Decision tree / branching scenario" block: a sequence of choices
 * where each pick leads to a DIFFERENT next situation, ending in one
 * of several outcomes — for judgment-based practice, not single-step
 * recall. Same as the Block Library's Decision tree.
 *
 * Frontend: DecisionTreeBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=DecisionTreeBlockSeeder
 */
class DecisionTreeBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'DecisionTreeBlock'],
            [
                'name' => 'Decision tree / branching scenario',
                'icon' => '🌳',
                'description' => 'A sequence of choices where each pick leads to a DIFFERENT next situation, ending in one of several outcomes — for judgment-based practice, not single-step recall.',
                'block_category_id' => $categoryId,
                'tags' => ['scenario', 'branching', 'decision', 'judgment', 'choose your path'],
                'status' => 'active',
                'position' => 56,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'What would you do?',
                            'required' => true,
                            'visual' => [
                                'selector' => '.decision-tree-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🌳',
                            'required' => false,
                            'visual' => [
                                'selector' => '.decision-tree-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Pick what you would do and see where it leads.',
                            'visual' => [
                                'selector' => '.decision-tree-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'steps',
                            'label' => 'Steps',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 2,
                            'item_label' => 'Step',
                            'help' => 'Students start at the first step. Each choice points to the key of the step it leads to. A step with no choices is an ending.',
                            'visual' => [
                                'selector' => '.decision-tree-block__node',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'key',
                                    'label' => 'Key',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. ask',
                                    'help' => 'A short name other steps use to point here.',
                                ],
                                [
                                    'name' => 'text',
                                    'label' => 'Situation',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'What happens at this step. Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'choices',
                                    'label' => 'Choices',
                                    'type' => 'repeater',
                                    'required' => false,
                                    'item_label' => 'Choice',
                                    'help' => 'Leave empty to make this step an ending.',
                                    'fields' => [
                                        [
                                            'name' => 'label',
                                            'label' => 'Choice',
                                            'type' => 'text',
                                            'required' => true,
                                            'placeholder' => 'e.g. Ask them about it',
                                        ],
                                        [
                                            'name' => 'next',
                                            'label' => 'Goes to step (key)',
                                            'type' => 'text',
                                            'required' => true,
                                            'placeholder' => 'e.g. ask',
                                        ],
                                    ],
                                ],
                                [
                                    'name' => 'outcome',
                                    'label' => 'Ending type',
                                    'type' => 'select',
                                    'required' => false,
                                    'default' => 'neutral',
                                    'help' => 'Only used when the step has no choices.',
                                    'options' => [
                                        ['value' => 'neutral', 'label' => 'Neutral'],
                                        ['value' => 'good', 'label' => 'Good outcome'],
                                        ['value' => 'bad', 'label' => 'Bad outcome'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Failing tests',
                    'icon' => '🌳',
                    'subtitle' => 'Pick what you would do and see where it leads.',
                    'steps' => [
                        [
                            'key' => 'start',
                            'text' => 'A teammate\'s pull request has **failing tests**. What do you do first?',
                            'choices' => [
                                ['label' => 'Ask them about it', 'next' => 'ask'],
                                ['label' => 'Merge it anyway', 'next' => 'merge'],
                            ],
                            'outcome' => 'neutral',
                        ],
                        [
                            'key' => 'ask',
                            'text' => 'They say the test looks flaky. What next?',
                            'choices' => [
                                ['label' => 'Re-run the tests', 'next' => 'rerun'],
                                ['label' => 'Ignore it and approve', 'next' => 'approve'],
                            ],
                            'outcome' => 'neutral',
                        ],
                        [
                            'key' => 'merge',
                            'text' => 'A broken build reaches everyone else on the team.',
                            'choices' => [],
                            'outcome' => 'bad',
                        ],
                        [
                            'key' => 'approve',
                            'text' => 'It turns out NOT to be flaky — now production is broken too.',
                            'choices' => [],
                            'outcome' => 'bad',
                        ],
                        [
                            'key' => 'rerun',
                            'text' => 'The re-run confirms it was a real bug, caught before merging.',
                            'choices' => [],
                            'outcome' => 'good',
                        ],
                    ],
                ],
            ]
        );
    }
}
