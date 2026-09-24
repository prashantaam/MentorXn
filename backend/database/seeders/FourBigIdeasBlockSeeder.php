<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class FourBigIdeasBlockSeeder extends Seeder
{
    public function run(): void
    {
        LBlockTemplate::updateOrCreate(
            [
                'name' => 'Four Big Ideas',
                'component' => 'ChipSelectorBlock',
            ],
            [
                'icon' => '💡',
                'description' => 'Four selectable ideas. Students choose an idea to reveal its explanation.',
                'tags' => [
                    'concepts',
                    'interactive',
                    'reveal',
                ],
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Block title',
                            'type' => 'text',
                            'required' => true,
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'required' => false,
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'textarea',
                            'required' => false,
                        ],
                        [
                            'name' => 'items',
                            'label' => 'Ideas',
                            'type' => 'repeater',
                            'required' => true,
                            'item_label' => 'Idea',
                            'min_items' => 1,
                            'fields' => [
                                [
                                    'name' => 'label',
                                    'label' => 'Idea label',
                                    'type' => 'text',
                                    'required' => true,
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
                ],
                'example_data' => [
                    'title' => 'Four Big Ideas',
                    'icon' => '💡',
                    'subtitle' => 'Select an idea to explore it.',
                    'items' => [
                        [
                            'label' => 'Idea 1',
                            'content' => 'Explain the first big idea here.',
                        ],
                        [
                            'label' => 'Idea 2',
                            'content' => 'Explain the second big idea here.',
                        ],
                        [
                            'label' => 'Idea 3',
                            'content' => 'Explain the third big idea here.',
                        ],
                        [
                            'label' => 'Idea 4',
                            'content' => 'Explain the fourth big idea here.',
                        ],
                    ],
                ],
                'status' => 'active',
                'position' => 10,
            ]
        );
    }
}
