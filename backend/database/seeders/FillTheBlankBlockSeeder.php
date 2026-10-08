<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Fill the blank" block (was "Word bank (cloze fill-in)"): a sentence with blanks plus a
 * bank of word chips (including a distractor or two) — tap a word
 * to drop it into the next blank. Same as the Block Library's
 * Word bank. The sentence can show in a dark box, like Word
 * Quest's "Pick the correct form".
 *
 * Frontend: FillTheBlankBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=FillTheBlankBlockSeeder
 */
class FillTheBlankBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        // The component used to be WordBankBlock: rename that row
        // (keeping its id) instead of adding a second template.
        BlockTemplate::where('component', 'WordBankBlock')
            ->update(['component' => 'FillTheBlankBlock']);

        BlockTemplate::updateOrCreate(
            ['component' => 'FillTheBlankBlock'],
            [
                'name' => 'Fill the blank',
                'icon' => '🧺',
                'description' => 'A sentence with blanks, plus a bank of word chips below (including a distractor or two) — tap a word to drop it into the next blank, in order.',
                'block_category_id' => $categoryId,
                'tags' => ['cloze', 'fill in', 'blanks', 'word bank', 'quiz'],
                'status' => 'active',
                'position' => 52,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Fill the blank',
                            'required' => true,
                            'visual' => [
                                'selector' => '.fill-the-blank-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🧺',
                            'required' => false,
                            'visual' => [
                                'selector' => '.fill-the-blank-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap the words to fill the blanks.',
                            'visual' => [
                                'selector' => '.fill-the-blank-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'answer_style',
                            'label' => 'How students answer',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'bank',
                            'options' => [
                                ['value' => 'bank', 'label' => 'Choose from a word bank'],
                                ['value' => 'typed', 'label' => 'Type the missing words'],
                            ],
                        ],
                        [
                            'name' => 'sentence_count',
                            'label' => 'Sentences',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'multiple',
                            'options' => [
                                ['value' => 'single', 'label' => 'Single sentence'],
                                ['value' => 'multiple', 'label' => 'Multiple sentences'],
                            ],
                            'help' => 'Single uses only the first sentence below.',
                        ],
                        [
                            'name' => 'layout',
                            'label' => 'Show the sentences',
                            'type' => 'select',
                            'required' => false,
                            'default' => 'one_by_one',
                            'options' => [
                                ['value' => 'one_by_one', 'label' => 'One by one (Next sentence)'],
                                ['value' => 'all', 'label' => 'All at once (one Check for all)'],
                            ],
                            'show_when' => ['field' => 'sentence_count', 'equals' => 'multiple'],
                        ],
                        [
                            'name' => 'sentences',
                            'label' => 'Sentences',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Sentence',
                            'help' => 'Shown one by one (Next sentence, with a first-try score at the end) or all at once — see "Show the sentences".',
                            'visual' => [
                                'selector' => '.fill-the-blank-block__item',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'sentence',
                                    'label' => 'Sentence',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'Look! It {{is raining}} (rain) outside.',
                                    'help' => 'Wrap each missing word in {{ }}. When typing, add other accepted answers with |, e.g. {{is raining|\'s raining}} (the word bank uses the first). Supports **bold** and `code`.',
                                ],
                                [
                                    'name' => 'distractors',
                                    'label' => 'Extra wrong words',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. rains',
                                    'help' => 'Word bank only. Comma separated — added to the bank to make it harder.',
                                ],
                                [
                                    'name' => 'why',
                                    'label' => 'Explanation (after a correct answer)',
                                    'type' => 'textarea',
                                    'rows' => 2,
                                    'required' => false,
                                    'placeholder' => 'e.g. Something happening right now → present continuous.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'dark_sentence',
                            'label' => 'Show the sentence in a dark box',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                            'help' => 'Like Word Quest\'s "Pick the correct form". **Bold** words show in yellow.',
                        ],
                        [
                            'name' => 'shuffle_bank',
                            'label' => 'Shuffle the word bank',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                            'show_when' => ['field' => 'answer_style', 'equals' => 'bank'],
                        ],
                        [
                            'name' => 'correct_message',
                            'label' => 'Correct message',
                            'type' => 'text',
                            'default' => '🎉 Correct!',
                            'required' => false,
                        ],
                        [
                            'name' => 'incorrect_message',
                            'label' => 'Incorrect message',
                            'type' => 'text',
                            'default' => 'Not quite — change the red words, then check again.',
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Complete the sentence',
                    'icon' => '🧺',
                    'subtitle' => 'Tap the words to fill the blanks, then press Check.',
                    'answer_style' => 'bank',
                    'sentence_count' => 'multiple',
                    'layout' => 'one_by_one',
                    'sentences' => [
                        [
                            'sentence' => 'The {{cat}} sat on the {{mat}}.',
                            'distractors' => 'dog, hat',
                            'why' => '',
                        ],
                        [
                            'sentence' => 'Look! It {{is raining}} (rain) outside.',
                            'distractors' => 'rains',
                            'why' => 'Something happening right now → present continuous.',
                        ],
                    ],
                    'shuffle_bank' => true,
                    'dark_sentence' => false,
                    'correct_message' => '🎉 Correct!',
                    'incorrect_message' => 'Not quite — change the red words, then check again.',
                ],
            ]
        );
    }
}
