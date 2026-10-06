<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "Live sentence builder" block (the Block Library's "Live template
 * builder"): students fill in a few fields and watch them drop into
 * a sentence template in real time.
 *
 * Frontend: SentenceBuilderBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=SentenceBuilderBlockSeeder
 */
class SentenceBuilderBlockSeeder extends Seeder
{
    public function run(): void
    {
        $contentCategoryId = BlockCategory::where('slug', 'content')->value('id');

        BlockTemplate::updateOrCreate(
            ['component' => 'SentenceBuilderBlock'],
            [
                'name' => 'Live sentence builder',
                'icon' => '🧵',
                'description' => 'Fill in a few fields and watch them drop into a sentence in real time — the pattern behind user-story builders and template-literal lessons.',
                'block_category_id' => $contentCategoryId,
                'tags' => ['sentence', 'template', 'fill in', 'interactive', 'user story'],
                'status' => 'active',
                'position' => 14,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'Live sentence builder',
                            'required' => true,
                            'visual' => [
                                'selector' => '.sentence-builder-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '🧵',
                            'required' => false,
                            'visual' => [
                                'selector' => '.sentence-builder-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Fill in the boxes and watch your sentence appear.',
                            'visual' => [
                                'selector' => '.sentence-builder-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'template',
                            'label' => 'Sentence',
                            'type' => 'textarea',
                            'required' => true,
                            'rows' => 3,
                            'placeholder' => '**As a** {{who}}, **I want** {{what}}.',
                            'help' => 'Put {{key}} where each field\'s answer goes — the key must match a field below. Supports **bold** and `code`.',
                            'visual' => [
                                'selector' => '.sentence-builder-block__output',
                            ],
                        ],
                        [
                            'name' => 'fields',
                            'label' => 'Fields',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Field',
                            'visual' => [
                                'selector' => '.sentence-builder-block__field',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'key',
                                    'label' => 'Key',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. who',
                                    'help' => 'Letters, numbers, - or _. Used as {{key}} in the sentence.',
                                ],
                                [
                                    'name' => 'label',
                                    'label' => 'Label',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'Shown above the box, e.g. Who',
                                ],
                                [
                                    'name' => 'placeholder',
                                    'label' => 'Hint',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'Grey hint inside the empty box',
                                ],
                                [
                                    'name' => 'default',
                                    'label' => 'Starting value',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'Pre-filled answer (optional)',
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Build a user story',
                    'icon' => '🧵',
                    'subtitle' => 'Fill in the boxes and watch your user story appear.',
                    'template' => '**As a** {{who}}, **I want** {{what}} **so that** {{why}}.',
                    'fields' => [
                        ['key' => 'who', 'label' => 'Who', 'placeholder' => 'a type of user', 'default' => 'shopper'],
                        ['key' => 'what', 'label' => 'Wants', 'placeholder' => 'something to do', 'default' => 'to save items for later'],
                        ['key' => 'why', 'label' => 'So that', 'placeholder' => 'the benefit', 'default' => ''],
                    ],
                ],
            ]
        );
    }
}
