<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Rich text" block: the common icon, title and messages around
 * formatted text the teacher writes in a rich text editor.
 *
 * Frontend: RichTextBlock (component) + the "richtext" settings field.
 * The content is stored as a TipTap JSON document.
 *
 *   php artisan db:seed --class=RichTextBlockSeeder
 */
class RichTextBlockSeeder extends Seeder
{
    public function run(): void
    {
        $contentCategoryId = BlockCategory::where('slug', 'content')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'RichTextBlock'],
            [
                'name' => 'Rich text',
                'icon' => '📝',
                'description' => 'Formatted explanatory text — headings, lists, links, quotes and code — written in a familiar editor. Most topics open with one.',
                'block_category_id' => $contentCategoryId,
                'tags' => ['text', 'content', 'explanation', 'reading'],
                'status' => 'active',
                'position' => 5,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Rich text',
                            'required' => true,
                            'visual' => [
                                'selector' => '.rich-text-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '📝',
                            'required' => false,
                            'visual' => [
                                'selector' => '.rich-text-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'content',
                            'label' => 'Content',
                            'type' => 'richtext',
                            'required' => true,
                            'placeholder' => 'Write the explanation students will read…',
                            'visual' => [
                                'selector' => '.rich-text-block__body',
                            ],
                        ],
                        // The shared "global message" field (same as SharedBlockConfig.js).
                        [
                            'name' => 'messages',
                            'label' => 'Messages',
                            'type' => 'repeater',
                            'required' => false,
                            'item_label' => 'Message',
                            'visual' => [
                                'selector' => '.learning-block-message',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'type',
                                    'label' => 'Message type',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => 'success',
                                    'options' => [
                                        ['value' => 'success', 'label' => 'Success'],
                                        ['value' => 'warning', 'label' => 'Warning'],
                                        ['value' => 'danger', 'label' => 'Danger'],
                                    ],
                                ],
                                [
                                    'name' => 'text',
                                    'label' => 'Message',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 3,
                                    'placeholder' => 'Enter a message for the learner.',
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'What is an algorithm?',
                    'icon' => '📝',
                    'content' => [
                        'type' => 'doc',
                        'content' => [
                            [
                                'type' => 'paragraph',
                                'content' => [
                                    ['type' => 'text', 'text' => 'An '],
                                    ['type' => 'text', 'marks' => [['type' => 'bold']], 'text' => 'algorithm'],
                                    ['type' => 'text', 'text' => ' is a precise, step-by-step set of instructions for solving a problem.'],
                                ],
                            ],
                            [
                                'type' => 'heading',
                                'attrs' => ['level' => 3],
                                'content' => [['type' => 'text', 'text' => 'Everyday examples']],
                            ],
                            [
                                'type' => 'bulletList',
                                'content' => [
                                    ['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'A recipe for baking bread']]]]],
                                    ['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Directions to a friend\'s house']]]]],
                                ],
                            ],
                            [
                                'type' => 'paragraph',
                                'content' => [
                                    ['type' => 'text', 'text' => 'In code, it might be as small as '],
                                    ['type' => 'text', 'marks' => [['type' => 'code']], 'text' => 'total = a + b'],
                                    ['type' => 'text', 'text' => '.'],
                                ],
                            ],
                        ],
                    ],
                    'messages' => [
                        ['type' => 'success', 'text' => 'Tip: every program you write is built from algorithms.'],
                    ],
                ],
            ]
        );
    }
}
