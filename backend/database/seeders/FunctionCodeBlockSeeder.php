<?php

namespace Database\Seeders;

use App\Models\BlockCategory;
use App\Models\BlockTemplate;
use Illuminate\Database\Seeder;

/**
 * "FunctionCode" block: a reusable Code Quest-style code playground.
 *
 * The teacher picks a kind:
 *   - string:   string methods on the student's own text
 *               ("Try it on your own text")
 *   - number:   number operators and functions
 *   - array:    a list students change ("The toy list")
 *   - custom:   the teacher's own functions ("Try the machines":
 *               add(), greet(), is_even(), print_stars())
 *
 * Code follows the chosen language (Python or JavaScript); results
 * come from a safe built-in interpreter (frontend
 * lib/functionCode/expression.js), never eval().
 *
 * This replaces the old "Code Action" template: the same database
 * record (component CodeActionBlock) is renamed, not duplicated.
 *
 * Frontend: FunctionCodeBlock (component). Messages are added to
 * every block by the editor (SharedBlockConfig.js).
 *
 *   php artisan db:seed --class=FunctionCodeBlockSeeder
 */
class FunctionCodeBlockSeeder extends Seeder
{
    public function run(): void
    {
        $categoryId = BlockCategory::where('slug', 'code')->value('id');


        $show = fn (string $kind) => ['field' => 'kind', 'equals' => $kind];

        // Rename the old Code Action template instead of creating a second one.
        $template = BlockTemplate::query()
            ->whereIn('component', ['FunctionCodeBlock', 'CodeActionBlock'])
            ->first() ?? new BlockTemplate();

        $template->fill(
            [
                'component' => 'FunctionCodeBlock',
                'name' => 'FunctionCode',
                'icon' => '⚡',
                'description' => 'A code playground for string functions, number functions, arrays / lists, or your own custom functions (like add(), greet(), is_even()). Students change the inputs and see the code and its result live, in Python or JavaScript.',
                'block_category_id' => $categoryId,
                'tags' => ['code', 'functions', 'strings', 'numbers', 'arrays', 'lists', 'python', 'javascript'],
                'status' => 'active',
                'position' => 27,
                'configuration_schema' => [
                    'fields' => [
                        [
                            'name' => 'title',
                            'label' => 'Title',
                            'type' => 'text',
                            'default' => 'FunctionCode',
                            'required' => true,
                            'visual' => [
                                'selector' => '.function-code-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'icon',
                            'label' => 'Icon',
                            'type' => 'text',
                            'default' => '⚡',
                            'required' => false,
                            'visual' => [
                                'selector' => '.function-code-block > h2',
                                'group' => 'heading',
                            ],
                        ],
                        [
                            'name' => 'subtitle',
                            'label' => 'Instructions',
                            'type' => 'text',
                            'required' => false,
                            'placeholder' => 'e.g. Type your own text, then try each method.',
                            'visual' => [
                                'selector' => '.function-code-block > .sub',
                            ],
                        ],
                        [
                            'name' => 'kind',
                            'label' => 'What it shows',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'string',
                            'options' => [
                                ['value' => 'string', 'label' => 'String functions (e.g. .upper(), len())'],
                                ['value' => 'number', 'label' => 'Number functions (e.g. round(), abs(), %)'],
                                ['value' => 'array', 'label' => 'Array / list (e.g. append(), pop(), toys[index])'],
                                ['value' => 'custom', 'label' => 'Custom functions (e.g. add(), greet(), is_even())'],
                            ],
                        ],
                        [
                            'name' => 'language',
                            'label' => 'Language',
                            'type' => 'select',
                            'required' => true,
                            'default' => 'python',
                            'help' => 'Changes how results look and behave: \'hi\' vs "hi", True vs true, IndexError vs undefined, 6 / 2 = 3.0 vs 3.',
                            'options' => [
                                ['value' => 'python', 'label' => 'Python'],
                                ['value' => 'javascript', 'label' => 'JavaScript'],
                            ],
                        ],

                        /* ---------- String functions ---------- */
                        [
                            'name' => 'string_value',
                            'label' => 'Starting text',
                            'type' => 'text',
                            'default' => 'Hello, kids!',
                            'required' => false,
                            'show_when' => $show('string'),
                        ],
                        [
                            'name' => 'string_methods',
                            'label' => 'Methods to show',
                            'type' => 'text',
                            'default' => 'length, upper, lower, first, slice, concat',
                            'required' => false,
                            'help' => 'Comma separated, in order. Choose from: length, upper, lower, strip, title (Python only), first, last, slice, concat, reverse, replace, includes, find, count, split, repeat.',
                            'show_when' => $show('string'),
                        ],

                        /* ---------- Number functions ---------- */
                        [
                            'name' => 'number_a',
                            'label' => 'Starting a',
                            'type' => 'number',
                            'default' => 7,
                            'required' => false,
                            'show_when' => $show('number'),
                        ],
                        [
                            'name' => 'number_b',
                            'label' => 'Starting b',
                            'type' => 'number',
                            'default' => 2,
                            'required' => false,
                            'help' => 'Only used by methods that take two numbers.',
                            'show_when' => $show('number'),
                        ],
                        [
                            'name' => 'number_methods',
                            'label' => 'Methods to show',
                            'type' => 'text',
                            'default' => 'add, subtract, multiply, divide, modulo, power, round, abs',
                            'required' => false,
                            'help' => 'Comma separated, in order. Choose from: add, subtract, multiply, divide, floor_divide, modulo, power, max, min, abs, round, floor, ceil, sqrt, int, str, type.',
                            'show_when' => $show('number'),
                        ],

                        /* ---------- Array / list ---------- */
                        [
                            'name' => 'list_name',
                            'label' => 'List name',
                            'type' => 'text',
                            'default' => 'toys',
                            'required' => false,
                            'help' => 'Letters, numbers and _ only.',
                            'show_when' => $show('array'),
                        ],
                        [
                            'name' => 'list_items',
                            'label' => 'Starting items',
                            'type' => 'text',
                            'default' => 'Robot, Teddy, Kite',
                            'required' => false,
                            'help' => 'Comma separated.',
                            'show_when' => $show('array'),
                        ],
                        [
                            'name' => 'list_item',
                            'label' => 'Starting new item',
                            'type' => 'text',
                            'default' => 'Duck',
                            'required' => false,
                            'help' => 'What the "Item" box starts with (for append, remove, in…).',
                            'show_when' => $show('array'),
                        ],
                        [
                            'name' => 'list_methods',
                            'label' => 'Buttons to show',
                            'type' => 'text',
                            'default' => 'append, pop, get',
                            'required' => false,
                            'help' => 'Comma separated, in order. Choose from: append, prepend, pop, pop_first, remove, get (list[index]), length, includes, index_of, sort, reverse, reset.',
                            'show_when' => $show('array'),
                        ],

                        /* ---------- Custom functions ---------- */
                        [
                            'name' => 'functions',
                            'label' => 'Functions',
                            'type' => 'repeater',
                            'required' => false,
                            'item_label' => 'Function',
                            'help' => 'Each function becomes a chip with its own inputs.',
                            'show_when' => $show('custom'),
                            'visual' => [
                                'selector' => '.function-code-block__fn',
                                'selection_type' => 'repeater',
                                'index_attribute' => 'data-visual-index',
                            ],
                            'fields' => [
                                [
                                    'name' => 'name',
                                    'label' => 'Name',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. add',
                                ],
                                [
                                    'name' => 'params',
                                    'label' => 'Parameters',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. a, b',
                                    'help' => 'Comma separated.',
                                ],
                                [
                                    'name' => 'defaults',
                                    'label' => 'Starting values',
                                    'type' => 'text',
                                    'required' => false,
                                    'placeholder' => 'e.g. 3, 4',
                                    'help' => 'One per parameter. Numbers get a number box; anything else is text.',
                                ],
                                [
                                    'name' => 'body',
                                    'label' => 'Function body (code shown)',
                                    'type' => 'code',
                                    'required' => false,
                                    'rows' => 3,
                                    'placeholder' => 'return a + b',
                                    'help' => 'Written in the chosen language. It is indented for you.',
                                ],
                                [
                                    'name' => 'result',
                                    'label' => 'What it returns (formula)',
                                    'type' => 'text',
                                    'required' => true,
                                    'placeholder' => 'e.g. a + b  ·  "Hello, " + name + "!"  ·  number % 2 == 0',
                                    'help' => 'The same as the body, written as a formula so students see the real result.',
                                ],
                                [
                                    'name' => 'output',
                                    'label' => 'Show the result as',
                                    'type' => 'select',
                                    'required' => true,
                                    'default' => 'value',
                                    'options' => [
                                        ['value' => 'value', 'label' => 'A returned value (result = …)'],
                                        ['value' => 'printed', 'label' => 'Printed output (no return)'],
                                    ],
                                ],
                                [
                                    'name' => 'note',
                                    'label' => 'Note (optional)',
                                    'type' => 'text',
                                    'required' => false,
                                ],
                            ],
                        ],
                    ],
                ],
                'example_data' => [
                    'title' => 'Try it on your own text',
                    'icon' => '🔤',
                    'subtitle' => 'Type your own text, then try each method.',
                    'kind' => 'string',
                    'language' => 'python',

                    // String functions
                    'string_value' => 'Hello, kids!',
                    'string_methods' => 'length, upper, lower, first, slice, concat',

                    // Number functions
                    'number_a' => 7,
                    'number_b' => 2,
                    'number_methods' => 'add, subtract, multiply, divide, modulo, power, round, abs',

                    // Array / list ("The toy list")
                    'list_name' => 'toys',
                    'list_items' => 'Robot, Teddy, Kite',
                    'list_item' => 'Duck',
                    'list_methods' => 'append, pop, get',

                    // Custom functions ("Try the machines")
                    'functions' => [
                        ['name' => 'add', 'params' => 'a, b', 'defaults' => '3, 4', 'body' => 'return a + b', 'result' => 'a + b', 'output' => 'value', 'note' => ''],
                        ['name' => 'greet', 'params' => 'name', 'defaults' => 'Ava', 'body' => 'return f"Hello, {name}!"', 'result' => '"Hello, " + name + "!"', 'output' => 'value', 'note' => ''],
                        ['name' => 'is_even', 'params' => 'number', 'defaults' => '8', 'body' => 'return number % 2 == 0', 'result' => 'number % 2 == 0', 'output' => 'value', 'note' => ''],
                        ['name' => 'print_stars', 'params' => 'count', 'defaults' => '5', 'body' => "print('⭐' * count)", 'result' => 'repeat("⭐", count)', 'output' => 'printed', 'note' => 'This function has no return statement — it just does something and gives nothing back.'],
                    ],
                ],
            ]
        );

        $template->save();
    }
}
