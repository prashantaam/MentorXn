<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Operators: math, comparison & logic" block (from Code Quest):
 * three small playgrounds — arithmetic, comparison and boolean logic
 * — each showing a live line of code and its result, in Python or
 * JavaScript syntax.
 *
 * Frontend: OperatorsBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=OperatorsBlockSeeder
 */
class OperatorsBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'code')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'OperatorsBlock'],
            [
                'name' => 'Operators: math, comparison & logic',
                'icon' => '➕',
                'description' => 'Three small playgrounds — arithmetic, comparison and boolean logic — where students change the values and operator and watch the line of code and its result update live.',
                'block_category_id' => $categoryId,
                'tags' => ['operators', 'arithmetic', 'comparison', 'boolean', 'logic', 'python', 'javascript'],
                'status' => 'active',
                'position' => 25,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Operators: math, comparison & logic',
                            'required' => true,
                            'visual' => [
                                'selector' => '.operators-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '➕',
                            'required' => false,
                            'visual' => [
                                'selector' => '.operators-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Change the values and operators and watch the result.',
                            'visual' => [
                                'selector' => '.operators-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'language',
                            'label' => 'Language',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'python',
                            'help' => 'Changes the code syntax and results (e.g. True vs true, and vs &&, 7 / 7 = 1.0 in Python).',
                            'options' => [
                                ['value' => 'python', 'label' => 'Python'],
                                ['value' => 'javascript', 'label' => 'JavaScript'],
                            ],
                        ],
                        [
                            'name' => 'show_arithmetic',
                            'label' => 'Show arithmetic (+ - * / %)',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                        [
                            'name' => 'arithmetic_a',
                            'label' => 'Arithmetic: starting a',
                            'type' => 'number',
                            'default' => 7,
                            'required' => false,
                            'show_when' => ['field' => 'show_arithmetic', 'equals' => true],
                            'visual' => ['selector' => '.operators-block__arith'],
                        ],
                        [
                            'name' => 'arithmetic_b',
                            'label' => 'Arithmetic: starting b',
                            'type' => 'number',
                            'default' => 2,
                            'required' => false,
                            'show_when' => ['field' => 'show_arithmetic', 'equals' => true],
                            'visual' => ['selector' => '.operators-block__arith'],
                        ],
                        [
                            'name' => 'show_comparison',
                            'label' => 'Show comparison (== != < > <= >=)',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                        [
                            'name' => 'comparison_a',
                            'label' => 'Comparison: starting a',
                            'type' => 'number',
                            'default' => 5,
                            'required' => false,
                            'show_when' => ['field' => 'show_comparison', 'equals' => true],
                            'visual' => ['selector' => '.operators-block__compare'],
                        ],
                        [
                            'name' => 'comparison_b',
                            'label' => 'Comparison: starting b',
                            'type' => 'number',
                            'default' => 5,
                            'required' => false,
                            'show_when' => ['field' => 'show_comparison', 'equals' => true],
                            'visual' => ['selector' => '.operators-block__compare'],
                        ],
                        [
                            'name' => 'show_logic',
                            'label' => 'Show boolean logic (and / or / not)',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Operators: math, comparison & logic',
                    'icon' => '➕',
                    'subtitle' => 'Change the values and operators and watch the result.',
                    'language' => 'python',
                    'show_arithmetic' => true,
                    'arithmetic_a' => 7,
                    'arithmetic_b' => 2,
                    'show_comparison' => true,
                    'comparison_a' => 5,
                    'comparison_b' => 5,
                    'show_logic' => true,
                ],
            ]
        );
    }
}
