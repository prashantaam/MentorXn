<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Q&A" block (was "Fill in the blanks"): questions with an answer
 * box; typed answers are checked against one or more accepted
 * answers — for recall questions multiple choice would make too
 * easy. Blanks inside a sentence live in "Fill the blank".
 *
 * Frontend: QandABlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=QandABlockSeeder
 */
class QandABlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        // The component used to be FillBlanksBlock: rename that row
        // (keeping its id) instead of adding a second template.
        BlockTemplate::where('component', 'FillBlanksBlock')
            ->update(['component' => 'QandABlock']);

        BlockTemplate::updateOrCreate(
            ['component' => 'QandABlock'],
            [
                'name' => 'Q&A',
                'icon' => '✏️',
                'description' => 'Questions with an answer box. Students type their answers, checked against one or more accepted answers — for recall questions multiple choice would make too easy.',
                'block_category_id' => $categoryId,
                'tags' => ['q&a', 'question and answer', 'typed answer', 'question', 'recall', 'quiz'],
                'status' => 'active',
                'position' => 53,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Q&A',
                            'required' => true,
                            'visual' => [
                                'selector' => '.q-and-a-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '✏️',
                            'required' => false,
                            'visual' => [
                                'selector' => '.q-and-a-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Type your answers, then press Check.',
                            'visual' => [
                                'selector' => '.q-and-a-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'items',
                            'label' => 'Questions',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Question',
                            'visual' => [
                                'selector' => '.q-and-a-block__item',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'text',
                                    'label' => 'Question',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'What is the opposite of "hot"?',
                                    'help' => 'Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'answers',
                                    'label' => 'Accepted answers',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. cold|freezing',
                                    'help' => 'Separate answers with |. Any of them counts as correct.',
                                ],
                                [
                                    'name' => 'explanation',
                                    'label' => 'Explanation',
                                    'type' => 'textarea',
                                    'required' => false,
                                    'rows' => 2,
                                    'placeholder' => 'Shown with the correct answer. Supports **bold** and `code`.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'case_sensitive',
                            'label' => 'Capital letters must match',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                            'help' => 'Off: "Paris" and "paris" both count. Extra spaces are always ignored.',
                        ],
                        [
                            'name' => 'show_answer',
                            'label' => 'Offer "Show answer" after a wrong check',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Quick questions',
                    'icon' => '✏️',
                    'subtitle' => 'Type your answers, then press Check.',
                    'items' => [
                        [
                            'text' => 'At what temperature (°C) does water freeze?',
                            'answers' => '0|zero',
                            'explanation' => 'At sea level, on the **Celsius** scale.',
                        ],
                        [
                            'text' => 'What is the opposite of "hot"?',
                            'answers' => 'cold|freezing',
                            'explanation' => '',
                        ],
                    ],
                    'case_sensitive' => false,
                    'show_answer' => true,
                ],
            ]
        );
    }
}
