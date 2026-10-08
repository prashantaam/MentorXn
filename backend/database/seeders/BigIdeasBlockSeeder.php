<?php

namespace Database\Seeders;

use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

class BigIdeasBlockSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * =====================================================
         * Find the existing legacy template first.
         *
         * Updating the existing row preserves its ID, which is
         * important because existing learning blocks may already
         * reference this template.
         * =====================================================
         */

        $template = BlockTemplate::query()
            ->where('component', 'ChipSelectorBlock')
            ->orWhere('name', 'Four Big Ideas')
            ->first();

        /*
         * If the legacy template does not exist, look for the
         * new template. This makes the seeder safe to run again.
         */

        if (!$template) {
            $template = BlockTemplate::query()
                ->where('component', 'BigIdeasBlock')
                ->orWhere('name', 'Big Ideas')
                ->first();
        }

        /*
         * If neither exists, create a new template.
         */

        if (!$template) {
            $template = new BlockTemplate();
        }

        /*
         * =====================================================
         * Big Ideas Template
         * =====================================================
         */

        $template->name = 'Big Ideas';
        $template->component = 'BigIdeasBlock';
        $template->icon = '💡';

        $template->description =
            'Display ideas as interactive cards, buttons, or static information cards.';

        $template->tags = [
            'concepts',
            'interactive',
            'reveal',
            'cards',
            'information',
            'comparison',
            'flow',
        ];

        /*
         * =====================================================
         * Configuration Schema
         *
         * "visual" metadata tells the generic Visual Block
         * Editor which rendered element represents a field.
         *
         * The editor does not need to know that this is a
         * BigIdeasBlock.
         * =====================================================
         */

        $template->configuration_schema = [
            'fields' => [
                /*
                 * Block title
                 */

                [
                    'name' => 'title',
                    'label' => 'Block title',
                    'type' => 'text',
                    'required' => true,

                    'visual' => [
                        'selector' => '.learning-block > h2',
                    ],
                ],

                /*
                 * Block icon
                 *
                 * The icon is part of the same heading.
                 * Clicking the heading therefore selects the
                 * title group. Both title and icon can be shown
                 * together in the properties panel.
                 */

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,

                    'visual' => [
                        'selector' => '.learning-block > h2',
                        'group' => 'heading',
                    ],
                ],

                /*
                 * Instructions shown under the block heading
                 */

                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,

                    'visual' => [
                        'selector' => '.learning-block > .sub',
                    ],
                ],

                /*
                 * Display style
                 *
                 * This is a setting rather than a visually
                 * selectable content region.
                 */

                [
                    'name' => 'display_style',
                    'label' => 'Display style',
                    'type' => 'select',
                    'required' => true,
                    'default' => 'cards',

                    'options' => [
                        [
                            'value' => 'cards',
                            'label' => 'Cards',
                        ],
                        [
                            'value' => 'buttons',
                            'label' => 'Buttons',
                        ],
                        [
                            'value' => 'info_cards',
                            'label' => 'Info Cards',
                        ],
                    ],
                ],

                /*
                 * Optional visual flow arrows.
                 *
                 * This remains a block setting rather than a
                 * selectable visual content region.
                 */

                [
                    'name' => 'show_flow',
                    'label' => 'Show flow symbols',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                ],

                /*
                 * Start with the first idea selected, so its
                 * example / explanation shows straight away.
                 */

                [
                    'name' => 'open_first',
                    'label' => 'Open the first idea by default',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                    'help' => 'Cards and Buttons: the first idea starts selected, so its example and explanation show straight away.',
                ],

                /*
                 * Unlimited ideas
                 *
                 * The nth rendered element matching selector
                 * corresponds to the nth item in data.items.
                 */

                [
                    'name' => 'items',
                    'label' => 'Ideas',
                    'type' => 'repeater',
                    'required' => true,
                    'item_label' => 'Idea',
                    'min_items' => 1,

                    'visual' => [
                        'selector' => '.big-ideas-item-wrapper',
                        'selection_type' => 'repeater',
                    ],

                    'fields' => [
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'required' => false,
                            'default' => '💡',
                        ],

                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'required' => true,
                        ],

                        /*
                         * Optional example in a dark box (Word Quest
                         * style). **word** is highlighted in bold
                         * yellow; the explanation shows below it.
                         */
                        [
                            'name' => 'example',
                            'label' => 'Example (optional)',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'e.g. I **have visited** Paris three times.',
                            'help' => 'Shown in a dark box above the explanation. Wrap words in **double stars** to make them bold and yellow.',
                        ],

                        [
                            'name' => 'content',
                            'label' => 'Explanation',
                            'type' => 'textarea',
                            'rows' => 4,
                            'required' => true,
                        ],
                    ],
                ],
            ],
        ];

        /*
         * =====================================================
         * Example / Default Configuration
         * =====================================================
         */

        $template->example_data = [
            'title' => 'Big Ideas',
            'icon' => '💡',

            'subtitle' =>
                'Select an idea to explore it.',

            'display_style' => 'cards',
            'show_flow' => false,

            'items' => [
                [
                    'icon' => '📋',
                    'title' => 'Algorithm',
                    'content' =>
                        'A step-by-step set of instructions for solving a problem.',
                ],
                [
                    'icon' => '⌨️',
                    'title' => 'Code',
                    'content' =>
                        'Instructions written in a programming language.',
                ],
                [
                    'icon' => '▶️',
                    'title' => 'Program',
                    'content' =>
                        'Code that a computer can run to perform a task.',
                ],
                [
                    'icon' => '🐛',
                    'title' => 'Bug',
                    'content' =>
                        'A mistake or problem in code that causes unexpected behaviour.',
                ],
            ],
        ];

        $template->status = 'active';

        /*
         * Keep the existing catalogue position.
         */

        $template->position = 10;

        $template->save();
    }
}