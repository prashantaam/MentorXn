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

            'Interactive coding activity where learners enter values and explore programming concepts using configurable action buttons.';



        $template->tags = [

            'code',

            'interactive',

            'practice',

            'python',

            'string',

            'variable',

        ];
$template->configuration_schema = [

            'sections' => [
                [
                    'title' => 'Block Settings',
                    'help' => 'Configure the main block information and message.',
                    'fields' => [
                        'title',
                        'icon',
                        'subtitle',
                    ],
                ],
                [
                    'title' => 'Inputs',
                    'help' => 'Configure the learner inputs used by this activity.',
                    'fields' => [
                        'inputs',
                    ],
                ],
                [
                    'title' => 'Actions',
                    'help' => 'Configure the actions the learner can perform.',
                    'fields' => [
                        'actions',
                    ],
                ],
                [
                    'title' => 'Results',
                    'help' => 'Configure how the result is displayed.',
                    'fields' => [
                        'show_code_display',
                        'code_display',
                        'show_card',
                        'card_format',
                    ],
                ],
            ],

            'fields' => [
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

                                'conditional_function',



                            'label' =>

                                'Conditional function',



                            'type' =>

                                'select',



                            'required' =>

                                false,



                            'default' =>

                                'grade',



                            'show_when' => [

                                'field' =>

                                    'function_type',



                                'equals' =>

                                    'conditional',

                            ],



                            'options' => [

                                [

                                    'value' => 'grade',

                                    'label' => 'Grade',

                                ],

                            ],

                        ],



                        [

                            'name' =>

                                'array_function',



                            'label' =>

                                'Array function',



                            'type' =>

                                'select',



                            'required' =>

                                false,



                            'default' =>

                                'show',



                            'show_when' => [

                                'field' =>

                                    'function_type',



                                'equals' =>

                                    'array',

                            ],



                            'options' => [

                                ['value' => 'show', 'label' => 'Show array'],

                                ['value' => 'append', 'label' => 'Append'],

                                ['value' => 'pop', 'label' => 'Pop'],

                                ['value' => 'get', 'label' => 'Get by index'],

                            ],

                        ],



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

                                        'conditional',



                                    'label' =>

                                        'Conditional / If-Else',

                                ],



                                [

                                    'value' =>

                                        'array',



                                    'label' =>

                                        'Array / List',

                                ],


                                [

                                    'value' =>

                                        'create_card',



                                    'label' =>

                                        'Create Card',

                                ],

                            ],

                        ],
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


                    ],

                ],
[

                    'name' =>

                        'show_code_display',



                    'label' =>

                        'Show code display',



                    'type' =>

                        'boolean',



                    'required' =>

                        false,



                    'default' =>

                        true,

                ],
[

                    'name' =>

                        'code_display',



                    'label' =>

                        'Code display',



                    'type' =>

                        'code',



                    'required' =>

                        false,



                    'show_when' => [

                        'field' =>

                            'show_code_display',

                        'equals' =>

                            true,

                    ],



                    'help' =>

                        'Display-only code shown to the learner. Supports {{input1}}, {{input2}}, {{input3}}, {{arg1}}, {{arg2}} and {{result}}.',



                    'placeholder' =>

                        "text = \"{{input1}}\"",



                ],
[

                    'name' =>

                        'show_card',



                    'label' =>

                        'Show card',



                    'type' =>

                        'boolean',



                    'required' =>

                        false,



                    'default' =>

                        true,

                ],
[

                    'name' =>

                        'card_format',



                    'label' =>

                        'Card format',



                    'type' =>

                        'textarea',



                    'rows' =>

                        4,



                    'required' =>

                        false,



                    'show_when' => [

                        'field' =>

                            'show_card',

                        'equals' =>

                            true,

                    ],



                    'default' =>

                        "{{icon}}\n{{value}}\n{{type}} {{variable}}",



                    'help' =>

                        'Controls the complete card content and line layout. Supports {{icon}}, {{variable}}, {{value}} and {{type}}.',



                    'placeholder' =>

                        "{{icon}}\n{{value}}\n{{type}} {{variable}}",

                ],

            ],

        ];
$template->example_data = [
            'title' => '',
            'icon' => '',
            'subtitle' => '',
            'inputs' => [],
            'actions' => [],
        ];

        $template->status =

            'active';



        $template->position =

            80;



        $template->save();

    }

}