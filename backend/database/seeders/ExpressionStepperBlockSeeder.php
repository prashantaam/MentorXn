<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Step through an expression" block (from Math Quest): pick an
 * expression, then press Next step to rewrite it one step at a time.
 * Each step adds a line to a code panel with a note underneath —
 * order of operations, simplifying, solving equations.
 *
 * Frontend: ExpressionStepperBlock (component). Messages are added
 * to every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=ExpressionStepperBlockSeeder
 */
class ExpressionStepperBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'process')->value('id');

        $step = fn (string $state, string $note) => ['state' => $state, 'note' => $note];

        BlockTemplate::updateOrCreate(
            ['component' => 'ExpressionStepperBlock'],
            [
                'name' => 'Step through an expression',
                'icon' => '🧮',
                'description' => 'Pick an expression, then press Next step to rewrite it one step at a time — each line builds on the last, with a note explaining the move. Great for order of operations, simplifying and solving equations.',
                'block_category_id' => $categoryId,
                'tags' => ['maths', 'expression', 'steps', 'pemdas', 'equation', 'algebra'],
                'status' => 'active',
                'position' => 63,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Step through an expression',
                            'required' => true,
                            'visual' => [
                                'selector' => '.expression-stepper-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🧮',
                            'required' => false,
                            'visual' => [
                                'selector' => '.expression-stepper-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Pick an expression, then press Next step.',
                            'visual' => [
                                'selector' => '.expression-stepper-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'expressions',
                            'label' => 'Expressions',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Expression',
                            'help' => 'With more than one, students switch between them with chips.',
                            'visual' => [
                                'selector' => '.expression-stepper-block__out',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'label',
                                    'label' => 'Chip label (optional)',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'Defaults to the first step',
                                ],
                                [
                                    'name' => 'steps',
                                    'label' => 'Steps',
                                    'type' => 'repeater',
                                    'required' => true,
                                    'min_items' => 2,
                                    'item_label' => 'Step',
                                    'help' => 'The first step is the starting expression; each next step rewrites it.',
                                    'fields' => [
                                        [
                                            'name' => 'state',
                                            'label' => 'Expression',
                                            'type' => 'text',
                                            'required' => true,
                                            'placeholder' => 'e.g. 3 + 8',
                                        ],
                                        [
                                            'name' => 'note',
                                            'label' => 'Note',
                                            'type' => 'text',
                                            'required' => false,
                                            'placeholder' => 'e.g. 4 × 2 = 8, so now just add.',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Step through an expression',
                    'icon' => '🧮',
                    'subtitle' => 'Pick an expression, then press Next step.',
                    'expressions' => [
                        [
                            'label' => '',
                            'steps' => [
                                $step('3 + 4 × 2', 'Multiplication happens before addition.'),
                                $step('3 + 8', '4 × 2 = 8, so now just add.'),
                                $step('11', '3 + 8 = 11 — done!'),
                            ],
                        ],
                        [
                            'label' => '',
                            'steps' => [
                                $step('(2 + 3) × 4', 'Parentheses always go first, even though it\'s addition.'),
                                $step('5 × 4', '2 + 3 = 5.'),
                                $step('20', '5 × 4 = 20 — done!'),
                            ],
                        ],
                        [
                            'label' => '',
                            'steps' => [
                                $step('2 + 3² × 2', 'Exponents come before multiplication.'),
                                $step('2 + 9 × 2', '3² = 9.'),
                                $step('2 + 18', '9 × 2 = 18.'),
                                $step('20', '2 + 18 = 20 — done!'),
                            ],
                        ],
                    ],
                ],
            ]
        );
    }
}
