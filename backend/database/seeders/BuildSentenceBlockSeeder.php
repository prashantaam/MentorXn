<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Build a sentence" block (from Word Quest): one row of word
 * choices per part of the sentence (Subject, Verb, Object, ...).
 * Students pick a chip per row and watch the sentence build, each
 * part in its own colour. Explore mode is free play; Challenge mode
 * asks for a particular sentence and checks each part.
 *
 * Frontend: BuildSentenceBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=BuildSentenceBlockSeeder
 */
class BuildSentenceBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'manipulation')->value('id');

        $show = fn (string $mode) => ['field' => 'mode', 'equals' => $mode];

        BlockTemplate::updateOrCreate(
            ['component' => 'BuildSentenceBlock'],
            [
                'name' => 'Build a sentence',
                'icon' => '🏗️',
                'description' => 'Pick a word for each part of the sentence (Subject, Verb, Object, ...) and watch it build, every part in its own colour. Explore freely, or set challenges that check each part.',
                'block_category_id' => $categoryId,
                'tags' => ['sentence', 'grammar', 'subject verb object', 'english', 'chips', 'interactive'],
                'status' => 'active',
                'position' => 36,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Build a sentence',
                            'required' => true,
                            'visual' => [
                                'selector' => '.build-sentence-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🏗️',
                            'required' => false,
                            'visual' => [
                                'selector' => '.build-sentence-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'e.g. Pick one word from each row and watch your sentence appear.',
                            'visual' => [
                                'selector' => '.build-sentence-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'parts',
                            'label' => 'Parts of the sentence',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Part',
                            'help' => 'In sentence order. Each part gets its own colour.',
                            'visual' => [
                                'selector' => '.build-sentence-block__part',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'label',
                                    'label' => 'Name',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. Subject',
                                ],
                                [
                                    'name' => 'description',
                                    'label' => 'What it does',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. who or what does the action',
                                    'help' => 'Shown in the breakdown under the sentence.',
                                ],
                                [
                                    'name' => 'options',
                                    'label' => 'Word choices',
                                    'type' => 'textarea',
                                    'rows' => 4,
                                    'required' => true,
                                    'placeholder' => "The chef\nMy sister\nThe cat",
                                    'help' => 'One per line. A choice starting with , or \' joins the word before it (e.g. \'ll get).',
                                ],
                                [
                                    'name' => 'optional',
                                    'label' => 'Can be left out',
                                    'type' => 'boolean',
                                    'required' => false,
                                    'default' => false,
                                    'help' => 'Adds a "leave out" choice, e.g. for a place or time.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'ending',
                            'label' => 'End the sentence with',
                            'type' => 'select',
                            'required' => false,
                            'default' => '.',
                            'options' => [
                                ['value' => '.', 'label' => 'Full stop .'],
                                ['value' => '!', 'label' => 'Exclamation mark !'],
                                ['value' => '?', 'label' => 'Question mark ?'],
                                ['value' => 'none', 'label' => 'Nothing'],
                            ],
                        ],
                        [
                            'name' => 'capitalize',
                            'label' => 'Capital letter at the start',
                            'type' => 'boolean',
                            'required' => false,
                            'default' => true,
                        ],
                        [
                            'name' => 'show_pattern',
                            'label' => 'Show the pattern (e.g. Subject → Verb → Object)',
                            'type' => 'boolean',
                            'required' => false,
                            'default' => true,
                        ],
                        [
                            'name' => 'show_breakdown',
                            'label' => 'Show what each part does',
                            'type' => 'boolean',
                            'required' => false,
                            'default' => true,
                        ],
                        [
                            'name' => 'mode',
                            'label' => 'Mode',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'explore',
                            'options' => [
                                ['value' => 'explore', 'label' => 'Explore — build any sentence'],
                                ['value' => 'challenge', 'label' => 'Challenge — build the sentence asked for'],
                            ],
                        ],
                        [
                            'name' => 'hint',
                            'label' => 'Note under the sentence',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'e.g. Subject → Verb → Object. Simple, but this pattern is the backbone of English!',
                            'show_when' => $show('explore'),
                            'visual' => [
                                'selector' => '.build-sentence-block__hint',
                            ],
                        ],
                        [
                            'name' => 'show_random',
                            'label' => 'Show 🎲 Surprise me button',
                            'type' => 'boolean',
                            'required' => false,
                            'default' => true,
                            'show_when' => $show('explore'),
                        ],
                        [
                            'name' => 'challenges',
                            'label' => 'Challenges',
                            'type' => 'repeater',
                            'required' => false,
                            'item_label' => 'Challenge',
                            'show_when' => $show('challenge'),
                            'visual' => [
                                'selector' => '.build-sentence-block__challenge',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'prompt',
                                    'label' => 'Task',
                                    'type' => 'textarea',
                                    'rows' => 2,
                                    'required' => true,
                                    'placeholder' => 'e.g. Build a sentence about the cat hunting.',
                                ],
                                [
                                    'name' => 'answer',
                                    'label' => 'Answer sentence',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. The cat chased the little mouse.',
                                    'help' => 'Write the whole sentence using the word choices above. Capitals and punctuation don\'t matter.',
                                ],
                                [
                                    'name' => 'why',
                                    'label' => 'Explanation (after a correct answer)',
                                    'type' => 'textarea',
                                    'rows' => 2,
                                    'required' => false,
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Build a sentence',
                    'icon' => '🏗️',
                    'subtitle' => 'Pick one word from each row and watch your sentence appear.',
                    'parts' => [
                        [
                            'label' => 'Subject',
                            'description' => 'who or what does the action',
                            'options' => "The chef\nMy sister\nThe cat",
                            'optional' => false,
                        ],
                        [
                            'label' => 'Verb',
                            'description' => 'the action',
                            'options' => "cooked\npainted\nchased",
                            'optional' => false,
                        ],
                        [
                            'label' => 'Object',
                            'description' => 'what receives the action',
                            'options' => "a delicious meal\na beautiful picture\nthe little mouse",
                            'optional' => false,
                        ],
                        [
                            'label' => 'Place',
                            'description' => 'where it happened (extra detail)',
                            'options' => "in the kitchen\nin the garden\nat school",
                            'optional' => true,
                        ],
                    ],
                    'ending' => '.',
                    'capitalize' => true,
                    'show_pattern' => true,
                    'show_breakdown' => true,
                    'mode' => 'explore',
                    'hint' => 'Subject → Verb → Object. Simple, but this pattern is the backbone of English!',
                    'show_random' => true,
                    'challenges' => [
                        [
                            'prompt' => 'Build a sentence about the cat hunting.',
                            'answer' => 'The cat chased the little mouse.',
                            'why' => '"The cat" does the action, "chased" is the action and "the little mouse" receives it.',
                        ],
                        [
                            'prompt' => 'Your sister made some art in the garden.',
                            'answer' => 'My sister painted a beautiful picture in the garden.',
                            'why' => 'The place comes after the object: Subject → Verb → Object → Place.',
                        ],
                        [
                            'prompt' => 'Dinner is ready! Who made it, and where?',
                            'answer' => 'The chef cooked a delicious meal in the kitchen.',
                        ],
                    ],
                ],
            ]
        );
    }
}
