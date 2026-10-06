<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "True / False check" block: a lightweight binary-choice variant of
 * the quiz block — quick comprehension checks without a full options
 * list. Same as the Block Library's True / False check, with room for
 * several statements in one block.
 *
 * Frontend: TrueFalseBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=TrueFalseBlockSeeder
 */
class TrueFalseBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'TrueFalseBlock'],
            [
                'name' => 'True / False check',
                'icon' => '✅',
                'description' => 'A lightweight binary-choice variant of the quiz block — quick comprehension checks without a full options list.',
                'block_category_id' => $categoryId,
                'tags' => ['true', 'false', 'quiz', 'check', 'comprehension'],
                'status' => 'active',
                'position' => 51,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'True or false?',
                            'required' => true,
                            'visual' => [
                                'selector' => '.true-false-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '✅',
                            'required' => false,
                            'visual' => [
                                'selector' => '.true-false-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Decide whether each statement is true or false.',
                            'visual' => [
                                'selector' => '.true-false-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'statements',
                            'label' => 'Statements',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Statement',
                            'help' => 'One statement works like a single quick check; add more for a short quiz with a score.',
                            'visual' => [
                                'selector' => '.true-false-block__item',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'statement',
                                    'label' => 'Statement',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 2,
                                    'placeholder' => 'e.g. Water boils at 100°C at sea level.',
                                    'help' => 'Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'answer',
                                    'label' => 'Correct answer',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => 'true',
                                    'options' => [
                                        ['value' => 'true', 'label' => 'True'],
                                        ['value' => 'false', 'label' => 'False'],
                                    ],
                                ],
                                [
                                    'name' => 'why',
                                    'label' => 'Explanation',
                                    'type' => 'textarea',
                                    'required' => false,
                                    'rows' => 2,
                                    'placeholder' => 'Shown after answering, e.g. at standard atmospheric pressure.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'allow_retry',
                            'label' => 'Let students try again after a wrong answer',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'True or false?',
                    'icon' => '✅',
                    'subtitle' => 'Decide whether each statement is true or false.',
                    'statements' => [
                        ['statement' => 'Water boils at 100°C at sea level.', 'answer' => 'true', 'why' => 'at standard atmospheric pressure, water boils at exactly 100°C.'],
                        ['statement' => 'The Sun orbits the Earth.', 'answer' => 'false', 'why' => 'the **Earth** orbits the Sun, once a year.'],
                    ],
                    'allow_retry' => false,
                ],
            ]
        );
    }
}
