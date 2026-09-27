<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class ProcessFlowBlockSeeder extends Seeder
{
    /**
     * Seed the Process Flow learning block template.
     */
    public function run(): void
    {
        $template = LBlockTemplate::query()
            ->where(
                'component',
                'ProcessFlowBlock'
            )
            ->orWhere(
                'name',
                'Process Flow'
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
                        'Process Flow',
                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.process-flow-block > h2',

                        'group' =>
                            'heading',
                    ],
                ],

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'default' => '🏭',
                    'required' => false,

                    /*
                     * Title and icon are rendered
                     * together by LearningBlockShell.
                     */
                    'visual' => [
                        'selector' =>
                            '.process-flow-block > h2',

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
                    'label' => 'Subtitle',
                    'type' => 'textarea',
                    'default' => '',
                    'required' => false,

                    'visual' => [
                        'selector' =>
                            '.process-flow-block > .sub',
                    ],
                ],

                /*
                 * =================================
                 * Process steps
                 * =================================
                 *
                 * Each .process-flow-stage maps
                 * directly to one steps[] entry.
                 *
                 * The component renders the steps
                 * in source-array order, so the
                 * generic visual editor can use
                 * DOM position to determine which
                 * repeater item was clicked.
                 * =================================
                 */

                [
                    'name' => 'steps',
                    'label' => 'Steps',
                    'type' => 'repeater',
                    'item_label' => 'Step',
                    'min_items' => 2,
                    'required' => true,

                    'visual' => [
                        'selector' =>
                            '.process-flow-stage',

                        'selection_type' =>
                            'repeater',
                    ],

                    'fields' => [

                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '➡️',
                            'required' => false,
                        ],

                        [
                            'name' => 'title',
                            'label' =>
                                'Step title',

                            'type' => 'text',
                            'default' => '',
                            'required' => true,
                        ],

                        [
                            'name' => 'caption',
                            'label' =>
                                'Short caption',

                            'type' => 'text',
                            'default' => '',
                            'required' => false,
                        ],

                        [
                            'name' => 'content',
                            'label' =>
                                'Step explanation',

                            'type' => 'textarea',
                            'rows' => 4,
                            'default' => '',
                            'required' => true,
                        ],
                    ],
                ],

                /*
                 * =================================
                 * Starting message
                 * =================================
                 *
                 * This is visible in the information
                 * panel before the process starts,
                 * so it can be selected visually.
                 * =================================
                 */

                [
                    'name' => 'start_message',
                    'label' =>
                        'Starting message',

                    'type' => 'textarea',

                    'default' =>
                        'Press **Next step** to start.',

                    'required' => false,

                    'visual' => [
                        'selector' =>
                            '.process-flow-info',
                    ],
                ],

                /*
                 * =================================
                 * Controls
                 * =================================
                 *
                 * These remain general settings.
                 * They control the interaction rather
                 * than a process step.
                 * =================================
                 */

                [
                    'name' =>
                        'next_button_label',

                    'label' =>
                        'Next button label',

                    'type' => 'text',

                    'default' =>
                        '▶ Next step',

                    'required' => false,
                ],

                [
                    'name' =>
                        'restart_button_label',

                    'label' =>
                        'Restart button label',

                    'type' => 'text',

                    'default' =>
                        '↺ Restart',

                    'required' => false,
                ],
            ],
        ];

        /*
         * =========================================
         * Example Data
         * =========================================
         */

        $exampleData = [

            'subtitle' => '',

            'steps' => [

                [
                    'icon' => '📝',

                    'title' =>
                        'You write code',

                    'caption' =>
                        'readable words',

                    'content' =>
                        'You write friendly words in a text file, like `print("Hello!")`. Humans can read it, but the computer cannot yet!',
                ],

                [
                    'icon' => '🔧',

                    'title' =>
                        'Compiler / Interpreter',

                    'caption' =>
                        'translates it',

                    'content' =>
                        'A **compiler** (or an **interpreter**) checks your code and translates every instruction into something far more literal.',
                ],

                [
                    'icon' => '🔢',

                    'title' =>
                        'Binary',

                    'caption' =>
                        '0s and 1s',

                    'content' =>
                        'The final result is **binary**: long strings of 0s and 1s. Every letter, number and instruction becomes a pattern of bits.',
                ],

                [
                    'icon' => '🖥️',

                    'title' =>
                        'CPU runs it',

                    'caption' =>
                        'does the work',

                    'content' =>
                        'The CPU reads that binary directly and does the work — flipping tiny electrical switches billions of times per second. ⚡',
                ],
            ],

            'start_message' =>
                'Press **Next step** to start.',

            'next_button_label' =>
                '▶ Next step',

            'restart_button_label' =>
                '↺ Restart',
        ];

        /*
         * =========================================
         * Update existing template
         * =========================================
         */

        if ($template) {
            $template->update([
                'name' =>
                    'Process Flow',

                'description' =>
                    'An interactive step-by-step process flow with sequential highlighting and explanations.',

                'icon' =>
                    '🏭',

                'component' =>
                    'ProcessFlowBlock',

                'configuration_schema' =>
                    $configurationSchema,

                'example_data' =>
                    $exampleData,

                'status' =>
                    'active',

                'position' =>
                    60,
            ]);

            return;
        }

        /*
         * =========================================
         * Create template
         * =========================================
         */

        LBlockTemplate::create([
            'name' =>
                'Process Flow',

            'description' =>
                'An interactive step-by-step process flow with sequential highlighting and explanations.',

            'icon' =>
                '🏭',

            'component' =>
                'ProcessFlowBlock',

            'configuration_schema' =>
                $configurationSchema,

            'example_data' =>
                $exampleData,

            'status' =>
                'active',

            'position' =>
                60,
        ]);
    }
}