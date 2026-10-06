<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Inline glossary" block: jargon terms inside normal flowing prose
 * are tappable in place and reveal their definition. Same as the
 * Block Library's Inline glossary.
 *
 * Frontend: InlineGlossaryBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=InlineGlossaryBlockSeeder
 */
class InlineGlossaryBlockSeeder extends Seeder
{
    public function run(): void
    {
        $contentCategoryId = BlockCategory::where('slug', 'content')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'InlineGlossaryBlock'],
            [
                'name' => 'Inline glossary',
                'icon' => '📖',
                'description' => 'Jargon terms inside normal flowing prose are tappable in place — unlike the accordion or Big Ideas, the interaction lives inside a paragraph, not in a separate list.',
                'block_category_id' => $contentCategoryId,
                'tags' => ['glossary', 'definitions', 'vocabulary', 'jargon', 'terms'],
                'status' => 'active',
                'position' => 16,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Inline glossary',
                            'required' => true,
                            'visual' => [
                                'selector' => '.inline-glossary-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '📖',
                            'required' => false,
                            'visual' => [
                                'selector' => '.inline-glossary-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap the underlined words to learn what they mean.',
                            'visual' => [
                                'selector' => '.inline-glossary-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'text',
                            'label' => 'Paragraph',
                            'type' => 'textarea',
                            'required' => true,
                            'rows' => 5,
                            'placeholder' => 'The team checked for {{latency}} issues and {{race conditions|race condition}}.',
                            'help' => 'Wrap a term in {{ }} to make it tappable. Use {{shown text|term}} when the words differ from the term, e.g. a plural. Supports **bold** and `code`.',
                            'visual' => [
                                'selector' => '.inline-glossary-block__text',
                            ],
                        ],
                        [
                            'name' => 'terms',
                            'label' => 'Terms',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Term',
                            'visual' => [
                                'selector' => '.inline-glossary-block .glossTerm',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'term',
                                    'label' => 'Term',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. latency',
                                    'help' => 'Must match the word in {{ }} (capital letters don\'t matter).',
                                ],
                                [
                                    'name' => 'definition',
                                    'label' => 'Definition',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'Shown when the term is tapped. Supports **bold** and `code`.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'prompt',
                            'label' => 'Prompt',
                            'type' => 'text',
                            'default' => '👆 Tap an underlined word.',
                            'required' => false,
                            'help' => 'Shown in the panel until a term is tapped.',
                            'visual' => [
                                'selector' => '.inline-glossary-block__panel',
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Deployment day',
                    'icon' => '📖',
                    'subtitle' => 'Tap the underlined words to learn what they mean.',
                    'text' => 'Before deploying, the team checked for {{latency}} issues and made sure the new {{cache}} layer didn\'t introduce any {{race conditions|race condition}}.',
                    'terms' => [
                        ['term' => 'latency', 'definition' => 'The delay between asking for something and getting a response.'],
                        ['term' => 'cache', 'definition' => 'A fast, temporary store of data so it doesn\'t need to be fetched or computed again.'],
                        ['term' => 'race condition', 'definition' => 'A bug where the outcome depends on the unpredictable **timing** of two things happening at once.'],
                    ],
                    'prompt' => '👆 Tap an underlined word.',
                ],
            ]
        );
    }
}
