<?php

namespace Database\Seeders;

use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

class DragBucketBlockSeeder extends Seeder
{
    /**
     * Seed the Drag Into Buckets learning block template.
     */
    public function run(): void
    {
        /*
         * =========================================
         * Find Existing Template
         * =========================================
         */

        $template = BlockTemplate::query()
            ->where('component', 'DragBucketBlock')
            ->orWhere('name', 'Drag Into Buckets')
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
                 * Title
                 * =================================
                 */

                [
                    'name' => 'title',
                    'label' => 'Title',
                    'type' => 'text',
                    'required' => true,
                    'default' => 'Sort the keywords',

                    'visual' => [
                        'selector' => '.drag-bucket-block > h2',
                        'group' => 'heading',
                    ],
                ],

                /*
                 * =================================
                 * Icon
                 * =================================
                 */

                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                    'default' => '🧩',

                    'visual' => [
                        'selector' => '.drag-bucket-block > h2',
                        'group' => 'heading',
                    ],
                ],

                /*
                 * =================================
                 * Instructions
                 * =================================
                 */

                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 3,
                    'default' =>
                        'Drag each keyword into the correct bucket, then submit your answer.',

                    'visual' => [
                        'selector' => '.drag-bucket-block-instructions',
                    ],
                ],

                /*
                 * =================================
                 * Buckets
                 * =================================
                 *
                 * Each bucket owns its correct items.
                 *
                 * This avoids storing a fragile reference from
                 * an item to another repeater row. The student
                 * component can flatten these items into the
                 * draggable item bank while retaining the
                 * source bucket as the correct answer.
                 * =================================
                 */

                [
                    'name' => 'buckets',
                    'label' => 'Buckets',
                    'type' => 'repeater',
                    'required' => true,
                    'min_items' => 2,
                    'item_label' => 'Bucket',

                    'visual' => [
                        'selector' => '.drag-bucket',
                        'selection_type' => 'repeater',
                        'index_attribute' => 'data-visual-index',
                    ],

                    'fields' => [

                        /*
                         * =========================
                         * Bucket Name
                         * =========================
                         */

                        [
                            'name' => 'label',
                            'label' => 'Bucket name',
                            'type' => 'text',
                            'required' => true,
                            'default' => 'Bucket',
                            'placeholder' => 'e.g. Conditionals',
                        ],

                        /*
                         * =========================
                         * Bucket Items
                         * =========================
                         */

                        [
                            'name' => 'items',
                            'label' => 'Keywords / items',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Item',

                            'fields' => [
                                [
                                    'name' => 'text',
                                    'label' => 'Keyword / item',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. if',
                                ],
                            ],
                        ],
                    ],
                ],

                /*
                 * =================================
                 * Shuffle Items
                 * =================================
                 */

                [
                    'name' => 'shuffle_items',
                    'label' => 'Shuffle draggable items',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],

                /*
                 * =================================
                 * Correct Message
                 * =================================
                 */

                [
                    'name' => 'correct_message',
                    'label' => 'Correct message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 2,
                    'default' =>
                        '🎉 Great work! You sorted every item correctly.',
                ],

                /*
                 * =================================
                 * Incorrect Message
                 * =================================
                 */

                [
                    'name' => 'incorrect_message',
                    'label' => 'Incorrect message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 2,
                    'default' =>
                        'Not quite. Review the correct answers below and try again. 💪',
                ],

                /*
                 * =================================
                 * Completion Message
                 * =================================
                 *
                 * Uses the same standard field name already
                 * used by exercise templates such as MCQ Quiz.
                 * =================================
                 */

                [
                    'name' => 'complete_message',
                    'label' => 'Completion message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 3,
                    'default' =>
                        '🎉 Great work! You completed the sorting exercise.',
                ],
            ],
        ];

        /*
         * =========================================
         * Example Data
         * =========================================
         */

        $exampleData = [
            'title' => 'Sort the Python keywords',
            'icon' => '🐍',

            'subtitle' =>
                'Drag each keyword into the correct bucket, then submit your answer.',

            'buckets' => [
                [
                    'label' => 'Conditionals',
                    'items' => [
                        [
                            'text' => 'if',
                        ],
                        [
                            'text' => 'elif',
                        ],
                        [
                            'text' => 'else',
                        ],
                    ],
                ],

                [
                    'label' => 'Loops',
                    'items' => [
                        [
                            'text' => 'for',
                        ],
                        [
                            'text' => 'while',
                        ],
                    ],
                ],
            ],

            'shuffle_items' => true,

            'correct_message' =>
                '🎉 Great work! You sorted every item correctly.',

            'incorrect_message' =>
                'Not quite. Review the correct answers below and try again. 💪',

            'complete_message' =>
                '🎉 Great work! You completed the sorting exercise.',
        ];

        /*
         * =========================================
         * Template Data
         * =========================================
         */

        $templateData = [
            'name' => 'Drag Into Buckets',

            'component' => 'DragBucketBlock',

            'icon' => '🧩',

            'description' =>
                'Create an interactive drag-and-drop sorting exercise where learners place keywords or items into the correct buckets.',

            'tags' => [
                'drag-drop',
                'sorting',
                'bucket',
                'classification',
                'practice',
                'interactive',
            ],

            'configuration_schema' =>
                $configurationSchema,

            'example_data' =>
                $exampleData,

            'status' =>
                'active',

            'position' =>
                60,
        ];

        /*
         * =========================================
         * Create or Update
         * =========================================
         */

        if ($template) {
            $template->update(
                $templateData
            );

            return;
        }

        BlockTemplate::create(
            $templateData
        );
    }
}
