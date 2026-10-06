<?php

namespace Database\Seeders;

use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

class ToggleExplorerBlockSeeder extends Seeder
{
    /**
     * Seed the Toggle Explorer learning block template.
     */
    public function run(): void
    {
        $template = BlockTemplate::query()
            ->where(
                'component',
                'ToggleExplorerBlock'
            )
            ->orWhere(
                'name',
                'Toggle Explorer'
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
                    'default' =>
                        'Toggle Explorer',
                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.toggle-explorer-block > h2',

                        'group' =>
                            'heading',
                    ],
                ],

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'default' => '💡',
                    'required' => false,

                    /*
                     * Title and icon share the
                     * LearningBlockShell heading.
                     */
                    'visual' => [
                        'selector' =>
                            '.toggle-explorer-block > h2',

                        'group' =>
                            'heading',
                    ],
                ],

                /*
                 * =================================
                 * Description
                 * =================================
                 */

                [
                    'name' => 'description',
                    'label' => 'Description',
                    'type' => 'textarea',
                    'default' => '',
                    'required' => false,

                    'visual' => [
                        'selector' =>
                            '.toggle-explorer-description',
                    ],
                ],

                /*
                 * =================================
                 * Toggle items
                 * =================================
                 *
                 * Each rendered
                 * .toggle-explorer-item corresponds
                 * directly to one items[] entry.
                 *
                 * The component does not shuffle or
                 * reorder these items, so the generic
                 * editor can determine the source
                 * item from its DOM position.
                 * =================================
                 */

                [
                    'name' => 'items',
                    'label' => 'Toggle items',
                    'type' => 'repeater',

                    /*
                     * Use min_items rather than min.
                     *
                     * This matches the repeater
                     * convention used by the other
                     * learning-block schemas and
                     * BlockConfigField.
                     */
                    'min_items' => 1,

                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.toggle-explorer-item',

                        'selection_type' =>
                            'repeater',
                    ],

                    'fields' => [

                        [
                            'name' => 'label',
                            'label' => 'Label',
                            'type' => 'text',
                            'default' => '',
                            'required' => true,
                        ],

                        [
                            'name' => 'value',
                            'label' => 'Value',
                            'type' => 'number',
                            'default' => 1,
                            'required' => true,
                        ],
                    ],
                ],

                /*
                 * =================================
                 * Toggle appearance
                 * =================================
                 *
                 * These affect every toggle rather
                 * than one specific repeater item,
                 * so they remain block settings.
                 * =================================
                 */

                [
                    'name' => 'on_icon',
                    'label' => 'ON icon',
                    'type' => 'text',
                    'default' => '💡',
                    'required' => false,
                ],

                [
                    'name' => 'off_icon',
                    'label' => 'OFF icon',
                    'type' => 'text',
                    'default' => '⚪',
                    'required' => false,
                ],

                /*
                 * =================================
                 * Number input
                 * =================================
                 */

                [
                    'name' => 'input_label',
                    'label' =>
                        'Number input label',

                    'type' => 'text',
                    'default' =>
                        'Decimal number',

                    'required' => false,

                    /*
                     * Clicking the visible input
                     * label lets the teacher edit
                     * its text directly.
                     */
                    'visual' => [
                        'selector' =>
                            '.toggle-explorer-input-label',
                    ],
                ],

                [
                    'name' => 'show_input',
                    'label' =>
                        'Show number input',

                    'type' => 'boolean',
                    'default' => true,
                ],

                /*
                 * =================================
                 * Result display
                 * =================================
                 */

                [
                    'name' => 'show_binary',
                    'label' =>
                        'Show binary result',

                    'type' => 'boolean',
                    'default' => true,
                ],

                [
                    'name' => 'show_total',
                    'label' =>
                        'Show total',

                    'type' => 'boolean',
                    'default' => true,
                ],
            ],
        ];

        /*
         * =========================================
         * Example Data
         * =========================================
         */

        $exampleData = [

            'description' =>
                'Each bulb is worth a number when it is ON. Turn bulbs on and off and watch the total, or type a number and watch the bulbs react!',

            'items' => [

                [
                    'label' => '16',
                    'value' => 16,
                ],

                [
                    'label' => '8',
                    'value' => 8,
                ],

                [
                    'label' => '4',
                    'value' => 4,
                ],

                [
                    'label' => '2',
                    'value' => 2,
                ],

                [
                    'label' => '1',
                    'value' => 1,
                ],
            ],

            'on_icon' => '💡',

            'off_icon' => '⚪',

            'input_label' =>
                'Decimal number',

            'show_input' => true,

            'show_binary' => true,

            'show_total' => true,
        ];

        /*
         * =========================================
         * Update existing template
         * =========================================
         */

        if ($template) {
            $template->update([
                'name' =>
                    'Toggle Explorer',

                'description' =>
                    'An interactive weighted toggle activity for exploring binary values, combinations and ON/OFF states.',

                'icon' => '💡',

                'component' =>
                    'ToggleExplorerBlock',

                'configuration_schema' =>
                    $configurationSchema,

                'example_data' =>
                    $exampleData,

                'position' => 70,
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
                'Toggle Explorer',

            'description' =>
                'An interactive weighted toggle activity for exploring binary values, combinations and ON/OFF states.',

            'icon' => '💡',

            'component' =>
                'ToggleExplorerBlock',

            'configuration_schema' =>
                $configurationSchema,

            'example_data' =>
                $exampleData,

            'position' => 70,
        ]);
    }
}