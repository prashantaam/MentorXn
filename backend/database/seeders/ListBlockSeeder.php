<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "List block": rows of title · subtitle · details (details expand
 * from an arrow on the title), optional numbering, thin lines
 * between rows and an optional "See: <link>" at the bottom.
 *
 * Frontend: ListBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=ListBlockSeeder
 */
class ListBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'content')->value('id');

        // Was "Reference list" (ReferenceListBlock): rename that row,
        // keeping its id, instead of adding a second template.
        BlockTemplate::where('component', 'ReferenceListBlock')
            ->update(['component' => 'ListBlock']);

        BlockTemplate::updateOrCreate(
            ['component' => 'ListBlock'],
            [
                'name' => 'List block',
                'icon' => '📋',
                'description' => 'A list of rows — each a title with an optional subtitle and expandable details — optionally numbered, with an optional "See:" link at the bottom. Great for cheat sheets, key points and attribute lists.',
                'block_category_id' => $categoryId,
                'tags' => ['reference', 'cheat sheet', 'glossary', 'table', 'list', 'attributes'],
                'status' => 'active',
                'position' => 17,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'List block',
                            'required' => true,
                            'visual' => [
                                'selector' => '.list-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '📋',
                            'required' => false,
                            'visual' => [
                                'selector' => '.list-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'textarea',
                            'rows' => 2,
                            'required' => false,
                            'placeholder' => 'Optional — a line above the list.',
                            'visual' => [
                                'selector' => '.list-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'rows',
                            'label' => 'Rows',
                            'type' => 'repeater',
                            'required' => true,
                            'min_items' => 1,
                            'item_label' => 'Row',
                            'visual' => [
                                'selector' => '.list-block__row',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'icon',
                                    'label' => 'Icon (optional)',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. 🧩',
                                    'help' => 'Shown when the list style is Icons. Leave empty to use the default icon.',
                                ],
                                [
                                    'name' => 'title',
                                    'label' => 'Title',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. [[g:colspan]] Number of columns a cell should span',
                                    'help' => 'Supports **bold**, `code` and labels like [[g:colspan]].',
                                ],
                                [
                                    'name' => 'subtitle',
                                    'label' => 'Subtitle (optional)',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'A short line in smaller text under the title',
                                ],
                                [
                                    'name' => 'details',
                                    'label' => 'Details (optional)',
                                    'type' => 'textarea',
                                    'rows' => 3,
                                    'required' => false,
                                    'help' => 'When filled in, the title gets an arrow — students click it to expand and read this.',
                                ],
                            ],
                        ],
                        [
                            'name' => 'list_style',
                            'label' => 'List style',
                            'type' => 'select',
                            'required' => false,
                            'default' => 'plain',
                            'options' => [
                                ['value' => 'plain', 'label' => 'Plain'],
                                ['value' => 'numbered', 'label' => 'Auto numbering (1, 2, 3…)'],
                                ['value' => 'icons', 'label' => 'Icons'],
                            ],
                            'help' => 'Icons: each row shows its own icon, or the default icon below.',
                        ],
                        [
                            'name' => 'default_icon',
                            'label' => 'Default icon',
                            'type' => 'text',
                            'required' => false,
                            'default' => '✅',
                            'placeholder' => 'e.g. ✅, 👉, ⭐',
                            'help' => 'Used for rows that don\'t have their own icon.',
                            'show_when' => [
                                'field' => 'list_style',
                                'equals' => 'icons',
                            ],
                        ],
                        [
                            'name' => 'see_label',
                            'label' => '"See:" link text (optional)',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. td#Attributes',
                            'help' => 'Shown at the bottom as "See: …". Leave empty for no footer.',
                            'visual' => [
                                'selector' => '.list-block__footer',
                            ],
                        ],
                        [
                            'name' => 'see_url',
                            'label' => '"See:" link address (optional)',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'https://developer.mozilla.org/…',
                            'help' => 'Must start with https://, http:// or mailto:. Opens in a new tab.',
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => '<td> attributes',
                    'icon' => '📋',
                    'subtitle' => '',
                    'rows' => [
                        [
                            'title' => '[[g:colspan]] Number of columns a cell should span',
                            'subtitle' => 'Default: 1',
                            'details' => 'Use it to merge cells across columns, e.g. a heading that spans the whole table: `<td colspan="3">`.',
                        ],
                        [
                            'title' => '[[g:headers]] One or more header cells a cell is related to',
                            'subtitle' => '',
                            'details' => '',
                        ],
                        [
                            'title' => '[[g:rowspan]] Number of rows a cell should span',
                            'subtitle' => 'Default: 1',
                            'details' => '',
                        ],
                    ],
                    'list_style' => 'plain',
                    'default_icon' => '✅',
                    'see_label' => 'td#Attributes',
                    'see_url' => 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td#attributes',
                ],
            ]
        );
    }
}
