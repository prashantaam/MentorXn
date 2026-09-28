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
                                'input_type',

                            'label' =>
                                'Input type',

                            'type' =>
                                'select',

                            'required' =>
                                true,

                            'default' =>
                                'text',

                            'options' => [
                                [
                                    'value' =>
                                        'text',

                                    'label' =>
                                        'Text',
                                ],
                                [
                                    'value' =>
                                        'dropdown',

                                    'label' =>
                                        'Dropdown',
                                ],

                                [
                                    'value' =>
                                        'checkbox',

                                    'label' =>
                                        'Checkbox',
                                ],
                            ],
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

                        [
                            'name' =>
                                'options',

                            'label' =>
                                'Dropdown options',

                            'type' =>
                                'textarea',

                            'rows' =>
                                4,

                            'required' =>
                                false,

                            'show_when' => [
                                'field' =>
                                    'input_type',

                                'equals' =>
                                    'dropdown',
                            ],

                            'help' =>
                                'Enter one option per line.',

                            'placeholder' =>
                                "True\nFalse",
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
                        false,

                    'item_label' =>
                        'Action',

                    'min_items' =>
                        0,

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
                                        'logic',

                                    'label' =>
                                        'Logic',
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
                          * LOGIC FUNCTION
                          * -----------------------------
                         */

                        [
                            'name' =>
                                'logic_function',

                            'label' =>
                                'Logic function',

                            'type' =>
                                'select',

                            'required' =>
                                false,

                            'default' =>
                                'and',

                            'show_when' => [
                                'field' =>
                                    'function_type',

                                'equals' =>
                                    'logic',
                            ],

                            'options' => [
                                [
                                    'value' =>
                                        'and',

                                    'label' =>
                                        'AND',
                                ],
                                [
                                    'value' =>
                                        'or',

                                    'label' =>
                                        'OR',
                                ],
                                [
                                    'value' =>
                                        'not',

                                    'label' =>
                                        'NOT',
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


                /*
                 * =====================================
                 * AUTOMATIC CALCULATION
                 *
                 * Used when the teacher does not add
                 * any Action buttons.
                 * =====================================
                 */

                [
                    'name' =>
                        'auto_calculate',

                    'label' =>
                        'Calculate automatically',

                    'type' =>
                        'boolean',

                    'required' =>
                        false,

                    'default' =>
                        false,

                    'help' =>
                        'When enabled, changing a text input, dropdown or checkbox recalculates the result immediately. Action buttons are not required.',
                ],

                [
                    'name' =>
                        'auto_function_type',

                    'label' =>
                        'Automatic function type',

                    'type' =>
                        'select',

                    'required' =>
                        false,

                    'default' =>
                        'logic',

                    'show_when' => [
                        'field' =>
                            'auto_calculate',

                        'equals' =>
                            true,
                    ],

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
                                'logic',

                            'label' =>
                                'Logic',
                        ],
                    ],
                ],

                [
                    'name' =>
                        'auto_function_source',

                    'label' =>
                        'Function source',

                    'type' =>
                        'select',

                    'required' =>
                        false,

                    'default' =>
                        'fixed',

                    'show_when' => [
                        'field' =>
                            'auto_calculate',

                        'equals' =>
                            true,
                    ],

                    'options' => [
                        [
                            'value' =>
                                'fixed',

                            'label' =>
                                'Fixed function',
                        ],
                        [
                            'value' =>
                                'input',

                            'label' =>
                                'Input value',
                        ],
                    ],

                    'help' =>
                        'Choose Fixed when this block always performs one operation. Choose Input value when an input such as a dropdown selects the operation.',
                ],

                [
                    'name' =>
                        'auto_function_name',

                    'label' =>
                        'Fixed function name',

                    'type' =>
                        'text',

                    'required' =>
                        false,

                    'default' =>
                        'and',

                    'show_when' => [
                        'field' =>
                            'auto_function_source',

                        'equals' =>
                            'fixed',
                    ],

                    'help' =>
                        'Used only when Function source is Fixed. Enter the operation this block should always perform, for example add, subtract, and, or or equal.',
                ],

                [
                    'name' =>
                        'auto_function_input',

                    'label' =>
                        'Function input number',

                    'type' =>
                        'text',

                    'required' =>
                        false,

                    'default' =>
                        '2',

                    'show_when' => [
                        'field' =>
                            'auto_function_source',

                        'equals' =>
                            'input',
                    ],

                    'help' =>
                        'Used only when Function source is Input value. Enter which learner input contains the operation: 1 = first input, 2 = second input, etc. For A [operator] B, use 2.',
                ],

                [
                    'name' =>
                        'auto_code_example',

                    'label' =>
                        'Automatic code display',

                    'type' =>
                        'code',

                    'required' =>
                        false,

                    'show_when' => [
                        'field' =>
                            'auto_calculate',

                        'equals' =>
                            true,
                    ],

                    'help' =>
                        'Optional display-only code. Use {{input1}}, {{input2}}, {{input3}} and {{result}}.',
                ],

                [
                    'name' =>
                        'result_view',

                    'label' =>
                        'Result view',

                    'type' =>
                        'textarea',

                    'rows' =>
                        3,

                    'required' =>
                        false,

                    'help' =>
                        'Optional custom result. Supports {{input1}}, {{input2}}, {{result}} plus **bold**, `inline code` and [[label]].',

                    'placeholder' =>
                        'A = **{{input1}}**, B = **{{input3}}** → result = [[{{result}}]]',
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

                    'input_type' =>
                        'text',

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