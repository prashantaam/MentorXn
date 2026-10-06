<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Fill in the blanks" block: typed answers checked against one or
 * more accepted answers — for recall questions multiple choice would
 * make too easy (the Block Library's Fill-in-the-blank). Each item is
 * either blanks inside a sentence, or a question with an answer box.
 *
 * Frontend: FillBlanksBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=FillBlanksBlockSeeder
 */
class FillBlanksBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'FillBlanksBlock'],
            [
                'name' => 'Fill in the blanks',
                'icon' => '✏️',
                'description' => 'Students type their answers — blanks inside a sentence, or a question with an answer box — checked against one or more accepted answers. For recall questions multiple choice would make too easy.',
                'block_category_id' => $categoryId,
                'tags' => ['fill in', 'blanks', 'typed answer', 'question', 'recall', 'quiz'],
                'status' => 'active',
                'position' => 53,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Fill in the blanks',
                            'required' => true,
                            'visual' => [
                                'selector' => '.fill-blanks-block > h2',
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
                                'selector' => '.fill-blanks-block > h2',
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
                                'selector' => '.fill-blanks-block > .sub',
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
                                'selector' => '.fill-blanks-block__item',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'mode',
                                    'label' => 'Style',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => 'inline',
                                    'options' => [
                                        ['value' => 'inline', 'label' => 'Blanks inside the sentence'],
                                        ['value' => 'question', 'label' => 'Question + answer box'],
                                    ],
                                ],
                                [
                                    'name' => 'text',
                                    'label' => 'Sentence or question',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'Water freezes at {{0|zero}} °C.',
                                    'help' => 'Blanks inside the sentence: wrap each answer in {{ }}, and use | between accepted answers, e.g. {{colour|color}}. Question + answer box: just write the question.',
                                ],
                                [
                                    'name' => 'answers',
                                    'label' => 'Accepted answers',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. cold|freezing',
                                    'help' => 'Separate answers with |. Any of them counts as correct.',
                                    'show_when' => [
                                        'field' => 'mode',
                                        'equals' => 'question',
                                    ],
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
                    'title' => 'Fill in the blanks',
                    'icon' => '✏️',
                    'subtitle' => 'Type your answers, then press Check.',
                    'items' => [
                        [
                            'mode' => 'inline',
                            'text' => 'Water freezes at {{0|zero}} °C and boils at {{100|one hundred}} °C.',
                            'answers' => '',
                            'explanation' => 'At sea level, on the **Celsius** scale.',
                        ],
                        [
                            'mode' => 'question',
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
