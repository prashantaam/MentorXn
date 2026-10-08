<?php

namespace Database\Seeders;

use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

class FlipCardBlockSeeder extends Seeder
{
    /**
     * Seed the Flip Cards learning block template.
     */
    public function run(): void
    {
        $template = BlockTemplate::query()
            ->where(
                'component',
                'FlipCardBlock'
            )
            ->orWhere(
                'name',
                'Flip Cards'
            )
            ->first();

        /*
         * =========================================
         * Configuration Schema
         * =========================================
         */

        $configurationSchema = [
            'fields' => [

                /*
                 * =================================
                 * Block heading
                 * =================================
                 */

                [
                    'name' => 'title',
                    'label' => 'Title',
                    'type' => 'text',
                    'default' => 'Flip Cards',
                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.flip-cards-block > h2',

                        'group' =>
                            'heading',
                    ],
                ],

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'default' => '🃏',
                    'required' => false,

                    /*
                     * Title and icon are rendered
                     * together by LearningBlockShell.
                     */
                    'visual' => [
                        'selector' =>
                            '.flip-cards-block > h2',

                        'group' =>
                            'heading',
                    ],
                ],

                /*
                 * =================================
                 * Subtitle
                 * =================================
                 */

                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'rows' => 3,

                    'default' =>
                        'Click each card to reveal the explanation.',

                    'required' => false,

                    'visual' => [
                        'selector' =>
                            '.flip-cards-block > .sub',
                    ],
                ],

                /*
                 * =================================
                 * Cards
                 * =================================
                 *
                 * Each .flip-card corresponds
                 * directly to one cards[] item.
                 *
                 * The component renders cards in
                 * their source order, so the
                 * generic visual editor can use
                 * DOM position to determine the
                 * repeater index.
                 * =================================
                 */

                [
                    'name' => 'cards',
                    'label' => 'Cards',
                    'type' => 'repeater',
                    'item_label' => 'Card',
                    'min_items' => 1,
                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.flip-card',

                        'selection_type' =>
                            'repeater',
                    ],

                    'fields' => [

                        [
                            'name' => 'icon',
                            'label' => 'Card icon',
                            'type' => 'text',
                            'default' => '',
                            'required' => false,
                        ],

                        [
                            'name' => 'front',
                            'label' => 'Front',
                            'type' => 'text',
                            'default' => '',
                            'required' => true,

                            'placeholder' =>
                                'e.g. Variable',
                        ],

                        [
                            'name' => 'back',
                            'label' => 'Back',
                            'type' => 'textarea',
                            'rows' => 4,
                            'default' => '',
                            'required' => true,

                            'placeholder' =>
                                'Enter the explanation shown when the card is flipped.',
                        ],
                    ],
                ],

                /*
                 * =================================
                 * Reading Mode
                 * =================================
                 *
                 * Adds a Cards / Reading switch. Reading
                 * lists every card with its icon and title;
                 * clicking one shows its definition.
                 */

                [
                    'name' => 'reading_mode',
                    'label' => 'Let students switch to a reading view',
                    'type' => 'boolean',
                    'default' => false,
                    'required' => false,

                    'help' =>
                        'Adds a "Cards / Reading" switch. Reading lists every card with its icon and title; students click one to read its definition.',
                ],
            ],
        ];

        /*
         * =========================================
         * Example Data
         * =========================================
         */

        $exampleData = [

            'title' =>
                'Programming Concepts',

            'icon' =>
                '🃏',

            'subtitle' =>
                'Click each card to reveal the explanation.',

            'cards' => [

                [
                    'icon' => '📦',

                    'front' =>
                        'Variable',

                    'back' =>
                        'A variable stores a value that your program can use or change.',
                ],

                [
                    'icon' => '🔁',

                    'front' =>
                        'Loop',

                    'back' =>
                        'A loop repeats a set of instructions until a condition is met or for a specified number of times.',
                ],

                [
                    'icon' => '⚙️',

                    'front' =>
                        'Function',

                    'back' =>
                        'A function is a reusable block of code designed to perform a particular task.',
                ],

                [
                    'icon' => '🤔',

                    'front' =>
                        'Condition',

                    'back' =>
                        'A condition allows a program to make decisions and execute different code depending on whether something is true or false.',
                ],
            ],

            'reading_mode' =>
                false,
        ];

        /*
         * =========================================
         * Update existing template
         * =========================================
         */

        if ($template) {
            $template->update([
                'name' =>
                    'Flip Cards',

                'description' =>
                    'Interactive cards that learners click to reveal explanations or additional information.',

                'icon' =>
                    '🃏',

                'component' =>
                    'FlipCardBlock',

                'configuration_schema' =>
                    $configurationSchema,

                'example_data' =>
                    $exampleData,

                'status' =>
                    'active',

                'position' =>
                    30,
            ]);

            return;
        }

        /*
         * =========================================
         * Create template
         * =========================================
         */

        BlockTemplate::create([
            'name' =>
                'Flip Cards',

            'description' =>
                'Interactive cards that learners click to reveal explanations or additional information.',

            'icon' =>
                '🃏',

            'component' =>
                'FlipCardBlock',

            'configuration_schema' =>
                $configurationSchema,

            'example_data' =>
                $exampleData,

            'status' =>
                'active',

            'position' =>
                30,
        ]);
    }
}