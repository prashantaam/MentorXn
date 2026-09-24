<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class KeyTerminologyBlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LBlockTemplate::updateOrCreate(
            [
                'name' => 'Key Terminology',
                'component' => 'FlipCardsBlock',
            ],
            [
                'icon' => '🃏',

                'description' =>
                    'Interactive flip cards for learning key terms, concepts and definitions.',

                'tags' => [
                    'terminology',
                    'flashcards',
                    'interactive',
                ],

                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
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
                            'label' => 'Subtitle',
                            'type' => 'textarea',
                            'required' => false,
                        ],
                        [
                            'name' => 'cards',
                            'label' => 'Cards',
                            'type' => 'repeater',
                            'item_label' => 'Card',
                            'required' => true,
                            'min_items' => 1,

                            'fields' => [
                                [
                                    'name' => 'icon',
                                    'label' => 'Icon',
                                    'type' => 'text',
                                    'required' => false,
                                ],
                                [
                                    'name' => 'front',
                                    'label' => 'Front',
                                    'type' => 'text',
                                    'required' => true,
                                ],
                                [
                                    'name' => 'back',
                                    'label' => 'Back',
                                    'type' => 'textarea',
                                    'required' => true,
                                ],
                            ],
                        ],
                    ],
                ],

                'example_data' => [
                    'title' =>
                        'Key Terminology',

                    'icon' =>
                        '🃏',

                    'subtitle' =>
                        'Click each card to reveal its meaning.',

                    'cards' => [
                        [
                            'icon' => '⚛️',
                            'front' => 'Component',
                            'back' =>
                                'A reusable piece of a React user interface.',
                        ],
                        [
                            'icon' => '📦',
                            'front' => 'Props',
                            'back' =>
                                'Data passed from a parent component to a child component.',
                        ],
                        [
                            'icon' => '🧠',
                            'front' => 'State',
                            'back' =>
                                'Data managed by a component that can change over time.',
                        ],
                        [
                            'icon' => '🪝',
                            'front' => 'Hook',
                            'back' =>
                                'A React function such as useState that provides access to React features.',
                        ],
                    ],
                ],

                'status' => 'active',

                'position' => 20,
            ]
        );
    }
}