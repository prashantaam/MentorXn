<?php

namespace Database\Seeders;

use App\Models\LBlockTemplate;
use Illuminate\Database\Seeder;

class CodeActionBlockSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * =============================================
         * FIND OR CREATE TEMPLATE
         * =============================================
         */

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


        /*
         * =============================================
         * TEMPLATE DETAILS
         * =============================================
         */

        $template->name =
            'Code Action';

        $template->component =
            'CodeActionBlock';

        $template->icon =
            '⌨️';

        $template->description =
            'Interactive coding activity where learners enter values and explore programming concepts using configurable action buttons.';

        $template->tags = [
            'code',
            'interactive',
            'practice',
            'python',
            'string',
            'variable',
        ];


        /*
         * =============================================
         * CONFIGURATION SCHEMA
         * =============================================
         */

        $template->configuration_schema = [
            'fields' => [

                /*
                 * =====================================
                 * TITLE
                 * =====================================
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

                    'visual' => [
                        'selector' =>
                            '.code-action-block > h2',

                        'selection_type' =>
                            'field',

                        'group' =>
                            'heading',
                    ],
                ],


                /*
                 * =====================================
                 * ICON
                 * =====================================
                 */

                [
                    'name' =>
                        'icon',

                    'label' =>
                        'Icon',

                    'type' =>
                        'text',

                    'required' =>
                        false,

                    'visual' => [
                        'selector' =>
                            '.code-action-block > h2',

                        'selection_type' =>
                            'field',

                        'group' =>
                            'heading',
                    ],
                ],


                /*
                 * =====================================
                 * INSTRUCTIONS
                 * =====================================
                 */

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

                    'visual' => [
                        'selector' =>
                            '.code-action-block > .sub',

                        'selection_type' =>
                            'field',
                    ],
                ],


                /*
                 * =====================================
                 * INPUTS
                 * =====================================
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

                    'visual' => [
                        'selector' =>
                            '.code-action-field',

                        'selection_type' =>
                            'repeater',

                        'index_attribute' =>
                            'data-visual-index',
                    ],

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
                                'e.g. Your string',
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
                 * =====================================
                 * ACTIONS
                 * =====================================
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

                    'visual' => [
                        'selector' =>
                            '.code-action-option',

                        'selection_type' =>
                            'repeater',

                        'index_attribute' =>
                            'data-visual-index',
                    ],

                    'fields' => [

                        /*
                         * -----------------------------
                         * FUNCTION TYPE
                         * -----------------------------
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

                                [
                                    'value' =>
                                        'create_card',

                                    'label' =>
                                        'Create Card',
                                ],
                            ],
                        ],


                        /*
                         * -----------------------------
                         * STRING FUNCTION
                         * -----------------------------
                         */

                        [
                            'name' =>
                                'string_function',

                            'label' =>
                                'String function',

                            'type' =>
                                'select',

                            'required' =>
                                false,

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
                                        'Append',
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
                         * -----------------------------
                         * NUMBER FUNCTION
                         * -----------------------------
                         */

                        [
                            'name' =>
                                'number_function',

                            'label' =>
                                'Number function',

                            'type' =>
                                'select',

                            'required' =>
                                false,

                            'default' =>
                                'number',

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
                         * -----------------------------
                         * COMPARISON FUNCTION
                         * -----------------------------
                         */

                        [
                            'name' =>
                                'comparison_function',

                            'label' =>
                                'Comparison function',

                            'type' =>
                                'select',

                            'required' =>
                                false,

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
                         * -----------------------------
                         * BUTTON LABEL
                         *
                         * Always visible.
                         * -----------------------------
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
                                'e.g. len(), Assign it, Create',
                        ],


                        /*
                         * -----------------------------
                         * ACTION ARGUMENTS
                         *
                         * String operations can use
                         * these for slice, append etc.
                         * -----------------------------
                         */

                        [
                            'name' =>
                                'arguments',

                            'label' =>
                                'Action arguments',

                            'type' =>
                                'repeater',

                            'required' =>
                                false,

                            'item_label' =>
                                'Argument',

                            'show_when' => [
                                'field' =>
                                    'function_type',

                                'equals' =>
                                    'string',
                            ],

                            'fields' => [

                                [
                                    'name' =>
                                        'value',

                                    'label' =>
                                        'Value',

                                    'type' =>
                                        'text',

                                    'required' =>
                                        false,

                                    'placeholder' =>
                                        'e.g. 0, 5 or 🎉',
                                ],
                            ],
                        ],


                        /*
                         * -----------------------------
                         * CODE DISPLAY
                         *
                         * Also used by Create Card.
                         * -----------------------------
                         */

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
                                'Display-only code. Use {{input1}} for learner input and {{arg1}}, {{arg2}} for action arguments.',

                            'placeholder' =>
                                "text = \"{{input1}}\"\ntext[{{arg1}}:{{arg2}}]",
                        ],
                    ],
                ],

            ],
        ];


        /*
         * =============================================
         * EXAMPLE DATA
         *
         * Keep our working:
         *
         * "Try it on your own text"
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
             * =========================================
             * ONE LEARNER INPUT
             * =========================================
             */

            'inputs' => [

                [
                    'label' =>
                        'Your string',

                    'default_value' =>
                        'Hello, hello',
                ],
            ],


            /*
             * =========================================
             * ACTIONS
             * =========================================
             */

            'actions' => [

                /*
                 * -------------------------------------
                 * len()
                 *
                 * First action = selected by default.
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'length',

                    'label' =>
                        'len()',

                    'arguments' =>
                        [],

                    'code_example' =>
                        "text = \"{{input1}}\"\nlen(text)",
                ],


                /*
                 * -------------------------------------
                 * .upper()
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'uppercase',

                    'label' =>
                        '.upper()',

                    'arguments' =>
                        [],

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext.upper()",
                ],


                /*
                 * -------------------------------------
                 * .lower()
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'lowercase',

                    'label' =>
                        '.lower()',

                    'arguments' =>
                        [],

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext.lower()",
                ],


                /*
                 * -------------------------------------
                 * index [0]
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'first_character',

                    'label' =>
                        'index [0]',

                    'arguments' =>
                        [],

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext[0]",
                ],


                /*
                 * -------------------------------------
                 * slice [0:5]
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'slice',

                    'label' =>
                        'slice [0:5]',

                    'arguments' => [

                        [
                            'value' =>
                                '0',
                        ],

                        [
                            'value' =>
                                '5',
                        ],
                    ],

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext[{{arg1}}:{{arg2}}]",
                ],


                /*
                 * -------------------------------------
                 * + " 🎉"
                 * -------------------------------------
                 */

                [
                    'function_type' =>
                        'string',

                    'string_function' =>
                        'append',

                    'label' =>
                        '+ " 🎉"',

                    'arguments' => [

                        [
                            'value' =>
                                ' 🎉',
                        ],
                    ],

                    'code_example' =>
                        "text = \"{{input1}}\"\ntext + \"{{arg1}}\"",
                ],
            ],

        ];


        /*
         * =============================================
         * TEMPLATE STATUS
         * =============================================
         */

        $template->status =
            'active';

        $template->position =
            80;

        $template->save();
    }
}