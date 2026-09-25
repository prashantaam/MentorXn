<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class SequenceBlockSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * Find the existing Sequence template if the seeder
         * has already been run.
         *
         * This prevents duplicate templates.
         */
        $template = LBlockTemplate::query()
            ->where('component', 'SequenceBlock')
            ->orWhere('name', 'Sequence')
            ->first();

        if (!$template) {
            $template = new LBlockTemplate();
        }

        /*
         * =====================================================
         * Basic Template Information
         * =====================================================
         */

        $template->name = 'Sequence';

        $template->component = 'SequenceBlock';

        $template->icon = '🔢';

        $template->description =
            'Students arrange items into the correct sequence '
            . 'using up and down controls, then check their answer.';

        $template->tags = [
            'sequence',
            'ordering',
            'steps',
            'algorithm',
            'interactive',
        ];


        /*
         * =====================================================
         * Teacher Configuration
         * =====================================================
         *
         * IMPORTANT:
         *
         * Teachers enter the items in the CORRECT order.
         *
         * Example:
         *
         * 1. Get two slices of bread
         * 2. Open the peanut butter jar
         * 3. Spread peanut butter
         *
         * SequenceBlock can then shuffle them for students.
         * =====================================================
         */

        $template->configuration_schema = [
            'fields' => [

                /*
                 * Block Title
                 */
                [
                    'name' => 'title',
                    'label' => 'Block title',
                    'type' => 'text',
                    'required' => true,
                ],

                /*
                 * Block Icon
                 */
                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                ],

                /*
                 * Instructions
                 */
                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,
                ],

                /*
                 * Sequence Items
                 *
                 * The order entered here is the correct order.
                 */
                [
                    'name' => 'items',
                    'label' => 'Sequence items',
                    'type' => 'repeater',
                    'required' => true,
                    'item_label' => 'Step',
                    'min_items' => 2,

                    'fields' => [
                        [
                            'name' => 'text',
                            'label' => 'Step text',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => true,
                        ],
                    ],
                ],

                /*
                 * Shuffle
                 */
                [
                    'name' => 'shuffle_items',
                    'label' => 'Shuffle items',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * Position Numbers
                 */
                [
                    'name' => 'show_numbers',
                    'label' => 'Show numbers',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * Correct Feedback
                 */
                [
                    'name' => 'correct_message',
                    'label' => 'Correct message',
                    'type' => 'textarea',
                    'required' => false,
                    'default' =>
                        "🎉 Perfect order! That's exactly what an algorithm is: clear steps, in the right sequence.",
                ],

                /*
                 * Incorrect Feedback
                 *
                 * Leave blank to use SequenceBlock's automatic:
                 *
                 * "Getting there! 3 of 6 steps are already
                 * in the right spot."
                 */
                [
                    'name' => 'incorrect_message',
                    'label' => 'Incorrect message',
                    'type' => 'textarea',
                    'required' => false,
                ],
            ],
        ];


        /*
         * =====================================================
         * Example Data
         * =====================================================
         *
         * Based on the Programming Basics sandwich activity.
         * =====================================================
         */

        $template->example_data = [
            'title' => 'A recipe is an algorithm',

            'icon' => '🥪',

            'subtitle' =>
                'These steps for making a sandwich got shuffled! '
                . 'Use ↑ ↓ to put them in an order that actually '
                . 'works, then check.',

            /*
             * Entered in CORRECT order.
             */
            'items' => [
                [
                    'text' =>
                        'Get two slices of bread',
                ],
                [
                    'text' =>
                        'Open the peanut butter jar',
                ],
                [
                    'text' =>
                        'Spread peanut butter on one slice',
                ],
                [
                    'text' =>
                        'Spread jelly on the other slice',
                ],
                [
                    'text' =>
                        'Press the slices together',
                ],
                [
                    'text' =>
                        'Enjoy your sandwich! 🥪',
                ],
            ],

            'shuffle_items' => true,

            'show_numbers' => true,

            'correct_message' =>
                "🎉 Perfect order! That's exactly what an algorithm is: clear steps, in the right sequence.",

            'incorrect_message' => '',
        ];


        /*
         * =====================================================
         * Template Status
         * =====================================================
         */

        $template->status = 'active';

        $template->position = 40;

        $template->save();
    }
}