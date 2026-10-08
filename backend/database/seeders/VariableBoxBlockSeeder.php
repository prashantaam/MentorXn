<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Variable Box" block (from Code Quest): students type a
 * variable name and a value, press Assign it, and see the line of
 * code, the type the language works out by itself, and a shelf of
 * the boxes made so far. Invalid or reserved names get an error.
 *
 * Frontend: VariableBoxBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=VariableBoxBlockSeeder
 */
class VariableBoxBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'code')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'VariableBoxBlock'],
            [
                'name' => 'Variable Box',
                'icon' => '📦',
                'description' => 'A variables playground: students name a box, give it a value and see the code, the type the language works out by itself, and a shelf of their boxes. Invalid or reserved names get a friendly error.',
                'block_category_id' => $categoryId,
                'tags' => ['variables', 'data types', 'assignment', 'python', 'javascript'],
                'status' => 'active',
                'position' => 24,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Variable Box',
                            'required' => true,
                            'visual' => [
                                'selector' => '.variable-box-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '📦',
                            'required' => false,
                            'visual' => [
                                'selector' => '.variable-box-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Name a box, give it a value, and see what type it becomes.',
                            'visual' => [
                                'selector' => '.variable-box-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'language',
                            'label' => 'Language',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'python',
                            'help' => 'Changes the code and the type names (e.g. int / str in Python, "number" / "string" in JavaScript).',
                            'options' => [
                                ['value' => 'python', 'label' => 'Python'],
                                ['value' => 'javascript', 'label' => 'JavaScript'],
                            ],
                        ],
                        [
                            'name' => 'default_name',
                            'label' => 'Starting box name',
                            'type' => 'text',
                            'default' => 'age',
                            'required' => false,
                            'help' => 'The first box is assigned when the page loads.',
                            'visual' => ['selector' => '.variable-box-block .form'],
                        ],
                        [
                            'name' => 'default_value',
                            'label' => 'Starting value',
                            'type' => 'text',
                            'default' => '8',
                            'required' => false,
                            'help' => 'Numbers, True/False (true/false in JavaScript), [lists] or any text.',
                            'visual' => ['selector' => '.variable-box-block .form'],
                        ],
                        [
                            'name' => 'max_boxes',
                            'label' => 'Boxes kept on the shelf',
                            'type' => 'number',
                            'default' => 6,
                            'min' => 1,
                            'max' => 12,
                            'step' => 1,
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Variable Box',
                    'icon' => '📦',
                    'subtitle' => 'Name a box, give it a value, and see what type it becomes.',
                    'language' => 'python',
                    'default_name' => 'age',
                    'default_value' => '8',
                    'max_boxes' => 6,
                ],
            ]
        );
    }
}
