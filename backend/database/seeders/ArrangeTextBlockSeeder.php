<?php

namespace Database\Seeders;

use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

class ArrangeTextBlockSeeder extends Seeder
{
    /**
     * Seed the Arrange Text learning block template.
     */
    public function run(): void
    {
        $template = BlockTemplate::query()
            ->where('component', 'ArrangeTextBlock')
            ->orWhere('name', 'Arrange Text')
            ->first();

        $configurationSchema = [
            'fields' => [
                [
                    'name' => 'title',
                    'label' => 'Title',
                    'type' => 'text',
                    'required' => true,
                    'default' => 'Arrange the text',
                    'visual' => [
                        'selector' => '.arrange-text-block > h2',
                        'group' => 'heading',
                    ],
                ],
                [
                    'name' => 'icon',
                    'label' => 'Icon',
                    'type' => 'text',
                    'required' => false,
                    'default' => '🔀',
                    'visual' => [
                        'selector' => '.arrange-text-block > h2',
                        'group' => 'heading',
                    ],
                ],
                [
                    'name' => 'subtitle',
                    'label' => 'Instructions',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 3,
                    'default' =>
                        'Drag the pieces within the area until they are in the correct order.',
                    'visual' => [
                        'selector' => '.arrange-text-block-instructions',
                    ],
                ],

                /*
                 * The teacher-entered order is the answer key.
                 * Stable runtime IDs are generated from the source index,
                 * so duplicate text values are safe.
                 */
                [
                    'name' => 'items',
                    'label' => 'Items in correct order',
                    'type' => 'repeater',
                    'required' => true,
                    'min_items' => 2,
                    'item_label' => 'Item',
                    'visual' => [
                        'selector' => '.arrange-text-item',
                        'selection_type' => 'repeater',
                        'index_attribute' => 'data-visual-index',
                    ],
                    'fields' => [
                        [
                            'name' => 'text',
                            'label' => 'Text',
                            'type' => 'text',
                            'required' => true,
                            'placeholder' => 'e.g. if',
                        ],
                    ],
                ],
                [
                    'name' => 'shuffle_items',
                    'label' => 'Shuffle items',
                    'type' => 'boolean',
                    'required' => false,
                    'default' => true,
                ],
                [
                    'name' => 'correct_message',
                    'label' => 'Correct message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 2,
                    'default' =>
                        '🎉 Perfect! Everything is in the correct order.',
                ],
                [
                    'name' => 'incorrect_message',
                    'label' => 'Incorrect message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 2,
                    'default' =>
                        'Not quite. Compare your order with the correct answer and try again. 💪',
                ],
                [
                    'name' => 'complete_message',
                    'label' => 'Completion message',
                    'type' => 'textarea',
                    'required' => false,
                    'rows' => 3,
                    'default' =>
                        '🎉 Great work! You completed the arrange-text exercise.',
                ],
            ],
        ];

        $exampleData = [
            'title' => 'Arrange the Python condition',
            'icon' => '🐍',
            'subtitle' =>
                'Drag the pieces within the area until they form the correct Python condition.',
            'items' => [
                ['text' => 'if'],
                ['text' => 'score'],
                ['text' => '>='],
                ['text' => '50'],
                ['text' => ':'],
            ],
            'shuffle_items' => true,
            'correct_message' =>
                '🎉 Perfect! Everything is in the correct order.',
            'incorrect_message' =>
                'Not quite. Compare your order with the correct answer and try again. 💪',
            'complete_message' =>
                '🎉 Great work! You completed the arrange-text exercise.',
        ];

        $templateData = [
            'name' => 'Arrange Text',
            'component' => 'ArrangeTextBlock',
            'icon' => '🔀',
            'description' =>
                'Create an interactive ordering exercise where learners drag text, words, or code pieces within one area to place them in the correct sequence.',
            'tags' => [
                'arrange',
                'ordering',
                'sequence',
                'sorting',
                'drag-drop',
                'practice',
                'interactive',
            ],
            'configuration_schema' => $configurationSchema,
            'example_data' => $exampleData,
            'status' => 'active',
            'position' => 61,
        ];

        if ($template) {
            $template->update($templateData);
            return;
        }

        BlockTemplate::create($templateData);
    }
}
