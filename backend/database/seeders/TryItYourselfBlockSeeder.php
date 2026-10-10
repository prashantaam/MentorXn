<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Try it yourself" block (Word Quest's "✍️ Try it yourself"): a
 * sentence built from parts, each with an answer control in it —
 * a dropdown, a text box, radio buttons or checkboxes. Feedback as
 * soon as every part is answered, or with a Check button. The
 * sentence can sit in a black box.
 *
 * Frontend: TryItYourselfBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=TryItYourselfBlockSeeder
 */
class TryItYourselfBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'TryItYourselfBlock'],
            [
                'name' => 'Try it yourself',
                'icon' => '✍️',
                'description' => 'A sentence with answer controls in it — dropdowns, text boxes, radio buttons or checkboxes. Students get feedback as soon as every part is answered (or with a Check button). The sentence can sit in a black box.',
                'block_category_id' => $categoryId,
                'tags' => ['try it', 'practice', 'dropdown', 'fill in', 'radio', 'checkbox', 'grammar'],
                'status' => 'active',
                'position' => 58,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Try it yourself',
                            'required' => true,
                            'visual' => [
                                'selector' => '.try-it-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '✍️',
                            'required' => false,
                            'visual' => [
                                'selector' => '.try-it-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'e.g. Pick the right form of each verb.',
                            'visual' => [
                                'selector' => '.try-it-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'dark_box',
                            'label' => 'Dark box',
                            'checkbox_label' => 'Show the sentence in a dark box',
                            'type' => 'boolean',
                            'required' => false,
                            'default' => false,
                        ],
                        [
                            'name' => 'parts',
                            'label' => 'Parts of the sentence',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Part',
                            'help' => 'In order. Each part is: text before · an answer control · text after.',
                            'visual' => [
                                'selector' => '.try-it-block__part',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'before',
                                    'label' => 'Text before',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. While I ___ (cook) dinner',
                                ],
                                [
                                    'name' => 'control',
                                    'label' => 'Answer control',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => 'dropdown',
                                    'options' => [
                                        ['value' => 'dropdown', 'label' => 'Dropdown — pick one'],
                                        ['value' => 'input', 'label' => 'Text box — type the answer'],
                                        ['value' => 'radio', 'label' => 'Radio buttons — pick one'],
                                        ['value' => 'checkbox', 'label' => 'Checkboxes — pick all that apply'],
                                    ],
                                ],
                                [
                                    'name' => 'options',
                                    'label' => 'Options',
                                    'type' => 'textarea',
                                    'rows' => 3,
                                    'required' => false,
                                    'placeholder' => "cooked\n*was cooking",
                                    'help' => 'One per line. Put * in front of the correct one (checkboxes: every correct one).',
                                    'show_when' => [
                                        'field' => 'control',
                                        'not_equals' => 'input',
                                    ],
                                ],
                                [
                                    'name' => 'answers',
                                    'label' => 'Accepted answers',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. was cooking|was making',
                                    'help' => 'Separate answers with |. Capital letters and extra spaces don\'t matter.',
                                    'show_when' => [
                                        'field' => 'control',
                                        'equals' => 'input',
                                    ],
                                ],
                                [
                                    'name' => 'after',
                                    'label' => 'Text after',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. ,',
                                ],
                            ],
                        ],
                        [
                            'name' => 'check_mode',
                            'label' => 'When to give feedback',
                            'type' => 'select',
                            'required' => false,
                            'default' => 'live',
                            'options' => [
                                ['value' => 'live', 'label' => 'As soon as every part is answered'],
                                ['value' => 'button', 'label' => 'When the student presses Check'],
                            ],
                        ],
                        [
                            'name' => 'correct_message',
                            'label' => 'Correct message',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'default' => '✅ Correct!',
                            'help' => 'Supports **bold**, `code` and labels like [[g:past simple]].',
                            'visual' => [
                                'selector' => '.try-it-block__result.is-right',
                            ],
                        ],
                        [
                            'name' => 'incorrect_message',
                            'label' => 'Try-again message',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'default' => 'Not quite — change the red answers and try again.',
                            'visual' => [
                                'selector' => '.try-it-block__result.is-wrong',
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Try it yourself',
                    'icon' => '✍️',
                    'subtitle' => '',
                    'dark_box' => false,
                    'parts' => [
                        [
                            'before' => 'While I ___ (cook) dinner',
                            'control' => 'dropdown',
                            'options' => "cooked\n*was cooking",
                            'answers' => '',
                            'after' => '',
                        ],
                        [
                            'before' => 'the smoke alarm ___ (go off)',
                            'control' => 'dropdown',
                            'options' => "*went off\nwas going off",
                            'answers' => '',
                            'after' => '.',
                        ],
                    ],
                    'check_mode' => 'live',
                    'correct_message' => '✅ Correct! The longer background action uses past continuous; the shorter interrupting action uses past simple.',
                    'incorrect_message' => 'Try again — think about which action was already IN PROGRESS, and which one happened suddenly.',
                ],
            ]
        );
    }
}
