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
                 * Show the instructions in a dark box (Word Quest
                 * style), with **words** in bold yellow.
                 */

                [
                    'name' => 'dark_instructions',
                    'label' => 'Dark box',
                    'checkbox_label' => 'Enabled Dark Box',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
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
                            'label' => 'Inline Cards',
                        ],
                        [
                            'value' => 'next',
                            'label' => 'Next card — one at a time, with Previous / Next',
                        ],
                    ],
                    'help' => 'Next card shows no cards: just one idea at a time (its example and More details) with ◀ Previous / Next ▶, like Word Quest\'s "Mixed tense review".',
                ],

                /*
                 * Static or dynamic.
                 */

                [
                    'name' => 'mode',
                    'label' => 'How the ideas are shown',
                    'type' => 'select',
                    'show_when' => [
                        'field' => 'display_style',
                        'not_equals' => 'next',
                    ],
                    'required' => false,
                    'default' => 'click',
                    'options' => [
                        [
                            'value' => 'click',
                            'label' => 'On click — the clicked idea\'s More details show below',
                        ],
                        [
                            'value' => 'play',
                            'label' => 'Play — step through the ideas one by one',
                        ],
                        [
                            'value' => 'all',
                            'label' => 'Show all — More details inside the cards',
                        ],
                    ],
                    'help' => 'Play works like a step-through: ▶ Next step lights up one idea at a time and shows its More details below.',
                ],

                [
                    'name' => 'auto_play',
                    'label' => 'Auto play',
                    'checkbox_label' => 'Auto play (steps by itself)',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                    'show_when' => [
                        'field' => 'mode',
                        'equals' => 'play',
                    ],
                ],

                [
                    'name' => 'play_seconds',
                    'label' => 'Seconds per step (auto play)',
                    'type' => 'number',
                    'required' => false,
                    'default' => 2,
                    'show_when' => [
                        'field' => 'mode',
                        'equals' => 'play',
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
                    'help' => 'On click: the first idea starts selected, so its More details show straight away.',
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
                        'index_attribute' => 'data-visual-index',
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

                        [
                            'name' => 'subtitle',
                            'label' => 'Subtitle',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. ongoing (past continuous)',
                            'help' => 'A short line shown on the card under the title.',
                        ],

                        [
                            'name' => 'example',
                            'label' => 'Example (black box)',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'e.g. I **visited** Paris in 2019.',
                            'help' => 'Shown first, in a black box, with More details under it. Wrap words in **double stars** to show them in the lesson colour.',
                        ],

                        [
                            'name' => 'content',
                            'label' => 'More details',
                            'type' => 'textarea',
                            'rows' => 4,
                            'required' => false,
                            'help' => 'Shown in the dotted box, under the example. Supports **bold**, `code` and labels like [[g:Adjective]].',
                        ],
                    ],
                ],

                /*
                 * Extra information after the ideas, as rich text
                 * (same editor as the Rich text block, with tables) —
                 * e.g. Word Quest's "Direct → Reported" table.
                 */

                [
                    'name' => 'extra_info',
                    'label' => 'Extra information',
                    'type' => 'richtext',
                    'required' => false,
                    'placeholder' => 'Optional — headings, lists, tables… shown after the ideas.',
                    'help' => 'Shown after the ideas, before the note at the end. Use ▦ Table in the toolbar for a table.',
                    'visual' => [
                        'selector' => '.big-ideas-extra',
                    ],
                ],

                /*
                 * One shared dotted box, at the very end of the
                 * block.
                 */

                [
                    'name' => 'note',
                    'label' => 'Note at the end (dotted box)',
                    'type' => 'textarea',
                    'rows' => 2,
                    'required' => false,
                    'placeholder' => 'e.g. The longer background action uses past continuous; the action that interrupts it uses past simple.',
                    'help' => 'Shown after everything else in the block. Supports **bold**, `code` and labels like [[g:Adjective]].',
                    'visual' => [
                        'selector' => '.big-ideas-note',
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
            'mode' => 'click',
            'dark_instructions' => false,
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