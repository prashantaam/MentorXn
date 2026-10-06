<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Accordion" block: a vertical list of collapsed items that
 * expand on tap — one at a time or several at once. Same as
 * the Block Library's Accordion.
 *
 * Frontend: AccordionBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=AccordionBlockSeeder
 */
class AccordionBlockSeeder extends Seeder
{
    public function run(): void
    {
        $contentCategoryId = BlockCategory::where('slug', 'content')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'AccordionBlock'],
            [
                'name' => 'Accordion',
                'icon' => '🪗',
                'description' => 'A vertical list of collapsed items that expand on tap — one at a time or several at once. Good for FAQ-style content or optional detail that would clutter the page if always shown.',
                'block_category_id' => $contentCategoryId,
                'tags' => ['faq', 'questions', 'expand', 'collapse', 'details'],
                'status' => 'active',
                'position' => 12,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Accordion',
                            'required' => true,
                            'visual' => [
                                'selector' => '.accordion-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🪗',
                            'required' => false,
                            'visual' => [
                                'selector' => '.accordion-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Tap a question to see the answer.',
                            'visual' => [
                                'selector' => '.accordion-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'items',
                            'label' => 'Items',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Item',
                            'visual' => [
                                'selector' => '.accordion-block .accItem',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'question',
                                    'label' => 'Question',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'Shown on the collapsed item',
                                ],
                                [
                                    'name' => 'answer',
                                    'label' => 'Answer',
                                    'type' => 'textarea',
                                    'required' => true,
                                    'rows' => 4,
                                    'placeholder' => 'Shown when the item is opened. Supports **bold** and `code`.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'allow_multiple',
                            'label' => 'Allow several items open at once',
                            'type' => 'boolean',
                            'default' => true,
                            'required' => false,
                            'help' => 'When off, opening an item closes the others.',
                        ],
                        [
                            'name' => 'open_first',
                            'label' => 'Start with the first item open',
                            'type' => 'boolean',
                            'default' => false,
                            'required' => false,
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Frequently asked questions',
                    'icon' => '🪗',
                    'subtitle' => 'Tap a question to see the answer.',
                    'items' => [
                        ['question' => 'What does this block do?', 'answer' => 'It expands to reveal this answer when tapped, and collapses again on a second tap.'],
                        ['question' => 'Can more than one be open at once?', 'answer' => 'Yes, when **Allow several items open at once** is on. Turn it off and opening one item closes the others.'],
                        ['question' => 'When should I use this over Big Ideas?', 'answer' => 'Accordions suit a longer **vertical** list of items (like FAQs); Big Ideas suits a short set of options side by side.'],
                    ],
                    'allow_multiple' => true,
                    'open_first' => false,
                ],
            ]
        );
    }
}
