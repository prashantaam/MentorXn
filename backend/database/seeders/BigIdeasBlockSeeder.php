<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
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

        $template = LBlockTemplate::query()
            ->where('component', 'ChipSelectorBlock')
            ->orWhere('name', 'Four Big Ideas')
            ->first();

        /*
         * If the legacy template does not exist, look for the
         * new template. This makes the seeder safe to run again.
         */
        if (!$template) {
            $template = LBlockTemplate::query()
                ->where('component', 'BigIdeasBlock')
                ->orWhere('name', 'Big Ideas')
                ->first();
        }

        /*
         * If neither exists, create a new template.
         */
        if (!$template) {
            $template = new LBlockTemplate();
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
            'Interactive ideas displayed as cards or buttons. '
            . 'Students select an idea to reveal its explanation.';

        $template->tags = [
            'concepts',
            'interactive',
            'reveal',
            'cards',
            'flow',
        ];

        /*
         * =====================================================
         * Configuration Schema
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
                ],

                /*
                 * Block icon
                 */
                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                ],

                /*
                 * Instructions shown under the block heading
                 */
                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,
                ],

                /*
                 * Display style
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
                    ],
                ],

                /*
                 * Optional visual flow arrows.
                 *
                 * Default is OFF.
                 */
                [
                    'name' => 'show_flow',
                    'label' => 'Show flow symbols',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => false,
                ],

                /*
                 * Unlimited ideas
                 */
                [
                    'name' => 'items',
                    'label' => 'Ideas',
                    'type' => 'repeater',
                    'required' => true,

                    'item_label' => 'Idea',

                    'min_items' => 1,

                    'fields' => [

                        /*
                         * Idea icon
                         */
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'required' => false,
                            'default' => '💡',
                        ],

                        /*
                         * Idea title
                         */
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'required' => true,
                        ],

                        /*
                         * Explanation revealed when selected
                         */
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
         *
         * Teachers can add or remove as many ideas as required.
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