<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Word bank (cloze fill-in)" block: a sentence with blanks plus a
 * bank of word chips (including a distractor or two) — tap a word
 * to drop it into the next blank. Same as the Block Library's
 * Word bank.
 *
 * Frontend: WordBankBlock (component). Messages are added to every
 * block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=WordBankBlockSeeder
 */
class WordBankBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'assessment')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'WordBankBlock'],
            [
                'name' => 'Word bank (cloze fill-in)',
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
                            'default' => 'Word bank',
                            'required' => true,
                            'visual' => [
                                'selector' => '.word-bank-block > h2',
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
                                'selector' => '.word-bank-block > h2',
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
                                'selector' => '.word-bank-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'sentence',
                            'label' => 'Sentence',
                            'type' => 'textarea',
                            'required' => true,
                            'rows' => 3,
                            'placeholder' => 'The {{cat}} sat on the {{mat}}.',
                            'help' => 'Wrap each missing word in {{ }} — it becomes a blank and its word goes into the bank. Supports **bold** and `code`.',
                            'visual' => [
                                'selector' => '.word-bank-block__sentence',
                            ],
                        ],
                        [
                            'name' => 'distractors',
                            'label' => 'Extra wrong words',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. dog, hat',
                            'help' => 'Comma separated. Added to the bank to make it harder.',
                            'visual' => [
                                'selector' => '.word-bank-block__bank',
                            ],
                        ],
                        [
                            'name' => 'shuffle_bank',
                            'label' => 'Shuffle the word bank',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
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
                            'default' => 'Not quite — tap a red word to send it back, then try again.',
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Complete the sentence',
                    'icon' => '🧺',
                    'subtitle' => 'Tap the words to fill the blanks, then press Check.',
                    'sentence' => 'The {{cat}} sat on the {{mat}}.',
                    'distractors' => 'dog, hat',
                    'shuffle_bank' => true,
                    'correct_message' => '🎉 Correct!',
                    'incorrect_message' => 'Not quite — tap a red word to send it back, then try again.',
                ],
            ]
        );
    }
}
