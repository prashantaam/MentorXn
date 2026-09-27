<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class CodeActionBlockSeeder extends Seeder
{
    public function run(): void
    {
        $template = LBlockTemplate::query()
            ->where(
                'component',
                'CodeActionBlock'
            )
            ->orWhere(
                'name',
                'Code Action'
            )
            ->first();

        if (!$template) {
            $template =
                new LBlockTemplate();
        }

        $template->name =
            'Code Action';

        $template->component =
            'CodeActionBlock';

        $template->icon =
            '⌨️';

        $template->description =
            'Interactive concept activity with learner inputs, configurable functions, dynamic code display and action buttons.';

        $template->tags = [
            'code',
            'interactive',
            'practice',
            'function',
            'concept',
        ];


        $template->configuration_schema = [
            'fields' => [

                /*
                 * =============================================
                 * GENERAL
                 * =============================================
                 */

                [
                    'name' =>
                        'title',

                    'label' =>
                        'Block title',

                    'type' =>
                        'text',

                    'required' =>
                        true,
                ],

                [
                    'name' =>
                        'icon',

                    'label' =>
                        'Icon',

                    'type' =>
                        'text',

                    'required' =>
                        false,
                ],

                [
                    'name' =>
                        'subtitle',

                    'label' =>
                        'Instructions',

                    'type' =>
                        'textarea',

                    'rows' =>
                        3,

                    'required' =>
                        false,
                ],


                /*
                 * =============================================
                 * INPUTS
                 * =============================================
                 */

                [
                    'name' =>
                        'inputs',

                    'label' =>
                        'Inputs',

                    'type' =>
                        'repeater',

                    'required' =>
                        true,

                    'item_label' =>
                        'Input',

                    'min_items' =>
                        1,

                    'fields' => [

                        [
                            'name' =>
                                'label',

                            'label' =>
                                'Label',

                            'type' =>
                                'text',

                            'required' =>
                                true,

                            'placeholder' =>
                                'e.g. Your text',
                        ],

                        [
                            'name' =>
                                'default_value',

                            'label' =>
                                'Default value',

                            'type' =>
                                'text',

                            'required' =>
                                false,

                            'placeholder' =>
                                'e.g. Hello, hello',
                        ],
                    ],
                ],


                /*
                 * =============================================
                 * ACTIONS
                 * =============================================
                 */

                [
                    'name' =>
                        'actions',

                    'label' =>
                        'Actions',

                    'type' =>
                        'repeater',

                    'required' =>
                        true,

                    'item_label' =>
                        'Action',

                    'min_items' =>
                        1,

                    'fields' => [

                        /*
                         * Function Type
                         */

                        [
                            'name' =>
                                'function_type',

                            'label' =>
                                'Function type',

                            'type' =>
                                'select',

                            'required' =>
                                true,

                            'default' =>
                                'string',

                            'options' => [
                                [
                                    'value' =>
                                        'string',

                                    'label' =>
                                        'Text / String',
                                ],

                                [
                                    'value' =>
                                        'number',

                                    'label' =>
                                        'Number',
                                ],

                                [
                                    'value' =>
                                        'comparison',

                                    'label' =>
                                        'Comparison',
                                ],
                            ],
                        ],


                        /*
                         * =====================================
                         * TEXT / STRING
                         * =====================================
                         */

                        [
                            'name' =>
                                'string_function',

                            'label' =>
                                'Function',

                            'type' =>
                                'select',

                            'required' =>
                                true,

                            'default' =>
                                'length',

                            'show_when' => [
                                'field' =>
                                    'function_type',

                                'equals' =>
                                    'string',
                            ],

                            'options' => [

                                [
                                    'value' =>
                                        'input',

                                    'label' =>
                                        'Show value',
                                ],

                                [
                                    'value' =>
                                        'length',

                                    'label' =>
                                        'Length',
                                ],

                                [
                                    'value' =>
                                        'uppercase',

                                    'label' =>
                                        'Uppercase',
                                ],

                                [
                                    'value' =>
                                        'lowercase',

                                    'label' =>
                                        'Lowercase',
                                ],

                                [
                                    'value' =>
                                        'capitalize',

                                    'label' =>
                                        'Capitalise',
                                ],

                                [
                                    'value' =>
                                        'title_case',

                                    'label' =>
                                        'Title case',
                                ],

                                [
                                    'value' =>
                                        'trim',

                                    'label' =>
                                        'Trim whitespace',
                                ],

                                [
                                    'value' =>
                                        'trim_start',

                                    'label' =>
                                        'Trim start',
                                ],

                                [
                                    'value' =>
                                        'trim_end',

                                    'label' =>
                                        'Trim end',
                                ],

                                [
                                    'value' =>
                                        'first_character',

                                    'label' =>
                                        'First character',
                                ],

                                [
                                    'value' =>
                                        'last_character',

                                    'label' =>
                                        'Last character',
                                ],

                                [
                                    'value' =>
                                        'reverse',

                                    'label' =>
                                        'Reverse',
                                ],

                                [
                                    'value' =>
                                        'slice',

                                    'label' =>
                                        'Slice',
                                ],

                                [
                                    'value' =>
                                        'append',

                                    'label' =>
                                        'Append string',
                                ],

                                [
                                    'value' =>
                                        'contains',

                                    'label' =>
                                        'Contains',
                                ],

                                [
                                    'value' =>
                                        'starts_with',

                                    'label' =>
                                        'Starts with',
                                ],

                                [
                                    'value' =>
                                        'ends_with',

                                    'label' =>
                                        'Ends with',
                                ],

                                [
                                    'value' =>
                                        'replace',

                                    'label' =>
                                        'Replace',
                                ],

                                [
                                    'value' =>
                                        'count',

                                    'label' =>
                                        'Count occurrences',
                                ],

                                [
                                    'value' =>
                                        'find',

                                    'label' =>
                                        'Find position',
                                ],

                                [
                                    'value' =>
                                        'is_empty',

                                    'label' =>
                                        'Is empty',
                                ],

                                [
                                    'value' =>
                                        'is_alpha',

                                    'label' =>
                                        'Letters only',
                                ],

                                [
                                    'value' =>
                                        'is_digit',

                                    'label' =>
                                        'Digits only',
                                ],

                                [
                                    'value' =>
                                        'is_alphanumeric',

                                    'label' =>
                                        'Letters and numbers only',
                                ],

                                [
                                    'value' =>
                                        'repeat',

                                    'label' =>
                                        'Repeat',
                                ],
                            ],
                        ],


                        /*
                         * =====================================
                         * NUMBER
                         * =====================================
                         */

                        [
                            'name' =>
                                'number_function',

                            'label' =>
                                'Function',

                            'type' =>
                                'select',

                            'required' =>
                                true,

                            'default' =>
                                'add',

                            'show_when' => [
                                'field' =>
                                    'function_type',

                                'equals' =>
                                    'number',
                            ],

                            'options' => [

                                [
                                    'value' =>
                                        'number',

                                    'label' =>
                                        'Show number',
                                ],

                                [
                                    'value' =>
                                        'add',

                                    'label' =>
                                        'Add',
                                ],

                                [
                                    'value' =>
                                        'subtract',

                                    'label' =>
                                        'Subtract',
                                ],

                                [
                                    'value' =>
                                        'multiply',

                                    'label' =>
                                        'Multiply',
                                ],

                                [
                                    'value' =>
                                        'divide',

                                    'label' =>
                                        'Divide',
                                ],

                                [
                                    'value' =>
                                        'modulus',

                                    'label' =>
                                        'Remainder',
                                ],

                                [
                                    'value' =>
                                        'power',

                                    'label' =>
                                        'Power',
                                ],

                                [
                                    'value' =>
                                        'floor_divide',

                                    'label' =>
                                        'Floor division',
                                ],

                                [
                                    'value' =>
                                        'absolute',

                                    'label' =>
                                        'Absolute value',
                                ],

                                [
                                    'value' =>
                                        'round',

                                    'label' =>
                                        'Round',
                                ],

                                [
                                    'value' =>
                                        'floor',

                                    'label' =>
                                        'Round down',
                                ],

                                [
                                    'value' =>
                                        'ceil',

                                    'label' =>
                                        'Round up',
                                ],

                                [
                                    'value' =>
                                        'minimum',

                                    'label' =>
                                        'Minimum',
                                ],

                                [
                                    'value' =>
                                        'maximum',

                                    'label' =>
                                        'Maximum',
                                ],

                                [
                                    'value' =>
                                        'square',

                                    'label' =>
                                        'Square',
                                ],

                                [
                                    'value' =>
                                        'cube',

                                    'label' =>
                                        'Cube',
                                ],

                                [
                                    'value' =>
                                        'square_root',

                                    'label' =>
                                        'Square root',
                                ],

                                [
                                    'value' =>
                                        'increment',

                                    'label' =>
                                        'Increment',
                                ],

                                [
                                    'value' =>
                                        'decrement',

                                    'label' =>
                                        'Decrement',
                                ],

                                [
                                    'value' =>
                                        'percentage',

                                    'label' =>
                                        'Percentage',
                                ],
                            ],
                        ],


                        /*
                         * =====================================
                         * COMPARISON
                         * =====================================
                         */

                        [
                            'name' =>
                                'comparison_function',

                            'label' =>
                                'Function',

                            'type' =>
                                'select',

                            'required' =>
                                true,

                            'default' =>
                                'equal',

                            'show_when' => [
                                'field' =>
                                    'function_type',

                                'equals' =>
                                    'comparison',
                            ],

                            'options' => [

                                [
                                    'value' =>
                                        'equal',

                                    'label' =>
                                        'Equal',
                                ],

                                [
                                    'value' =>
                                        'not_equal',

                                    'label' =>
                                        'Not equal',
                                ],

                                [
                                    'value' =>
                                        'greater_than',

                                    'label' =>
                                        'Greater than',
                                ],

                                [
                                    'value' =>
                                        'greater_or_equal',

                                    'label' =>
                                        'Greater than or equal',
                                ],

                                [
                                    'value' =>
                                        'less_than',

                                    'label' =>
                                        'Less than',
                                ],

                                [
                                    'value' =>
                                        'less_or_equal',

                                    'label' =>
                                        'Less than or equal',
                                ],
                            ],
                        ],


                        /*
                         * =====================================
                         * PRESENTATION
                         * =====================================
                         */

                        [
                            'name' =>
                                'label',

                            'label' =>
                                'Button label',

                            'type' =>
                                'text',

                            'required' =>
                                true,

                            'placeholder' =>
                                'e.g. Length',
                        ],

                        [
                            'name' =>
                                'code_example',

                            'label' =>
                                'Code display',

                            'type' =>
                                'code',

                            'required' =>
                                false,

                            'help' =>
                                'Optional display-only code. Learner values are inserted dynamically using {{input1}}, {{input2}}, {{input3}} and {{result}}.',

                            'placeholder' =>
                                "e.g.\ntext = \"{{input1}}\"\nlen(text)",
                        ],
                    ],
                ],
            ],
        ];


        /*
         * =============================================
         * EXAMPLE
         * =============================================
         */

        $template->example_data = [

            'title' =>
                'Try it on your own text',

            'icon' =>
                '🔤',

            'subtitle' =>
                '',

            /*
             * We use three inputs in the example so
             * Slice and Append can also be demonstrated.
             *
             * Other functions simply ignore the extra
             * values they do not need.
             */

            'inputs' => [

                [
                    'label' =>
                        'Your string',

                    'default_value' =>
                        'Hello, hello',
                ],

                [
                    'label' =>
                        'Start / second value',

                    'default_value' =>
                        '0',
                ],

                [
                    'label' =>
                        'End / third value',

                    'default_value' =>
                        '5',
                ],
            ],

            'actions' => [

                /*
                 * Length
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'length',

                    'label' =>
                        'len()',

                    'code_example' =>
                        "text = \"{{input1}}\"\nlen(text)",
                ],


                /*
                 * Uppercase
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'uppercase',

                    'label' =>
                        '.upper()',

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext.upper()",
                ],


                /*
                 * Lowercase
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'lowercase',

                    'label' =>
                        '.lower()',

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext.lower()",
                ],


                /*
                 * First Character
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'first_character',

                    'label' =>
                        'index [0]',

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext[0]",
                ],


                /*
                 * Slice
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'slice',

                    'label' =>
                        'slice',

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext[{{input2}}:{{input3}}]",
                ],


                /*
                 * Append
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'append',

                    'label' =>
                        'append',

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext + \"{{input2}}\"",
                ],
            ],
        ];


        $template->status =
            'active';

        $template->position =
            80;

        $template->save();
    }
}