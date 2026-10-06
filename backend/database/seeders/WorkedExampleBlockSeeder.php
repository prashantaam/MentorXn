<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Explain step by step" block (the Block Library's worked-example
 * stepper): reveals a solution one step at a time, with a running
 * "current state" — for arithmetic or logic worked examples, as
 * opposed to the abstract stages of Process Flow.
 *
 * Frontend: WorkedExampleBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=WorkedExampleBlockSeeder
 */
class WorkedExampleBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'process')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'WorkedExampleBlock'],
            [
                'name' => 'Explain step by step',
                'icon' => '📝',
                'description' => 'Reveals a multi-step solution one step at a time, with the running "current state" shown — for arithmetic or logic worked examples, as opposed to the abstract stages of Process Flow.',
                'block_category_id' => $categoryId,
                'tags' => ['worked example', 'steps', 'solution', 'maths', 'walkthrough'],
                'status' => 'active',
                'position' => 62,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Explain step by step',
                            'required' => true,
                            'visual' => [
                                'selector' => '.worked-example-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '📝',
                            'required' => false,
                            'visual' => [
                                'selector' => '.worked-example-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Press Next to see each step.',
                            'visual' => [
                                'selector' => '.worked-example-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'problem_label',
                            'label' => 'Problem label',
                            'type' => 'text',
                            'default' => 'Solve:',
                            'required' => false,
                            'placeholder' => 'e.g. Solve:',
                            'visual' => [
                                'selector' => '.worked-example-block__problem',
                                'group' => 'problem',
                            ],
                        ],
                        [
                            'name' => 'start_state',
                            'label' => 'Starting problem',
                            'type' => 'text',
                            'required' => true,
                            'placeholder' => 'e.g. 2 + 3 × 4',
                            'help' => 'Shown before any step. Each step\'s result then replaces it.',
                            'visual' => [
                                'selector' => '.worked-example-block__problem',
                                'group' => 'problem',
                            ],
                        ],
                        [
                            'name' => 'steps',
                            'label' => 'Steps',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Step',
                            'visual' => [
                                'selector' => '.worked-example-block__step',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'action',
                                    'label' => 'What to do',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 2,
                                    'placeholder' => 'e.g. Compute 3 × 4 first.',
                                    'help' => 'Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'state',
                                    'label' => 'Result after this step',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. 2 + 12',
                                    'help' => 'Leave empty to keep the previous result.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'final_message',
                            'label' => 'Message after the last step',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. ✅ The answer is 14.',
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Order of operations',
                    'icon' => '📝',
                    'subtitle' => 'Press Next to see each step.',
                    'problem_label' => 'Solve:',
                    'start_state' => '2 + 3 × 4',
                    'steps' => [
                        ['action' => 'Multiplication happens **before** addition (order of operations).', 'state' => '2 + 3 × 4'],
                        ['action' => 'Compute 3 × 4 first.', 'state' => '2 + 12'],
                        ['action' => 'Now add.', 'state' => '14'],
                    ],
                    'final_message' => '✅ The answer is 14.',
                ],
            ]
        );
    }
}
